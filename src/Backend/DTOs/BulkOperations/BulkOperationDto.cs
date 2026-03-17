namespace SoftwareUpdateManagement.API.DTOs.BulkOperations
{
    public class BulkOperationDto
    {
        public int BulkOperationId { get; set; }
        public string OperationType { get; set; } = string.Empty;
        public int InitiatedBy { get; set; }
        public string InitiatedByName { get; set; } = string.Empty;
        public DateTime InitiatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string Status { get; set; } = string.Empty;
        public int TotalItems { get; set; }
        public int ProcessedItems { get; set; }
        public int SuccessfulItems { get; set; }
        public int FailedItems { get; set; }
        public string? ErrorMessage { get; set; }
        public string? ResultData { get; set; }
        public string? InputData { get; set; }
    }
}
