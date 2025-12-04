using HotChocolate.Types;
using Gixat.Web.Modules.Clients.Entities;
using Gixat.Web.Modules.Clients.DTOs;

namespace Gixat.Web.Modules.Clients.GraphQL.Types;

public class ClientType : ObjectType<Client>
{
    protected override void Configure(IObjectTypeDescriptor<Client> descriptor)
    {
        descriptor
            .Field(c => c.FullName)
            .Type<NonNullType<StringType>>();

        descriptor
            .Field(c => c.Vehicles)
            .UseFiltering()
            .UseSorting();

        descriptor
            .Ignore(c => c.CompanyId);
    }
}

public class ClientVehicleType : ObjectType<ClientVehicle>
{
    protected override void Configure(IObjectTypeDescriptor<ClientVehicle> descriptor)
    {
        descriptor
            .Field(v => v.DisplayName)
            .Type<NonNullType<StringType>>();

        descriptor
            .Ignore(v => v.ClientId);
        descriptor
            .Ignore(v => v.CompanyId);
    }
}

public class ClientStatsType : ObjectType<ClientStats>
{
    protected override void Configure(IObjectTypeDescriptor<ClientStats> descriptor)
    {
        descriptor
            .Field(s => s.TotalRevenue)
            .Type<NonNullType<DecimalType>>();

        descriptor
            .Field(s => s.AverageRevenue)
            .Type<NonNullType<DecimalType>>();
    }
}

public class PlatformStatsType : ObjectType<PlatformStats>
{
    protected override void Configure(IObjectTypeDescriptor<PlatformStats> descriptor)
    {
        descriptor
            .Field(s => s.TotalRevenue)
            .Type<NonNullType<DecimalType>>();

        descriptor
            .Field(s => s.AverageRevenuePerClient)
            .Type<NonNullType<DecimalType>>();
    }
}