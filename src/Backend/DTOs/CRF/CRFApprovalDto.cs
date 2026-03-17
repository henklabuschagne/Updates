namespace SoftwareUpdateManagement.API.DTOs.CRF
{
    public class CRFApprovalDto
    {
        public int CRFApprovalId { get; set; }
        public int CRFId { get; set; }
        public int WorkflowStepId { get; set; }
        public string StepName { get; set; } = string.Empty;
        public int StepOrder { get; set; }
        public int? ApproverUserId { get; set; }
        public string ApproverName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime? ApprovalDate { get; set; }
        public string Comments { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
    }
}
