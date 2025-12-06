using dotenv.net;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.EntityFrameworkCore;
using Serilog;
using Serilog.Events;
using Gixat.Web.Data;
using Gixat.Web.Middleware;
using Gixat.Web.Shared.Options;
using System.IO.Compression;
using Gixat.Web.Modules.Auth;
using Gixat.Web.Modules.Auth.Entities;
using Gixat.Web.Modules.Clients;
using Gixat.Web.Modules.Clients.GraphQL.Queries;
using Gixat.Web.Modules.Clients.GraphQL.Types;
using Gixat.Web.Modules.Companies;
using Gixat.Web.Modules.Companies.GraphQL.Queries;
using Gixat.Web.Modules.Companies.GraphQL.Mutations;
using Gixat.Web.Modules.Companies.GraphQL.Types;
using Gixat.Web.Modules.Users;
using Gixat.Web.Modules.Users.GraphQL.Queries;
using Gixat.Web.Modules.Users.GraphQL.Mutations;
using Gixat.Web.Modules.Users.GraphQL.Types;
using Gixat.Web.Modules.Sessions;
using Gixat.Web.Modules.Sessions.GraphQL.Queries;
using Gixat.Web.Modules.Sessions.GraphQL.Mutations;
using Gixat.Web.Modules.Sessions.GraphQL.Types;
using Gixat.Web.Modules.Sessions.Services;
using Gixat.Web.Modules.Appointments;
using Gixat.Web.Modules.Invoices;
using Gixat.Web.Modules.Inventory;
using Gixat.Web.Shared.Interfaces;
using Gixat.Web.Shared.Services;
using Gixat.Web.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using HealthChecks.UI.Client;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;

// Load environment variables from .env file
DotEnv.Load(options: new DotEnvOptions(probeForEnv: true, probeLevelsToSearch: 5));

var builder = WebApplication.CreateBuilder(args);

// ====================================
// CONFIGURE SERILOG (Structured Logging)
// ====================================
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Debug()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Information)
    .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
    .MinimumLevel.Override("Microsoft.EntityFrameworkCore", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .Enrich.WithProperty("Application", "Gixat")
    .WriteTo.Console(
        outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {SourceContext}{NewLine}{Message:lj}{NewLine}{Exception}")
    .WriteTo.File(
        path: "logs/gixat-.log",
        rollingInterval: RollingInterval.Day,
        retainedFileCountLimit: 30,
        outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {SourceContext} {Message:lj}{NewLine}{Exception}")
    .CreateLogger();

builder.Host.UseSerilog();

try
{
    Log.Information("Starting Gixat application");

// Add environment variables to configuration
builder.Configuration.AddEnvironmentVariables();

// Map environment variables to configuration sections
builder.Configuration["ConnectionStrings:DefaultConnection"] = 
    Environment.GetEnvironmentVariable("DATABASE_CONNECTION_STRING") ?? builder.Configuration["ConnectionStrings:DefaultConnection"];
builder.Configuration["AdminUser:Email"] = 
    Environment.GetEnvironmentVariable("ADMIN_EMAIL") ?? builder.Configuration["AdminUser:Email"];
builder.Configuration["AdminUser:Password"] = 
    Environment.GetEnvironmentVariable("ADMIN_PASSWORD") ?? builder.Configuration["AdminUser:Password"];
builder.Configuration["AWS:AccessKey"] = 
    Environment.GetEnvironmentVariable("AWS_ACCESS_KEY") ?? builder.Configuration["AWS:AccessKey"];
builder.Configuration["AWS:SecretKey"] = 
    Environment.GetEnvironmentVariable("AWS_SECRET_KEY") ?? builder.Configuration["AWS:SecretKey"];
builder.Configuration["AWS:Region"] = 
    Environment.GetEnvironmentVariable("AWS_REGION") ?? builder.Configuration["AWS:Region"];
builder.Configuration["AWS:S3:BucketName"] = 
    Environment.GetEnvironmentVariable("AWS_S3_BUCKET_NAME") ?? builder.Configuration["AWS:S3:BucketName"];
builder.Configuration["Authentication:Google:ClientId"] = 
    Environment.GetEnvironmentVariable("GOOGLE_CLIENT_ID") ?? builder.Configuration["Authentication:Google:ClientId"];
builder.Configuration["Authentication:Google:ClientSecret"] = 
    Environment.GetEnvironmentVariable("GOOGLE_CLIENT_SECRET") ?? builder.Configuration["Authentication:Google:ClientSecret"];

// SMTP Configuration
builder.Configuration["Smtp:Host"] = 
    Environment.GetEnvironmentVariable("SMTP_HOST") ?? builder.Configuration["Smtp:Host"];
builder.Configuration["Smtp:Port"] = 
    Environment.GetEnvironmentVariable("SMTP_PORT") ?? builder.Configuration["Smtp:Port"];
builder.Configuration["Smtp:Secure"] = 
    Environment.GetEnvironmentVariable("SMTP_SECURE") ?? builder.Configuration["Smtp:Secure"];
builder.Configuration["Smtp:User"] = 
    Environment.GetEnvironmentVariable("SMTP_USER") ?? builder.Configuration["Smtp:User"];
builder.Configuration["Smtp:Password"] = 
    Environment.GetEnvironmentVariable("SMTP_PASS") ?? builder.Configuration["Smtp:Password"];
builder.Configuration["Smtp:FromName"] = 
    Environment.GetEnvironmentVariable("SMTP_FROM_NAME") ?? builder.Configuration["Smtp:FromName"];
builder.Configuration["Smtp:FromEmail"] = 
    Environment.GetEnvironmentVariable("SMTP_FROM_EMAIL") ?? builder.Configuration["Smtp:FromEmail"];

// Add services
builder.Services.AddRazorPages();
builder.Services.AddHttpContextAccessor();

// ====================================
// CONFIGURE OPTIONS PATTERN
// ====================================
builder.Services.Configure<SmtpOptions>(builder.Configuration.GetSection(SmtpOptions.SectionName));
builder.Services.Configure<AwsOptions>(builder.Configuration.GetSection(AwsOptions.SectionName));
builder.Services.Configure<AdminUserOptions>(builder.Configuration.GetSection(AdminUserOptions.SectionName));
builder.Services.Configure<GoogleAuthOptions>(builder.Configuration.GetSection(GoogleAuthOptions.SectionName));

// Validate options on startup
builder.Services.AddOptions<SmtpOptions>()
    .Bind(builder.Configuration.GetSection(SmtpOptions.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart();

builder.Services.AddOptions<AwsOptions>()
    .Bind(builder.Configuration.GetSection(AwsOptions.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart();

builder.Services.AddOptions<AdminUserOptions>()
    .Bind(builder.Configuration.GetSection(AdminUserOptions.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart();

// Google auth is optional, so no validation required
builder.Services.AddOptions<GoogleAuthOptions>()
    .Bind(builder.Configuration.GetSection(GoogleAuthOptions.SectionName));

// Add Response Compression for faster page loads
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();
    options.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat(new[]
    {
        "application/javascript",
        "text/css",
        "application/json",
        "text/html",
        "image/svg+xml"
    });
});

builder.Services.Configure<BrotliCompressionProviderOptions>(options =>
{
    options.Level = CompressionLevel.Fastest;
});

builder.Services.Configure<GzipCompressionProviderOptions>(options =>
{
    options.Level = CompressionLevel.Fastest;
});

// Add Output Caching for static content
builder.Services.AddOutputCache(options =>
{
    options.AddBasePolicy(builder => builder.Cache());
    options.AddPolicy("Dashboard", builder => builder.Expire(TimeSpan.FromSeconds(30)));
});

// Register unified AppDbContext
var connectionString = builder.Configuration["ConnectionStrings:DefaultConnection"];
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(connectionString, npgsqlOptions =>
    {
        // Enable connection pooling and async operations
        npgsqlOptions.EnableRetryOnFailure(
            maxRetryCount: 3,
            maxRetryDelay: TimeSpan.FromSeconds(5),
            errorCodesToAdd: null);
        
        // Command timeout for long-running queries
        npgsqlOptions.CommandTimeout(30);
    });
    
    // Disable query tracking for better performance in read-only scenarios
    options.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking);
});

// Register DbContext as service so modules can inject it
builder.Services.AddScoped<DbContext>(sp => sp.GetRequiredService<AppDbContext>());

// Register Identity with AppDbContext
builder.Services.AddIdentity<ApplicationUser, ApplicationRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequiredLength = 8;
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

builder.Services.ConfigureApplicationCookie(options =>
{
    options.LoginPath = "/Auth/Login";
    options.LogoutPath = "/Auth/Logout";
    options.AccessDeniedPath = "/Auth/AccessDenied";
    options.ExpireTimeSpan = TimeSpan.FromDays(7);
    options.SlidingExpiration = true;
});

// Configure Google Authentication
var googleAuth = builder.Configuration.GetSection(GoogleAuthOptions.SectionName).Get<GoogleAuthOptions>();
if (googleAuth != null && !string.IsNullOrEmpty(googleAuth.ClientId) && !string.IsNullOrEmpty(googleAuth.ClientSecret))
{
    builder.Services.AddAuthentication()
        .AddGoogle(options =>
        {
            options.ClientId = googleAuth.ClientId;
            options.ClientSecret = googleAuth.ClientSecret;
            options.CallbackPath = "/signin-google";
        });
}

// Register Module Services (without their DbContexts)
builder.Services.AddAuthModuleServices();
builder.Services.AddCompaniesModuleServices();
builder.Services.AddUsersModuleServices();
builder.Services.AddClientsModuleServices();
builder.Services.AddSessionsModuleServices();
builder.Services.AddAppointmentsModuleServices();
builder.Services.AddInvoicesModuleServices();
builder.Services.AddInventoryModuleServices();
builder.Services.AddAwsS3(builder.Configuration);

// Register Email Service (using SmtpOptions configured above)
builder.Services.Configure<SmtpSettings>(options =>
{
    var smtpOptions = builder.Configuration.GetSection(SmtpOptions.SectionName).Get<SmtpOptions>();
    if (smtpOptions != null)
    {
        options.Host = smtpOptions.Host;
        options.Port = smtpOptions.Port;
        options.Secure = smtpOptions.Secure;
        options.User = smtpOptions.User;
        options.Password = smtpOptions.Password;
        options.FromName = smtpOptions.FromName;
        options.FromEmail = smtpOptions.FromEmail;
    }
});
builder.Services.AddScoped<IEmailService, EmailService>();

// Phone Number Service
builder.Services.AddSingleton<PhoneNumberService>();

// Email Template Service
builder.Services.AddScoped<EmailTemplateService>();

// Notification Service
builder.Services.AddScoped<NotificationService>();

// Background Services
builder.Services.AddHostedService<AppointmentReminderBackgroundService>();

// ====================================
// HEALTH CHECKS CONFIGURATION
// ====================================
builder.Services.AddHealthChecks()
    // Database health check
    .AddNpgSql(
        connectionString ?? throw new InvalidOperationException("Database connection string is required"),
        name: "PostgreSQL Database",
        failureStatus: HealthStatus.Unhealthy,
        tags: new[] { "database", "postgresql", "critical" },
        timeout: TimeSpan.FromSeconds(5))
    
    // Custom health checks
    .AddCheck<AwsS3HealthCheck>(
        "AWS S3 Storage",
        failureStatus: HealthStatus.Degraded,
        tags: new[] { "storage", "aws", "s3" },
        timeout: TimeSpan.FromSeconds(10))
    
    .AddCheck<SmtpHealthCheck>(
        "SMTP Email Service",
        failureStatus: HealthStatus.Degraded,
        tags: new[] { "email", "smtp" },
        timeout: TimeSpan.FromSeconds(10))
    
    .AddCheck<MemoryHealthCheck>(
        "Memory Usage",
        failureStatus: HealthStatus.Degraded,
        tags: new[] { "memory", "system" },
        timeout: TimeSpan.FromSeconds(3));

// Configure GraphQL
builder.Services
    .AddGraphQLServer()
    .AddQueryType(d => d.Name("Query"))
    .AddMutationType(d => d.Name("Mutation"))
    // Company Module
    .AddTypeExtension<CompanyQueries>()
    .AddTypeExtension<CompanyMutations>()
    .AddType<CompanyType>()
    .AddType<BranchType>()
    .AddType<CompanyPlanType>()
    // Users Module
    .AddTypeExtension<UserQueries>()
    .AddTypeExtension<UserMutations>()
    .AddType<CompanyUserType>()
    .AddType<CompanyUserRoleType>()
    .AddType<UserInvitationType>()
    .AddType<InvitationStatusType>()
    // Clients Module
    .AddTypeExtension<ClientQueries>()
    .AddType<ClientType>()
    .AddType<ClientVehicleType>()
    .AddType<ClientStatsType>()
    .AddType<PlatformStatsType>()
    // Sessions Module
    .AddTypeExtension<SessionQueries>()
    .AddTypeExtension<SessionMutations>()
    .AddType<GarageSessionType>()
    .AddType<CustomerRequestType>()
    .AddType<InspectionType>()
    .AddType<InspectionItemType>()
    .AddType<TestDriveType>()
    .AddType<JobCardType>()
    .AddType<JobCardItemType>()
    .AddType<MediaItemType>()
    .AddType<SessionStatusType>()
    .AddType<MediaTypeEnumType>()
    .AddType<MediaCategoryType>()
    .AddType<RequestStatusType>()
    .AddType<PriorityType>()
    .AddType<JobCardStatusType>()
    .AddType<TaskStatusType>()
    // Features
    .AddProjections()
    .AddFiltering()
    .AddSorting()
    .AddAuthorization();

var app = builder.Build();

// NOTE: Migrations should be applied manually using:
// dotnet ef database update
// 
// Automatic migrations on startup are disabled as they are not a best practice.
// Only enable in production deployments via APPLY_MIGRATIONS=true environment variable.
var applyMigrations = Environment.GetEnvironmentVariable("APPLY_MIGRATIONS")?.ToLower() == "true";

if (applyMigrations)
{
    using var scope = app.Services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    
    try
    {
        logger.LogInformation("Applying database migrations...");
        await context.Database.MigrateAsync();
        logger.LogInformation("Database migrations applied successfully.");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred while migrating the database.");
        throw;
    }
}

// Seed database
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    
    try
    {
        await AuthModule.SeedRolesAsync(services);
        await AuthModule.SeedAdminUserAsync(services, builder.Configuration);
        logger.LogInformation("Database seeding completed successfully.");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred while seeding the database.");
    }
}

// Configure pipeline
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

// Add global exception handling
app.UseGlobalExceptionHandler();

// Enable response compression
app.UseResponseCompression();

// Only use HTTPS redirection in production
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// Static files with caching headers
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        // Cache static files for 1 year
        ctx.Context.Response.Headers.Append("Cache-Control", "public,max-age=31536000,immutable");
    }
});

app.UseRouting();

// Output caching
app.UseOutputCache();

app.UseAuthentication();
app.UseAuthorization();

// ====================================
// HEALTH CHECKS ENDPOINTS
// ====================================
// Health check endpoint with detailed JSON response
app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse,
    AllowCachingResponses = false
});

// Simple health check endpoint for load balancers
app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("critical"),
    AllowCachingResponses = false
});

// Liveness probe - checks if application is running
app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = _ => false, // Exclude all checks, just return 200 if app is running
    AllowCachingResponses = false
});

app.MapRazorPages();
app.MapGraphQL(); // GraphQL endpoint at /graphql

Log.Information("Gixat application started successfully");
app.Run();

}
catch (Exception ex)
{
    Log.Fatal(ex, "Gixat application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
