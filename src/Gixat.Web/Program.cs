using System.Reflection;
using Gixat.Modules.Auth;
using Gixat.Modules.Clients;
using Gixat.Modules.Companies;
using Gixat.Modules.Companies.GraphQL.Queries;
using Gixat.Modules.Companies.GraphQL.Mutations;
using Gixat.Modules.Companies.GraphQL.Types;
using Gixat.Modules.Users;
using Gixat.Modules.Users.GraphQL.Queries;
using Gixat.Modules.Users.GraphQL.Mutations;
using Gixat.Modules.Users.GraphQL.Types;

var builder = WebApplication.CreateBuilder(args);

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
    // Features
    .AddProjections()
    .AddFiltering()
    .AddSorting()
    .AddAuthorization();

var app = builder.Build();

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
