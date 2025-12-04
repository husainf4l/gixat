namespace Gixat.Web.Modules.Sessions.DTOs;

public class SessionStatsDto
{
    public int ActiveSessions { get; set; }
    public int TodaySessions { get; set; }
    public int InProgressSessions { get; set; }
    public int AwaitingPickup { get; set; }
}
