using Microsoft.IdentityModel.Tokens;
using SoftwareUpdateManagement.API.DTOs.Auth;
using SoftwareUpdateManagement.API.Repositories.Interfaces;
using SoftwareUpdateManagement.API.Services.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace SoftwareUpdateManagement.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly ISessionRepository _sessionRepository;
        private readonly IConfiguration _configuration;

        public AuthService(IUserRepository userRepository, ISessionRepository sessionRepository, IConfiguration configuration)
        {
            _userRepository = userRepository;
            _sessionRepository = sessionRepository;
            _configuration = configuration;
        }

        public async Task<LoginResponseDto?> LoginAsync(string username, string password, string ipAddress, string userAgent)
        {
            var user = await _userRepository.GetByUsernameAsync(username);
            
            if (user == null || !user.IsActive)
                return null;

            if (!ValidatePassword(password, user.PasswordHash))
                return null;

            var token = GenerateToken(user.UserId, user.Username, user.RoleName ?? "Client");
            var refreshToken = GenerateRefreshToken();
            var expiresAt = DateTime.UtcNow.AddHours(8);

            await _sessionRepository.CreateSessionAsync(
                user.UserId, 
                token, 
                refreshToken, 
                ipAddress, 
                userAgent, 
                expiresAt
            );

            await _userRepository.UpdateLastLoginAsync(user.UserId);

            return new LoginResponseDto
            {
                Token = token,
                RefreshToken = refreshToken,
                ExpiresAt = expiresAt,
                User = new UserDto
                {
                    UserId = user.UserId,
                    Username = user.Username,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Company = user.Company,
                    Role = user.RoleName ?? "Client",
                    IsActive = user.IsActive,
                    LastLoginDate = user.LastLoginDate
                }
            };
        }

        public async Task<bool> LogoutAsync(string token)
        {
            var result = await _sessionRepository.InvalidateSessionAsync(token);
            return result > 0;
        }

        public async Task<UserDto?> GetCurrentUserAsync(string token)
        {
            var session = await _sessionRepository.ValidateSessionAsync(token);
            if (session == null)
                return null;

            var user = await _userRepository.GetByIdAsync(session.UserId);
            if (user == null)
                return null;

            return new UserDto
            {
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Company = user.Company,
                Role = user.RoleName ?? "Client",
                IsActive = user.IsActive,
                LastLoginDate = user.LastLoginDate
            };
        }

        public string GenerateToken(int userId, string username, string role)
        {
            var jwtKey = _configuration["Jwt:Key"] ?? "YourSuperSecretKeyForJWTTokenGeneration123!@#";
            var jwtIssuer = _configuration["Jwt:Issuer"] ?? "SoftwareUpdateManagement";
            var jwtAudience = _configuration["Jwt:Audience"] ?? "SoftwareUpdateManagement";

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Name, username),
                new Claim(ClaimTypes.Role, role),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(8),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public string GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

        public bool ValidatePassword(string password, string passwordHash)
        {
            // Simple comparison for demo - in production use proper password hashing
            return HashPassword(password) == passwordHash;
        }

        public string HashPassword(string password)
        {
            // Simple hash for demo - in production use BCrypt or ASP.NET Core Identity
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }
    }
}
