using HotChocolate;
using HotChocolate.Types;
using Gixat.Modules.Users.Entities;

namespace Gixat.Modules.Users.GraphQL.Types;

public class CompanyUserType : ObjectType<CompanyUser>
{
    protected override void Configure(IObjectTypeDescriptor<CompanyUser> descriptor)
    {
        descriptor.Description("Represents a user/employee of a company");

        descriptor.Field(u => u.Id)
            .Description("The unique identifier");

        descriptor.Field(u => u.FullName)
            .Description("The full name of the user");

        descriptor.Field(u => u.Email)
            .Description("Email address");

        descriptor.Field(u => u.Role)
            .Description("Role within the company");

        descriptor.Field(u => u.JobTitle)
            .Description("Job title/position");

        descriptor.Field(u => u.IsActive)
            .Description("Whether the user is active");
    }
}

public class CompanyUserRoleType : EnumType<CompanyUserRole>
{
    protected override void Configure(IEnumTypeDescriptor<CompanyUserRole> descriptor)
    {
        descriptor.Description("User roles within a company");

        descriptor.Value(CompanyUserRole.Owner)
            .Description("Company owner with full access");

        descriptor.Value(CompanyUserRole.Admin)
            .Description("Administrator who can manage users and settings");

        descriptor.Value(CompanyUserRole.Manager)
            .Description("Manager who can manage operations");

        descriptor.Value(CompanyUserRole.Technician)
            .Description("Technician/Mechanic");

        descriptor.Value(CompanyUserRole.Receptionist)
            .Description("Front desk/reception");

        descriptor.Value(CompanyUserRole.Employee)
            .Description("General employee");
    }
}

public class UserInvitationType : ObjectType<UserInvitation>
{
    protected override void Configure(IObjectTypeDescriptor<UserInvitation> descriptor)
    {
        descriptor.Description("Invitation to join a company");

        descriptor.Field(i => i.Id)
            .Description("The unique identifier");

        descriptor.Field(i => i.Email)
            .Description("Email of the invited user");

        descriptor.Field(i => i.Role)
            .Description("Role to be assigned");

        descriptor.Field(i => i.Status)
            .Description("Current invitation status");

        descriptor.Field(i => i.ExpiresAt)
            .Description("When the invitation expires");

        // Hide sensitive token
        descriptor.Field(i => i.Token).Ignore();
    }
}

public class InvitationStatusType : EnumType<InvitationStatus>
{
    protected override void Configure(IEnumTypeDescriptor<InvitationStatus> descriptor)
    {
        descriptor.Description("Status of a user invitation");

        descriptor.Value(InvitationStatus.Pending)
            .Description("Awaiting response");

        descriptor.Value(InvitationStatus.Accepted)
            .Description("Invitation accepted");

        descriptor.Value(InvitationStatus.Expired)
            .Description("Invitation has expired");

        descriptor.Value(InvitationStatus.Cancelled)
            .Description("Invitation was cancelled");
    }
}
