namespace SoftwareUpdateManagement.API.DTOs.BulkOperations
{
    public class BulkOperationStatisticsDto
    {
        public int TotalOperations { get; set; }
        public int CompletedOperations { get; set; }
        public int FailedOperations { get; set; }
        public int InProgressOperations { get; set; }
        public Dictionary<string, int> OperationsByType { get; set; } = new Dictionary<string, int>();
        public int TotalItemsProcessed { get; set; }
        public int TotalSuccessfulItems { get; set; }
        public int TotalFailedItems { get; set; }
        public double AverageSuccessRate { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}
