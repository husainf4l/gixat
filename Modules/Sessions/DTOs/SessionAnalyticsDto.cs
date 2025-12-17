namespace Gixat.Web.Modules.Sessions.DTOs;

public class SessionAnalyticsDto
{
    public double AverageCompletionHours { get; set; }
    public int WeekSessions { get; set; }
    public int MonthSessions { get; set; }
    public int CompletedThisWeek { get; set; }
    public int CompletedThisMonth { get; set; }
}
