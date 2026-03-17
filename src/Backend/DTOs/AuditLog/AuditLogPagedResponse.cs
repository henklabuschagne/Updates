namespace SoftwareUpdateManagement.API.DTOs.AuditLog
{
    public class AuditLogPagedResponse
    {
        public IEnumerable<AuditLogDto> Logs { get; set; } = new List<AuditLogDto>();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
        public bool HasPrevious => PageNumber > 1;
        public bool HasNext => PageNumber < TotalPages;
    }
}
