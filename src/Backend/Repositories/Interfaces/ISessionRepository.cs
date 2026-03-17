using SoftwareUpdateManagement.API.Models;

namespace SoftwareUpdateManagement.API.Repositories.Interfaces
{
    public interface ISessionRepository
    {
        Task<int> CreateSessionAsync(int userId, string token, string refreshToken, string ipAddress, string userAgent, DateTime expiresDate);
        Task<UserSession?> ValidateSessionAsync(string token);
        Task<int> InvalidateSessionAsync(string token);
    }
}
