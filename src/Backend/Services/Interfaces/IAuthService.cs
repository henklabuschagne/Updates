using SoftwareUpdateManagement.API.DTOs.Auth;

namespace SoftwareUpdateManagement.API.Services.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResponseDto?> LoginAsync(string username, string password, string ipAddress, string userAgent);
        Task<bool> LogoutAsync(string token);
        Task<UserDto?> GetCurrentUserAsync(string token);
        string GenerateToken(int userId, string username, string role);
        string GenerateRefreshToken();
        bool ValidatePassword(string password, string passwordHash);
        string HashPassword(string password);
    }
}
