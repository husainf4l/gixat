using dotenv.net;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.EntityFrameworkCore;
using Gixat.Web.Data;
using Gixat.Web.Middleware;
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
using Gixat.Web.Shared.Interfaces;
using Gixat.Web.Shared.Services;

// Load environment variables from .env file
DotEnv.Load(options: new DotEnvOptions(probeForEnv: true, probeLevelsToSearch: 5));

var builder = WebApplication.CreateBuilder(args);

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
    options.UseNpgsql(connectionString));

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
var googleClientId = builder.Configuration["Authentication:Google:ClientId"];
var googleClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];
if (!string.IsNullOrEmpty(googleClientId) && !string.IsNullOrEmpty(googleClientSecret))
{
    builder.Services.AddAuthentication()
        .AddGoogle(options =>
        {
            options.ClientId = googleClientId;
            options.ClientSecret = googleClientSecret;
            options.CallbackPath = "/signin-google";
        });
}

// Register Module Services (without their DbContexts)
builder.Services.AddAuthModuleServices();
builder.Services.AddCompaniesModuleServices();
builder.Services.AddUsersModuleServices();
builder.Services.AddClientsModuleServices();
builder.Services.AddSessionsModuleServices();
builder.Services.AddAwsS3(builder.Configuration);

// Register Email Service
builder.Services.Configure<SmtpSettings>(options =>
{
    options.Host = builder.Configuration["Smtp:Host"] ?? "smtp.gmail.com";
    options.Port = int.TryParse(builder.Configuration["Smtp:Port"], out var port) ? port : 465;
    options.Secure = bool.TryParse(builder.Configuration["Smtp:Secure"], out var secure) ? secure : true;
    options.User = builder.Configuration["Smtp:User"] ?? "";
    options.Password = builder.Configuration["Smtp:Password"] ?? "";
    options.FromName = builder.Configuration["Smtp:FromName"] ?? "Gixat";
    options.FromEmail = builder.Configuration["Smtp:FromEmail"] ?? builder.Configuration["Smtp:User"] ?? "";
});
builder.Services.AddScoped<IEmailService, EmailService>();

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

// Apply migrations only in Development or when APPLY_MIGRATIONS=true
// var applyMigrations = app.Environment.IsDevelopment() || 
//     Environment.GetEnvironmentVariable("APPLY_MIGRATIONS")?.ToLower() == "true";

// if (applyMigrations)
// {
//     using var scope = app.Services.CreateScope();
//     var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
//     var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    
//     logger.LogInformation("Applying database migrations...");
//     await context.Database.MigrateAsync();
//     logger.LogInformation("Database migrations applied successfully.");
// }

// // Seed database
// using (var scope = app.Services.CreateScope())
// {
//     var services = scope.ServiceProvider;
//     await AuthModule.SeedRolesAsync(services);
//     await AuthModule.SeedAdminUserAsync(services, builder.Configuration);
// }

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

app.UseHttpsRedirection();

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

app.MapRazorPages();
app.MapGraphQL(); // GraphQL endpoint at /graphql

app.Run();
