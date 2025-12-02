using dotenv.net;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Gixat.Web.Data;
using Gixat.Modules.Auth;
using Gixat.Modules.Auth.Entities;
using Gixat.Modules.Clients;
using Gixat.Modules.Clients.GraphQL.Queries;
using Gixat.Modules.Clients.GraphQL.Types;
using Gixat.Modules.Companies;
using Gixat.Modules.Companies.GraphQL.Queries;
using Gixat.Modules.Companies.GraphQL.Mutations;
using Gixat.Modules.Companies.GraphQL.Types;
using Gixat.Modules.Users;
using Gixat.Modules.Users.GraphQL.Queries;
using Gixat.Modules.Users.GraphQL.Mutations;
using Gixat.Modules.Users.GraphQL.Types;
using Gixat.Modules.Sessions;
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

// Register Module Services (without their DbContexts)
builder.Services.AddAuthModuleServices();
builder.Services.AddCompaniesModuleServices();
builder.Services.AddUsersModuleServices();
builder.Services.AddClientsModuleServices();
builder.Services.AddSessionsModuleServices();
builder.Services.AddAwsS3(builder.Configuration);

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

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapRazorPages();
app.MapGraphQL(); // GraphQL endpoint at /graphql

app.Run();
