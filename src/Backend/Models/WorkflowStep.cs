namespace SoftwareUpdateManagement.API.Models
{
    public class WorkflowStep
    {
        public int WorkflowStepId { get; set; }
        public string StepName { get; set; } = string.Empty;
        public int StepOrder { get; set; }
        public bool IsRequired { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedDate { get; set; }
    }
}
