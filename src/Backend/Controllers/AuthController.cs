using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoftwareUpdateManagement.API.DTOs.Auth;
using SoftwareUpdateManagement.API.DTOs.Common;
using SoftwareUpdateManagement.API.Services.Interfaces;

namespace SoftwareUpdateManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<ApiResponse<LoginResponseDto>>> Login([FromBody] LoginRequestDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    return BadRequest(ApiResponse<LoginResponseDto>.ErrorResponse("Validation failed", errors));
                }

                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
                var userAgent = Request.Headers["User-Agent"].ToString();

                var result = await _authService.LoginAsync(request.Username, request.Password, ipAddress, userAgent);

                if (result == null)
                {
                    return Unauthorized(ApiResponse<LoginResponseDto>.ErrorResponse("Invalid username or password"));
                }

                _logger.LogInformation("User {Username} logged in successfully", request.Username);
                return Ok(ApiResponse<LoginResponseDto>.SuccessResponse(result, "Login successful"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login for user {Username}", request.Username);
                return StatusCode(500, ApiResponse<LoginResponseDto>.ErrorResponse("An error occurred during login"));
            }
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<bool>>> Logout()
        {
            try
            {
                var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
                var result = await _authService.LogoutAsync(token);

                if (result)
                {
                    _logger.LogInformation("User logged out successfully");
                    return Ok(ApiResponse<bool>.SuccessResponse(true, "Logout successful"));
                }

                return BadRequest(ApiResponse<bool>.ErrorResponse("Logout failed"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during logout");
                return StatusCode(500, ApiResponse<bool>.ErrorResponse("An error occurred during logout"));
            }
        }

        [HttpGet("current-user")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<UserDto>>> GetCurrentUser()
        {
            try
            {
                var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
                var user = await _authService.GetCurrentUserAsync(token);

                if (user == null)
                {
                    return Unauthorized(ApiResponse<UserDto>.ErrorResponse("Invalid or expired token"));
                }

                return Ok(ApiResponse<UserDto>.SuccessResponse(user));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting current user");
                return StatusCode(500, ApiResponse<UserDto>.ErrorResponse("An error occurred"));
            }
        }
    }
}
