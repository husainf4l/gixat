namespace Gixat.Web.Modules.Sessions.Enums;

/// <summary>
/// Represents the current status of a garage session
/// </summary>
public enum SessionStatus
{
    /// <summary>
    /// Session created, vehicle checked in
    /// </summary>
    CheckedIn = 0,
    
    /// <summary>
    /// Customer request is being collected
    /// </summary>
    CustomerRequest = 1,
    
    /// <summary>
    /// Vehicle inspection in progress
    /// </summary>
    Inspection = 2,
    
    /// <summary>
    /// Test drive in progress
    /// </summary>
    TestDrive = 3,
    
    /// <summary>
    /// Initial report generated, awaiting approval
    /// </summary>
    AwaitingApproval = 4,
    
    /// <summary>
    /// Work approved, job card created
    /// </summary>
    InProgress = 5,
    
    /// <summary>
    /// Final quality check in progress
    /// </summary>
    QualityCheck = 6,
    
    /// <summary>
    /// All work completed
    /// </summary>
    Completed = 7,
    
    /// <summary>
    /// Vehicle ready for pickup
    /// </summary>
    ReadyForPickup = 8,
    
    /// <summary>
    /// Vehicle picked up, session closed
    /// </summary>
    Closed = 9,
    
    /// <summary>
    /// Session cancelled
    /// </summary>
    Cancelled = 10
}

/// <summary>
/// Type of media item stored in AWS S3
/// </summary>
public enum MediaType
{
    Image = 0,
    Video = 1
}

/// <summary>
/// Category for media items
/// </summary>
public enum MediaCategory
{
    CustomerRequest = 0,
    Inspection = 1,
    TestDrive = 2,
    JobCard = 3,
    BeforeWork = 4,
    AfterWork = 5,
    Other = 6
}

/// <summary>
/// Status for request-type items (CustomerRequest, Inspection, TestDrive)
/// </summary>
public enum RequestStatus
{
    Pending = 0,
    InProgress = 1,
    Completed = 2,
    Cancelled = 3
}

/// <summary>
/// Priority level for issues/requests
/// </summary>
public enum Priority
{
    Low = 0,
    Normal = 1,
    High = 2,
    Urgent = 3
}

/// <summary>
/// Status for job card items
/// </summary>
public enum JobCardStatus
{
    Draft = 0,
    Pending = 1,
    Approved = 2,
    InProgress = 3,
    WaitingParts = 4,
    QualityCheck = 5,
    Completed = 6,
    OnHold = 7,
    Cancelled = 8
}

/// <summary>
/// Status for individual job card tasks
/// </summary>
public enum TaskStatus
{
    Pending = 0,
    Assigned = 1,
    InProgress = 2,
    Completed = 3,
    Deferred = 4,
    Cancelled = 5
}
