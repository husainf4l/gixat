using HotChocolate;
using HotChocolate.Types;
using Gixat.Modules.Companies.Entities;

namespace Gixat.Modules.Companies.GraphQL.Types;

public class CompanyType : ObjectType<Company>
{
    protected override void Configure(IObjectTypeDescriptor<Company> descriptor)
    {
        descriptor.Description("Represents a garage/auto service company");

        descriptor.Field(c => c.Id)
            .Description("The unique identifier of the company");

        descriptor.Field(c => c.Name)
            .Description("The legal name of the company");

        descriptor.Field(c => c.TradeName)
            .Description("The trade/brand name of the company");

        descriptor.Field(c => c.Email)
            .Description("Primary contact email");

        descriptor.Field(c => c.Plan)
            .Description("Current subscription plan");

        descriptor.Field(c => c.IsActive)
            .Description("Whether the company is active");

        descriptor.Field(c => c.IsVerified)
            .Description("Whether the company is verified");

        descriptor.Field(c => c.CreatedAt)
            .Description("When the company was registered");
    }
}

public class BranchType : ObjectType<Branch>
{
    protected override void Configure(IObjectTypeDescriptor<Branch> descriptor)
    {
        descriptor.Description("Represents a physical branch/location of a company");

        descriptor.Field(b => b.Id)
            .Description("The unique identifier of the branch");

        descriptor.Field(b => b.Name)
            .Description("The name of the branch");

        descriptor.Field(b => b.IsMainBranch)
            .Description("Whether this is the main branch");

        descriptor.Field(b => b.ServiceBays)
            .Description("Number of service bays available");
    }
}

public class CompanyPlanType : EnumType<CompanyPlan>
{
    protected override void Configure(IEnumTypeDescriptor<CompanyPlan> descriptor)
    {
        descriptor.Description("Company subscription plans");

        descriptor.Value(CompanyPlan.Free)
            .Description("Free tier with basic features");

        descriptor.Value(CompanyPlan.Starter)
            .Description("Starter plan for small garages");

        descriptor.Value(CompanyPlan.Professional)
            .Description("Professional plan for growing businesses");

        descriptor.Value(CompanyPlan.Enterprise)
            .Description("Enterprise plan with all features");
    }
}
