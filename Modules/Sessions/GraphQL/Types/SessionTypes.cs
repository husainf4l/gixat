using HotChocolate;
using HotChocolate.Types;
using Gixat.Web.Modules.Sessions.Entities;
using Gixat.Web.Modules.Sessions.Enums;

namespace Gixat.Web.Modules.Sessions.GraphQL.Types;

public class GarageSessionType : ObjectType<GarageSession>
{
    protected override void Configure(IObjectTypeDescriptor<GarageSession> descriptor)
    {
        descriptor.Description("Represents a vehicle service session in the garage");
        
        descriptor.Field(s => s.Id).Description("Unique identifier for the session");
        descriptor.Field(s => s.SessionNumber).Description("Human-readable session number");
        descriptor.Field(s => s.Status).Description("Current status of the session");
        descriptor.Field(s => s.CheckInAt).Description("When the vehicle was checked in");
        descriptor.Field(s => s.CheckOutAt).Description("When the vehicle was checked out");
        descriptor.Field(s => s.MileageIn).Description("Vehicle mileage at check-in");
        descriptor.Field(s => s.MileageOut).Description("Vehicle mileage at check-out");
    }
}

public class CustomerRequestType : ObjectType<CustomerRequest>
{
    protected override void Configure(IObjectTypeDescriptor<CustomerRequest> descriptor)
    {
        descriptor.Description("Customer's initial request/concerns for the service visit");
        
        descriptor.Field(r => r.Id).Description("Unique identifier");
        descriptor.Field(r => r.Title).Description("Request title");
        descriptor.Field(r => r.CustomerConcerns).Description("What the customer is concerned about");
        descriptor.Field(r => r.RequestedServices).Description("Services requested by customer");
        descriptor.Field(r => r.Priority).Description("Priority level");
        descriptor.Field(r => r.Status).Description("Current status");
    }
}

public class InspectionType : ObjectType<Inspection>
{
    protected override void Configure(IObjectTypeDescriptor<Inspection> descriptor)
    {
        descriptor.Description("Vehicle inspection record");
        
        descriptor.Field(i => i.Id).Description("Unique identifier");
        descriptor.Field(i => i.Title).Description("Inspection title");
        descriptor.Field(i => i.Findings).Description("Overall findings");
        descriptor.Field(i => i.Recommendations).Description("Technician recommendations");
        descriptor.Field(i => i.Status).Description("Current status");
    }
}

public class InspectionItemType : ObjectType<InspectionItem>
{
    protected override void Configure(IObjectTypeDescriptor<InspectionItem> descriptor)
    {
        descriptor.Description("Individual inspection checklist item");
        
        descriptor.Field(i => i.Category).Description("Category (Engine, Brakes, etc.)");
        descriptor.Field(i => i.ItemName).Description("Item being inspected");
        descriptor.Field(i => i.Condition).Description("Condition (Good, Fair, Poor, Critical)");
        descriptor.Field(i => i.RequiresAttention).Description("Whether this needs attention");
    }
}

public class TestDriveType : ObjectType<TestDrive>
{
    protected override void Configure(IObjectTypeDescriptor<TestDrive> descriptor)
    {
        descriptor.Description("Test drive record with observations");
        
        descriptor.Field(t => t.Id).Description("Unique identifier");
        descriptor.Field(t => t.Title).Description("Test drive title");
        descriptor.Field(t => t.Findings).Description("Overall findings");
        descriptor.Field(t => t.Recommendations).Description("Recommendations");
        descriptor.Field(t => t.MileageStart).Description("Mileage at start");
        descriptor.Field(t => t.MileageEnd).Description("Mileage at end");
    }
}

public class JobCardType : ObjectType<JobCard>
{
    protected override void Configure(IObjectTypeDescriptor<JobCard> descriptor)
    {
        descriptor.Description("Job card - work order for vehicle service");
        
        descriptor.Field(j => j.Id).Description("Unique identifier");
        descriptor.Field(j => j.JobCardNumber).Description("Human-readable job card number");
        descriptor.Field(j => j.Title).Description("Job card title");
        descriptor.Field(j => j.Status).Description("Current status");
        descriptor.Field(j => j.IsApproved).Description("Whether approved by supervisor");
        descriptor.Field(j => j.CustomerAuthorized).Description("Whether authorized by customer");
        descriptor.Field(j => j.EstimatedHours).Description("Estimated labor hours");
        descriptor.Field(j => j.ActualHours).Description("Actual labor hours");
    }
}

public class JobCardItemType : ObjectType<JobCardItem>
{
    protected override void Configure(IObjectTypeDescriptor<JobCardItem> descriptor)
    {
        descriptor.Description("Individual task/work item in a job card");
        
        descriptor.Field(i => i.Title).Description("Task title");
        descriptor.Field(i => i.Category).Description("Task category");
        descriptor.Field(i => i.Status).Description("Current status");
        descriptor.Field(i => i.WorkPerformed).Description("Description of work performed");
        descriptor.Field(i => i.QualityChecked).Description("Whether quality checked");
    }
}

public class MediaItemType : ObjectType<MediaItem>
{
    protected override void Configure(IObjectTypeDescriptor<MediaItem> descriptor)
    {
        descriptor.Description("Media file (image/video) stored in AWS S3");
        
        descriptor.Field(m => m.Id).Description("Unique identifier");
        descriptor.Field(m => m.FileName).Description("File name in S3");
        descriptor.Field(m => m.OriginalFileName).Description("Original file name");
        descriptor.Field(m => m.MediaType).Description("Type (Image or Video)");
        descriptor.Field(m => m.Category).Description("Category (CustomerRequest, Inspection, etc.)");
        descriptor.Field(m => m.S3Url).Description("Presigned URL for download");
        
        // Don't expose sensitive S3 info
        descriptor.Ignore(m => m.S3Key);
        descriptor.Ignore(m => m.S3Bucket);
    }
}

// Enum types
public class SessionStatusType : EnumType<SessionStatus>
{
    protected override void Configure(IEnumTypeDescriptor<SessionStatus> descriptor)
    {
        descriptor.Description("Status of a garage session");
    }
}

public class MediaTypeEnumType : EnumType<MediaType>
{
    protected override void Configure(IEnumTypeDescriptor<MediaType> descriptor)
    {
        descriptor.Description("Type of media file");
    }
}

public class MediaCategoryType : EnumType<MediaCategory>
{
    protected override void Configure(IEnumTypeDescriptor<MediaCategory> descriptor)
    {
        descriptor.Description("Category of media file");
    }
}

public class RequestStatusType : EnumType<RequestStatus>
{
    protected override void Configure(IEnumTypeDescriptor<RequestStatus> descriptor)
    {
        descriptor.Description("Status of a request");
    }
}

public class PriorityType : EnumType<Priority>
{
    protected override void Configure(IEnumTypeDescriptor<Priority> descriptor)
    {
        descriptor.Description("Priority level");
    }
}

public class JobCardStatusType : EnumType<JobCardStatus>
{
    protected override void Configure(IEnumTypeDescriptor<JobCardStatus> descriptor)
    {
        descriptor.Description("Status of a job card");
    }
}

public class TaskStatusType : EnumType<Enums.TaskStatus>
{
    protected override void Configure(IEnumTypeDescriptor<Enums.TaskStatus> descriptor)
    {
        descriptor.Description("Status of a task");
    }
}
