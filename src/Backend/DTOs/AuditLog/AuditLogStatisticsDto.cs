namespace SoftwareUpdateManagement.API.DTOs.AuditLog
{
    public class AuditLogStatisticsDto
    {
        public int TotalActions { get; set; }
        public int UniqueUsers { get; set; }
        public Dictionary<string, int> ActionsByType { get; set; } = new Dictionary<string, int>();
        public Dictionary<string, int> ActionsByEntity { get; set; } = new Dictionary<string, int>();
        public IEnumerable<TopUserActivity> MostActiveUsers { get; set; } = new List<TopUserActivity>();
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }

    public class TopUserActivity
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public int ActionCount { get; set; }
    }
}
