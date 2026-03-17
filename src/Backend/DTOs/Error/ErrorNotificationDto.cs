namespace SoftwareUpdateManagement.API.DTOs.Error
{
    public class ErrorNotificationDto
    {
        public int ErrorNotificationId { get; set; }
        public int? CRFId { get; set; }
        public int? ClientId { get; set; }
        public string ErrorType { get; set; } = string.Empty;
        public string ErrorSource { get; set; } = string.Empty;
        public string ErrorMessage { get; set; } = string.Empty;
        public string StackTrace { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;
        public bool IsResolved { get; set; }
        public int? ResolvedBy { get; set; }
        public DateTime? ResolvedDate { get; set; }
        public string ResolutionNotes { get; set; } = string.Empty;
        public bool NotificationSent { get; set; }
        public DateTime? NotificationSentDate { get; set; }
        public DateTime CreatedDate { get; set; }
        public string CRFNumber { get; set; } = string.Empty;
        public string ClientName { get; set; } = string.Empty;
        public string ResolvedByName { get; set; } = string.Empty;
    }
}
