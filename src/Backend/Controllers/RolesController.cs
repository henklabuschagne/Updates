using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoftwareUpdateManagement.API.DTOs.Common;
using SoftwareUpdateManagement.API.DTOs.Roles;
using SoftwareUpdateManagement.API.Repositories.Interfaces;

namespace SoftwareUpdateManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RolesController : ControllerBase
    {
        private readonly IRoleRepository _roleRepository;
        private readonly ILogger<RolesController> _logger;

        public RolesController(IRoleRepository roleRepository, ILogger<RolesController> logger)
        {
            _roleRepository = roleRepository;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<RoleDto>>>> GetAllRoles()
        {
            try
            {
                var roles = await _roleRepository.GetAllAsync();
                var roleDtos = roles.Select(r => new RoleDto
                {
                    RoleId = r.RoleId,
                    RoleName = r.RoleName,
                    Description = r.Description,
                    IsActive = r.IsActive
                });

                return Ok(ApiResponse<IEnumerable<RoleDto>>.SuccessResponse(roleDtos));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all roles");
                return StatusCode(500, ApiResponse<IEnumerable<RoleDto>>.ErrorResponse("An error occurred"));
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<RoleDto>>> GetRoleById(int id)
        {
            try
            {
                var role = await _roleRepository.GetByIdAsync(id);
                
                if (role == null)
                {
                    return NotFound(ApiResponse<RoleDto>.ErrorResponse("Role not found"));
                }

                var roleDto = new RoleDto
                {
                    RoleId = role.RoleId,
                    RoleName = role.RoleName,
                    Description = role.Description,
                    IsActive = role.IsActive
                };

                return Ok(ApiResponse<RoleDto>.SuccessResponse(roleDto));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting role {RoleId}", id);
                return StatusCode(500, ApiResponse<RoleDto>.ErrorResponse("An error occurred"));
            }
        }
    }
}
