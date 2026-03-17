using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoftwareUpdateManagement.API.DTOs.Common;
using SoftwareUpdateManagement.API.DTOs.Users;
using SoftwareUpdateManagement.API.Repositories.Interfaces;
using SoftwareUpdateManagement.API.Services.Interfaces;

namespace SoftwareUpdateManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly IAuthService _authService;
        private readonly ILogger<UsersController> _logger;

        public UsersController(IUserRepository userRepository, IAuthService authService, ILogger<UsersController> logger)
        {
            _userRepository = userRepository;
            _authService = authService;
            _logger = logger;
        }

        [HttpGet]
        [Authorize(Roles = "DevOps,Delivery")]
        public async Task<ActionResult<ApiResponse<IEnumerable<UserResponseDto>>>> GetAllUsers()
        {
            try
            {
                var users = await _userRepository.GetAllAsync();
                var userDtos = users.Select(u => new UserResponseDto
                {
                    UserId = u.UserId,
                    Username = u.Username,
                    Email = u.Email,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    Company = u.Company,
                    Roles = u.RoleName ?? "",
                    IsActive = u.IsActive,
                    CreatedDate = u.CreatedDate,
                    LastLoginDate = u.LastLoginDate
                });

                return Ok(ApiResponse<IEnumerable<UserResponseDto>>.SuccessResponse(userDtos));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all users");
                return StatusCode(500, ApiResponse<IEnumerable<UserResponseDto>>.ErrorResponse("An error occurred"));
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<UserResponseDto>>> GetUserById(int id)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(id);
                
                if (user == null)
                {
                    return NotFound(ApiResponse<UserResponseDto>.ErrorResponse("User not found"));
                }

                var userDto = new UserResponseDto
                {
                    UserId = user.UserId,
                    Username = user.Username,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Company = user.Company,
                    Roles = user.RoleName ?? "",
                    IsActive = user.IsActive,
                    CreatedDate = user.CreatedDate,
                    LastLoginDate = user.LastLoginDate
                };

                return Ok(ApiResponse<UserResponseDto>.SuccessResponse(userDto));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user {UserId}", id);
                return StatusCode(500, ApiResponse<UserResponseDto>.ErrorResponse("An error occurred"));
            }
        }

        [HttpPost]
        [Authorize(Roles = "DevOps")]
        public async Task<ActionResult<ApiResponse<int>>> CreateUser([FromBody] CreateUserRequestDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    return BadRequest(ApiResponse<int>.ErrorResponse("Validation failed", errors));
                }

                var existingUser = await _userRepository.GetByUsernameAsync(request.Username);
                if (existingUser != null)
                {
                    return BadRequest(ApiResponse<int>.ErrorResponse("Username already exists"));
                }

                var existingEmail = await _userRepository.GetByEmailAsync(request.Email);
                if (existingEmail != null)
                {
                    return BadRequest(ApiResponse<int>.ErrorResponse("Email already exists"));
                }

                var passwordHash = _authService.HashPassword(request.Password);

                var userId = await _userRepository.CreateAsync(
                    request.Username,
                    request.Email,
                    passwordHash,
                    request.FirstName,
                    request.LastName,
                    request.Company,
                    request.RoleId
                );

                _logger.LogInformation("User {Username} created successfully with ID {UserId}", request.Username, userId);
                return Ok(ApiResponse<int>.SuccessResponse(userId, "User created successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user {Username}", request.Username);
                return StatusCode(500, ApiResponse<int>.ErrorResponse("An error occurred while creating user"));
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "DevOps")]
        public async Task<ActionResult<ApiResponse<bool>>> UpdateUser(int id, [FromBody] UpdateUserRequestDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    return BadRequest(ApiResponse<bool>.ErrorResponse("Validation failed", errors));
                }

                var user = await _userRepository.GetByIdAsync(id);
                if (user == null)
                {
                    return NotFound(ApiResponse<bool>.ErrorResponse("User not found"));
                }

                var result = await _userRepository.UpdateAsync(
                    id,
                    request.Email,
                    request.FirstName,
                    request.LastName,
                    request.Company,
                    request.IsActive
                );

                if (result > 0)
                {
                    _logger.LogInformation("User {UserId} updated successfully", id);
                    return Ok(ApiResponse<bool>.SuccessResponse(true, "User updated successfully"));
                }

                return BadRequest(ApiResponse<bool>.ErrorResponse("Update failed"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user {UserId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse("An error occurred while updating user"));
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "DevOps")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteUser(int id)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(id);
                if (user == null)
                {
                    return NotFound(ApiResponse<bool>.ErrorResponse("User not found"));
                }

                var result = await _userRepository.DeleteAsync(id);

                if (result > 0)
                {
                    _logger.LogInformation("User {UserId} deleted successfully", id);
                    return Ok(ApiResponse<bool>.SuccessResponse(true, "User deleted successfully"));
                }

                return BadRequest(ApiResponse<bool>.ErrorResponse("Delete failed"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user {UserId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse("An error occurred while deleting user"));
            }
        }
    }
}
