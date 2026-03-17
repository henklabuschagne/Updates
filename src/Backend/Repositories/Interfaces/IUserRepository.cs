using SoftwareUpdateManagement.API.Models;

namespace SoftwareUpdateManagement.API.Repositories.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetByUsernameAsync(string username);
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByIdAsync(int userId);
        Task<IEnumerable<User>> GetAllAsync();
        Task<int> CreateAsync(string username, string email, string passwordHash, string firstName, string lastName, string company, int roleId);
        Task<int> UpdateAsync(int userId, string email, string firstName, string lastName, string company, bool isActive);
        Task<int> UpdatePasswordAsync(int userId, string passwordHash);
        Task UpdateLastLoginAsync(int userId);
        Task<int> DeleteAsync(int userId);
    }
}
