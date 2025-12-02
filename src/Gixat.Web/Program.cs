using System.Reflection;
using dotenv.net;
using Microsoft.EntityFrameworkCore;
using Gixat.Modules.Auth;
using Gixat.Modules.Auth.Data;
using Gixat.Modules.Clients;
using Gixat.Modules.Clients.Data;
using Gixat.Modules.Companies;
using Gixat.Modules.Companies.Data;
using Gixat.Modules.Companies.GraphQL.Queries;
using Gixat.Modules.Companies.GraphQL.Mutations;
using Gixat.Modules.Companies.GraphQL.Types;
using Gixat.Modules.Users;
using Gixat.Modules.Users.Data;
using Gixat.Modules.Users.GraphQL.Queries;
using Gixat.Modules.Users.GraphQL.Mutations;
using Gixat.Modules.Users.GraphQL.Types;
using Gixat.Modules.Sessions;
using Gixat.Modules.Sessions.Data;
using Gixat.Modules.Sessions.GraphQL.Queries;
using Gixat.Modules.Sessions.GraphQL.Mutations;
using Gixat.Modules.Sessions.GraphQL.Types;

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

// Add services - include Auth module's Razor Pages
var authAssembly = typeof(AuthModule).Assembly;
builder.Services.AddRazorPages()
    .AddApplicationPart(authAssembly);
builder.Services.AddHttpContextAccessor();

// Register Modules
builder.Services.AddAuthModule(builder.Configuration);
builder.Services.AddCompaniesModule(builder.Configuration);
builder.Services.AddUsersModule(builder.Configuration);
builder.Services.AddClientsModule(builder.Configuration);
builder.Services.AddSessionsModule(builder.Configuration);

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

// Apply migrations automatically on startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    
    try
    {
        logger.LogInformation("Applying database migrations...");
        
        // Apply Auth migrations
        var authContext = services.GetRequiredService<AuthDbContext>();
        await authContext.Database.MigrateAsync();
        logger.LogInformation("Auth migrations applied.");
        
        // Apply Company migrations
        var companyContext = services.GetRequiredService<CompanyDbContext>();
        await companyContext.Database.MigrateAsync();
        logger.LogInformation("Company migrations applied.");
        
        // Apply Client migrations
        var clientContext = services.GetRequiredService<ClientDbContext>();
        await clientContext.Database.MigrateAsync();
        logger.LogInformation("Client migrations applied.");
        
        // Apply Users migrations
        var usersContext = services.GetRequiredService<UserDbContext>();
        await usersContext.Database.MigrateAsync();
        logger.LogInformation("Users migrations applied.");
        
        // Apply Sessions migrations
        var sessionContext = services.GetRequiredService<SessionDbContext>();
        await sessionContext.Database.MigrateAsync();
        logger.LogInformation("Sessions migrations applied.");
        
        logger.LogInformation("All database migrations completed successfully.");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred while applying migrations.");
        throw;
    }
}

// Seed database
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    await AuthModule.SeedRolesAsync(services);
    await AuthModule.SeedAdminUserAsync(services, builder.Configuration);
}

// Configure pipeline
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapRazorPages();
app.MapGraphQL(); // GraphQL endpoint at /graphql

app.Run();
