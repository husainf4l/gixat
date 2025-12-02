using HotChocolate;
using HotChocolate.Types;
using Microsoft.EntityFrameworkCore;
using Gixat.Modules.Companies.Entities;

namespace Gixat.Modules.Companies.GraphQL.Mutations;

[ExtendObjectType("Mutation")]
public class CompanyMutations
{
    public async Task<CreateCompanyPayload> CreateCompany(
        CreateCompanyInput input,
        [Service] DbContext context)
    {
        var company = new Company
        {
            Name = input.Name,
            TradeName = input.TradeName,
            Email = input.Email,
            Phone = input.Phone,
            TaxId = input.TaxId,
            RegistrationNumber = input.RegistrationNumber,
            Address = input.Address,
            City = input.City,
            State = input.State,
            PostalCode = input.PostalCode,
            Country = input.Country,
            TimeZone = input.TimeZone,
            Currency = input.Currency ?? "USD",
            OwnerId = input.OwnerId
        };

        context.Set<Company>().Add(company);
        await context.SaveChangesAsync();

        return new CreateCompanyPayload(company);
    }

    public async Task<UpdateCompanyPayload> UpdateCompany(
        UpdateCompanyInput input,
        [Service] DbContext context)
    {
        var company = await context.Set<Company>().FindAsync(input.Id);
        
        if (company == null)
        {
            return new UpdateCompanyPayload(null, "Company not found");
        }

        company.Name = input.Name ?? company.Name;
        company.TradeName = input.TradeName ?? company.TradeName;
        company.Email = input.Email ?? company.Email;
        company.Phone = input.Phone ?? company.Phone;
        company.Website = input.Website ?? company.Website;
        company.TaxId = input.TaxId ?? company.TaxId;
        company.RegistrationNumber = input.RegistrationNumber ?? company.RegistrationNumber;
        company.Address = input.Address ?? company.Address;
        company.City = input.City ?? company.City;
        company.State = input.State ?? company.State;
        company.PostalCode = input.PostalCode ?? company.PostalCode;
        company.Country = input.Country ?? company.Country;
        company.TimeZone = input.TimeZone ?? company.TimeZone;
        company.Currency = input.Currency ?? company.Currency;
        company.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();

        return new UpdateCompanyPayload(company, null);
    }

    public async Task<DeleteCompanyPayload> DeleteCompany(
        Guid id,
        [Service] DbContext context)
    {
        var company = await context.Set<Company>().FindAsync(id);
        
        if (company == null)
        {
            return new DeleteCompanyPayload(false, "Company not found");
        }

        context.Set<Company>().Remove(company);
        await context.SaveChangesAsync();

        return new DeleteCompanyPayload(true, null);
    }

    public async Task<CreateBranchPayload> CreateBranch(
        CreateBranchInput input,
        [Service] DbContext context)
    {
        var branch = new Branch
        {
            CompanyId = input.CompanyId,
            Name = input.Name,
            Code = input.Code,
            Phone = input.Phone,
            Email = input.Email,
            Address = input.Address,
            City = input.City,
            State = input.State,
            PostalCode = input.PostalCode,
            OperatingHours = input.OperatingHours,
            ServiceBays = input.ServiceBays,
            IsMainBranch = input.IsMainBranch ?? false
        };

        context.Set<Branch>().Add(branch);
        await context.SaveChangesAsync();

        return new CreateBranchPayload(branch);
    }
}

// Input Types
public record CreateCompanyInput(
    string Name,
    string? TradeName,
    string Email,
    string? Phone,
    string? TaxId,
    string? RegistrationNumber,
    string? Address,
    string? City,
    string? State,
    string? PostalCode,
    string? Country,
    string? TimeZone,
    string? Currency,
    Guid OwnerId
);

public record UpdateCompanyInput(
    Guid Id,
    string? Name,
    string? TradeName,
    string? Email,
    string? Phone,
    string? Website,
    string? TaxId,
    string? RegistrationNumber,
    string? Address,
    string? City,
    string? State,
    string? PostalCode,
    string? Country,
    string? TimeZone,
    string? Currency
);

public record CreateBranchInput(
    Guid CompanyId,
    string Name,
    string? Code,
    string? Phone,
    string? Email,
    string? Address,
    string? City,
    string? State,
    string? PostalCode,
    string? OperatingHours,
    int? ServiceBays,
    bool? IsMainBranch
);

// Payload Types
public record CreateCompanyPayload(Company Company);
public record UpdateCompanyPayload(Company? Company, string? Error);
public record DeleteCompanyPayload(bool Success, string? Error);
public record CreateBranchPayload(Branch Branch);
