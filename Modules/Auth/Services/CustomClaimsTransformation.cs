using System.Security.Claims;
using Gixat.Web.Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;

namespace Gixat.Web.Modules.Auth.Services;

public class CustomClaimsTransformation : IClaimsTransformation
{
    private readonly AppDbContext _context;

    public CustomClaimsTransformation(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        if (principal.Identity?.IsAuthenticated != true)
        {
            return principal;
        }

        var claimsIdentity = (ClaimsIdentity)principal.Identity;
        
        // Check if claims are already added
        if (principal.HasClaim(c => c.Type == "CompanyId"))
        {
            return principal;
        }

        // Get the user ID
        var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
        {
            return principal;
        }

        // Get the CompanyUser for this auth user
        var companyUser = await _context.CompanyUsers
            .FirstOrDefaultAsync(cu => cu.AuthUserId == userId && cu.IsActive);

        if (companyUser != null)
        {
            // Add CompanyId claim
            claimsIdentity.AddClaim(new Claim("CompanyId", companyUser.CompanyId.ToString()));
            
            // Add BranchId claim if exists
            if (companyUser.BranchId.HasValue)
            {
                claimsIdentity.AddClaim(new Claim("BranchId", companyUser.BranchId.Value.ToString()));
            }
            
            // Add Role claim
            claimsIdentity.AddClaim(new Claim("CompanyRole", companyUser.Role.ToString()));
        }

        return principal;
    }
}
