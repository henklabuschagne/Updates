namespace SoftwareUpdateManagement.API.Models
{
    public class UserSession
    {
        public int SessionId { get; set; }
        public int UserId { get; set; }
        public string Token { get; set; } = string.Empty;
        public string? RefreshToken { get; set; }
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime ExpiresDate { get; set; }
        public bool IsActive { get; set; }
    }
}
