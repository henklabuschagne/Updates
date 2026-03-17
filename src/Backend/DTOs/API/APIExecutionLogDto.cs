namespace SoftwareUpdateManagement.API.DTOs.API
{
    public class APIExecutionLogDto
    {
        public int APIExecutionLogId { get; set; }
        public int CRFId { get; set; }
        public int? ClientId { get; set; }
        public int APIConfigurationId { get; set; }
        public string ExecutionType { get; set; } = string.Empty;
        public string RequestURL { get; set; } = string.Empty;
        public string RequestHeaders { get; set; } = string.Empty;
        public string RequestBody { get; set; } = string.Empty;
        public int? ResponseStatusCode { get; set; }
        public string ResponseBody { get; set; } = string.Empty;
        public DateTime ExecutionStartTime { get; set; }
        public DateTime? ExecutionEndTime { get; set; }
        public int? DurationMs { get; set; }
        public string Status { get; set; } = string.Empty;
        public string ErrorMessage { get; set; } = string.Empty;
        public int RetryAttempt { get; set; }
        public string APIName { get; set; } = string.Empty;
        public string ClientName { get; set; } = string.Empty;
        public string CRFNumber { get; set; } = string.Empty;
    }
}
