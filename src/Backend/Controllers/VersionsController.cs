using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoftwareUpdateManagement.API.DTOs.Common;
using SoftwareUpdateManagement.API.DTOs.Versions;
using SoftwareUpdateManagement.API.Repositories.Interfaces;
using System.Security.Claims;

namespace SoftwareUpdateManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class VersionsController : ControllerBase
    {
        private readonly IVersionRepository _versionRepository;
        private readonly ILogger<VersionsController> _logger;

        public VersionsController(IVersionRepository versionRepository, ILogger<VersionsController> logger)
        {
            _versionRepository = versionRepository;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<VersionResponseDto>>>> GetAllVersions([FromQuery] bool includeInactive = false)
        {
            try
            {
                var versions = await _versionRepository.GetAllAsync(includeInactive);
                var versionDtos = versions.Select(v => new VersionResponseDto
                {
                    VersionId = v.VersionId,
                    VersionNumber = v.VersionNumber,
                    VersionName = v.VersionName,
                    ReleaseDate = v.ReleaseDate,
                    Description = v.Description,
                    ReleaseNotes = v.ReleaseNotes,
                    IsMajorRelease = v.IsMajorRelease,
                    IsActive = v.IsActive,
                    CreatedBy = v.CreatedBy,
                    CreatedByName = v.CreatedByName ?? "",
                    CreatedDate = v.CreatedDate,
                    UpdatedDate = v.UpdatedDate,
                    ClientCount = v.ClientCount
                });

                return Ok(ApiResponse<IEnumerable<VersionResponseDto>>.SuccessResponse(versionDtos));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all versions");
                return StatusCode(500, ApiResponse<IEnumerable<VersionResponseDto>>.ErrorResponse("An error occurred"));
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<VersionResponseDto>>> GetVersionById(int id)
        {
            try
            {
                var version = await _versionRepository.GetByIdAsync(id);
                
                if (version == null)
                {
                    return NotFound(ApiResponse<VersionResponseDto>.ErrorResponse("Version not found"));
                }

                var versionDto = new VersionResponseDto
                {
                    VersionId = version.VersionId,
                    VersionNumber = version.VersionNumber,
                    VersionName = version.VersionName,
                    ReleaseDate = version.ReleaseDate,
                    Description = version.Description,
                    ReleaseNotes = version.ReleaseNotes,
                    IsMajorRelease = version.IsMajorRelease,
                    IsActive = version.IsActive,
                    CreatedBy = version.CreatedBy,
                    CreatedByName = version.CreatedByName ?? "",
                    CreatedDate = version.CreatedDate,
                    UpdatedDate = version.UpdatedDate,
                    ClientCount = version.ClientCount
                };

                return Ok(ApiResponse<VersionResponseDto>.SuccessResponse(versionDto));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting version {VersionId}", id);
                return StatusCode(500, ApiResponse<VersionResponseDto>.ErrorResponse("An error occurred"));
            }
        }

        [HttpPost]
        [Authorize(Roles = "DevOps")]
        public async Task<ActionResult<ApiResponse<int>>> CreateVersion([FromBody] CreateVersionRequestDto request)
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

                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");

                var versionId = await _versionRepository.CreateAsync(
                    request.VersionNumber,
                    request.VersionName,
                    request.ReleaseDate,
                    request.Description,
                    request.ReleaseNotes,
                    request.IsMajorRelease,
                    userId
                );

                _logger.LogInformation("Version {VersionNumber} created successfully with ID {VersionId}", request.VersionNumber, versionId);
                return Ok(ApiResponse<int>.SuccessResponse(versionId, "Version created successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating version {VersionNumber}", request.VersionNumber);
                return StatusCode(500, ApiResponse<int>.ErrorResponse(ex.Message));
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "DevOps")]
        public async Task<ActionResult<ApiResponse<bool>>> UpdateVersion(int id, [FromBody] UpdateVersionRequestDto request)
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

                var version = await _versionRepository.GetByIdAsync(id);
                if (version == null)
                {
                    return NotFound(ApiResponse<bool>.ErrorResponse("Version not found"));
                }

                var result = await _versionRepository.UpdateAsync(
                    id,
                    request.VersionNumber,
                    request.VersionName,
                    request.ReleaseDate,
                    request.Description,
                    request.ReleaseNotes,
                    request.IsMajorRelease,
                    request.IsActive
                );

                if (result > 0)
                {
                    _logger.LogInformation("Version {VersionId} updated successfully", id);
                    return Ok(ApiResponse<bool>.SuccessResponse(true, "Version updated successfully"));
                }

                return BadRequest(ApiResponse<bool>.ErrorResponse("Update failed"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating version {VersionId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(ex.Message));
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "DevOps")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteVersion(int id)
        {
            try
            {
                var version = await _versionRepository.GetByIdAsync(id);
                if (version == null)
                {
                    return NotFound(ApiResponse<bool>.ErrorResponse("Version not found"));
                }

                var result = await _versionRepository.DeleteAsync(id);

                if (result > 0)
                {
                    _logger.LogInformation("Version {VersionId} deleted successfully", id);
                    return Ok(ApiResponse<bool>.SuccessResponse(true, "Version deleted successfully"));
                }

                return BadRequest(ApiResponse<bool>.ErrorResponse("Delete failed"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting version {VersionId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(ex.Message));
            }
        }
    }
}
