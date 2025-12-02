using HotChocolate;
using HotChocolate.Types;
using Microsoft.EntityFrameworkCore;
using Gixat.Modules.Users.Entities;

namespace Gixat.Modules.Users.GraphQL.Mutations;

[ExtendObjectType("Mutation")]
public class UserMutations
{
    public async Task<CreateCompanyUserPayload> CreateCompanyUser(
        CreateCompanyUserInput input,
        [Service] DbContext context)
    {
        // Check if user already exists in this company
        var existing = await context.Set<CompanyUser>()
            .FirstOrDefaultAsync(u => u.CompanyId == input.CompanyId && u.AuthUserId == input.AuthUserId);

        if (existing != null)
        {
            return new CreateCompanyUserPayload(null, "User already exists in this company");
        }

        var user = new CompanyUser
        {
            AuthUserId = input.AuthUserId,
            CompanyId = input.CompanyId,
            FirstName = input.FirstName,
            LastName = input.LastName,
            Email = input.Email,
            Phone = input.Phone,
            EmployeeId = input.EmployeeId,
            JobTitle = input.JobTitle,
            Department = input.Department,
            BranchId = input.BranchId,
            Role = input.Role ?? CompanyUserRole.Employee,
            JoinedAt = DateTime.UtcNow
        };

        context.Set<CompanyUser>().Add(user);
        await context.SaveChangesAsync();

        return new CreateCompanyUserPayload(user, null);
    }

    public async Task<UpdateCompanyUserPayload> UpdateCompanyUser(
        UpdateCompanyUserInput input,
        [Service] DbContext context)
    {
        var user = await context.Set<CompanyUser>().FindAsync(input.Id);
        
        if (user == null)
        {
            return new UpdateCompanyUserPayload(null, "User not found");
        }

        user.FirstName = input.FirstName ?? user.FirstName;
        user.LastName = input.LastName ?? user.LastName;
        user.Phone = input.Phone ?? user.Phone;
        user.JobTitle = input.JobTitle ?? user.JobTitle;
        user.Department = input.Department ?? user.Department;
        user.BranchId = input.BranchId ?? user.BranchId;
        user.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();

        return new UpdateCompanyUserPayload(user, null);
    }

    public async Task<ChangeUserRolePayload> ChangeUserRole(
        Guid userId,
        CompanyUserRole newRole,
        [Service] DbContext context)
    {
        var user = await context.Set<CompanyUser>().FindAsync(userId);
        
        if (user == null)
        {
            return new ChangeUserRolePayload(null, "User not found");
        }

        // Cannot change owner role
        if (user.Role == CompanyUserRole.Owner)
        {
            return new ChangeUserRolePayload(null, "Cannot change owner role");
        }

        user.Role = newRole;
        user.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();

        return new ChangeUserRolePayload(user, null);
    }

    public async Task<DeactivateUserPayload> DeactivateUser(
        Guid userId,
        [Service] DbContext context)
    {
        var user = await context.Set<CompanyUser>().FindAsync(userId);
        
        if (user == null)
        {
            return new DeactivateUserPayload(false, "User not found");
        }

        if (user.Role == CompanyUserRole.Owner)
        {
            return new DeactivateUserPayload(false, "Cannot deactivate company owner");
        }

        user.IsActive = false;
        user.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();

        return new DeactivateUserPayload(true, null);
    }

    public async Task<InviteUserPayload> InviteUser(
        InviteUserInput input,
        [Service] DbContext context)
    {
        // Check if already invited
        var existing = await context.Set<UserInvitation>()
            .FirstOrDefaultAsync(i => i.CompanyId == input.CompanyId && 
                                      i.Email == input.Email && 
                                      i.Status == InvitationStatus.Pending);

        if (existing != null)
        {
            return new InviteUserPayload(null, "User already has a pending invitation");
        }

        var invitation = new UserInvitation
        {
            CompanyId = input.CompanyId,
            Email = input.Email,
            FirstName = input.FirstName,
            LastName = input.LastName,
            Role = input.Role ?? CompanyUserRole.Employee,
            BranchId = input.BranchId,
            Token = Guid.NewGuid().ToString("N"),
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            InvitedByUserId = input.InvitedByUserId
        };

        context.Set<UserInvitation>().Add(invitation);
        await context.SaveChangesAsync();

        return new InviteUserPayload(invitation, null);
    }

    public async Task<AcceptInvitationPayload> AcceptInvitation(
        string token,
        Guid authUserId,
        [Service] DbContext context)
    {
        var invitation = await context.Set<UserInvitation>()
            .FirstOrDefaultAsync(i => i.Token == token);

        if (invitation == null)
        {
            return new AcceptInvitationPayload(null, "Invalid invitation token");
        }

        if (invitation.Status != InvitationStatus.Pending)
        {
            return new AcceptInvitationPayload(null, "Invitation is no longer valid");
        }

        if (invitation.ExpiresAt < DateTime.UtcNow)
        {
            invitation.Status = InvitationStatus.Expired;
            await context.SaveChangesAsync();
            return new AcceptInvitationPayload(null, "Invitation has expired");
        }

        // Create company user
        var user = new CompanyUser
        {
            AuthUserId = authUserId,
            CompanyId = invitation.CompanyId,
            FirstName = invitation.FirstName ?? "",
            LastName = invitation.LastName ?? "",
            Email = invitation.Email,
            Role = invitation.Role,
            BranchId = invitation.BranchId,
            JoinedAt = DateTime.UtcNow
        };

        context.Set<CompanyUser>().Add(user);

        // Update invitation
        invitation.Status = InvitationStatus.Accepted;
        invitation.AcceptedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();

        return new AcceptInvitationPayload(user, null);
    }
}

// Input Types
public record CreateCompanyUserInput(
    Guid AuthUserId,
    Guid CompanyId,
    string FirstName,
    string LastName,
    string Email,
    string? Phone,
    string? EmployeeId,
    string? JobTitle,
    string? Department,
    Guid? BranchId,
    CompanyUserRole? Role
);

public record UpdateCompanyUserInput(
    Guid Id,
    string? FirstName,
    string? LastName,
    string? Phone,
    string? JobTitle,
    string? Department,
    Guid? BranchId
);

public record InviteUserInput(
    Guid CompanyId,
    string Email,
    string? FirstName,
    string? LastName,
    CompanyUserRole? Role,
    Guid? BranchId,
    Guid InvitedByUserId
);

// Payload Types
public record CreateCompanyUserPayload(CompanyUser? User, string? Error);
public record UpdateCompanyUserPayload(CompanyUser? User, string? Error);
public record ChangeUserRolePayload(CompanyUser? User, string? Error);
public record DeactivateUserPayload(bool Success, string? Error);
public record InviteUserPayload(UserInvitation? Invitation, string? Error);
public record AcceptInvitationPayload(CompanyUser? User, string? Error);
