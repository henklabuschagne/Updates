namespace SoftwareUpdateManagement.API.Models
{
    public class APIExecutionLog
    {
        public int APIExecutionLogId { get; set; }
        public int CRFId { get; set; }
        public int? ClientId { get; set; }
        public int APIConfigurationId { get; set; }
        public string ExecutionType { get; set; } = string.Empty;
        public string RequestURL { get; set; } = string.Empty;
        public string? RequestHeaders { get; set; }
        public string? RequestBody { get; set; }
        public int? ResponseStatusCode { get; set; }
        public string? ResponseBody { get; set; }
        public DateTime ExecutionStartTime { get; set; }
        public DateTime? ExecutionEndTime { get; set; }
        public int? DurationMs { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? ErrorMessage { get; set; }
        public int RetryAttempt { get; set; }
        public string? APIName { get; set; }
        public string? ClientName { get; set; }
        public string? CRFNumber { get; set; }
    }
}
