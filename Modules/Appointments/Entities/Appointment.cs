using Gixat.Web.Shared.Entities;

namespace Gixat.Web.Modules.Appointments.Entities;

/// <summary>
/// Represents an appointment/booking for vehicle service
/// </summary>
public class Appointment : BaseEntity
{
    public Guid CompanyId { get; set; }
    public Guid BranchId { get; set; }
    
    // Client & Vehicle
    public Guid ClientId { get; set; }
    public Guid? ClientVehicleId { get; set; } // Optional - can book before knowing which vehicle
    
    // Appointment Details
    public string AppointmentNumber { get; set; } = string.Empty;
    public DateTime ScheduledDate { get; set; }
    public TimeSpan ScheduledTime { get; set; }
    public int DurationMinutes { get; set; } = 60; // Default 1 hour
    
    // Service Type
    public string ServiceType { get; set; } = string.Empty; // e.g., "Oil Change", "Inspection", "Repair"
    public string? Description { get; set; }
    
    // Status
    public AppointmentStatus Status { get; set; } = AppointmentStatus.Scheduled;
    
    // Assignment
    public Guid? ServiceAdvisorId { get; set; }
    public Guid? TechnicianId { get; set; }
    
    // Contact
    public string ContactPhone { get; set; } = string.Empty;
    public string? ContactEmail { get; set; }
    
    // Notes
    public string? CustomerNotes { get; set; }
    public string? InternalNotes { get; set; }
    
    // Confirmation
    public bool IsConfirmed { get; set; }
    public DateTime? ConfirmedAt { get; set; }
    
    // Reminders
    public bool ReminderSent { get; set; }
    public DateTime? ReminderSentAt { get; set; }
    
    // Completion
    public DateTime? CompletedAt { get; set; }
    public DateTime? CancelledAt { get; set; }
    public string? CancellationReason { get; set; }
    
    // Linked Session (when appointment is converted to actual service)
    public Guid? SessionId { get; set; }
}

public enum AppointmentStatus
{
    Scheduled,      // Initial booking
    Confirmed,      // Customer confirmed
    InProgress,     // Service started
    Completed,      // Service completed
    NoShow,         // Customer didn't show up
    Cancelled,      // Cancelled by customer or garage
    Rescheduled     // Moved to different time
}
