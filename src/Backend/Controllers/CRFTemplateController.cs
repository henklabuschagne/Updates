using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoftwareUpdateManagement.API.DTOs.Common;
using SoftwareUpdateManagement.API.DTOs.CRFTemplate;
using SoftwareUpdateManagement.API.Repositories.Interfaces;
using System.Security.Claims;

namespace SoftwareUpdateManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CRFTemplateController : ControllerBase
    {
        private readonly ICRFTemplateRepository _repository;
        private readonly ILogger<CRFTemplateController> _logger;

        public CRFTemplateController(ICRFTemplateRepository repository, ILogger<CRFTemplateController> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<CRFTemplateDto>>>> GetAll()
        {
            try
            {
                var templates = await _repository.GetAllCRFTemplates();
                return Ok(ApiResponse<IEnumerable<CRFTemplateDto>>.SuccessResponse(templates));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting CRF templates");
                return StatusCode(500, ApiResponse<IEnumerable<CRFTemplateDto>>.ErrorResponse("An error occurred while retrieving CRF templates"));
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<CRFTemplateDto>>> GetById(int id)
        {
            try
            {
                var template = await _repository.GetCRFTemplateById(id);
                
                if (template == null)
                {
                    return NotFound(ApiResponse<CRFTemplateDto>.ErrorResponse($"CRF template with ID {id} not found"));
                }

                return Ok(ApiResponse<CRFTemplateDto>.SuccessResponse(template));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting CRF template {TemplateId}", id);
                return StatusCode(500, ApiResponse<CRFTemplateDto>.ErrorResponse("An error occurred while retrieving the CRF template"));
            }
        }

        [HttpPost]
        [Authorize(Roles = "DevOps")]
        public async Task<ActionResult<ApiResponse<int>>> Create([FromBody] CreateCRFTemplateDto request)
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

                // Get current user ID from claims
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int createdBy))
                {
                    return Unauthorized(ApiResponse<int>.ErrorResponse("User not authenticated"));
                }

                var templateId = await _repository.CreateCRFTemplate(request, createdBy);

                _logger.LogInformation("CRF template {TemplateName} created successfully with ID {TemplateId}", request.TemplateName, templateId);
                return Ok(ApiResponse<int>.SuccessResponse(templateId, "CRF template created successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating CRF template {TemplateName}", request.TemplateName);
                return StatusCode(500, ApiResponse<int>.ErrorResponse(ex.Message));
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "DevOps")]
        public async Task<ActionResult<ApiResponse<bool>>> Update(int id, [FromBody] UpdateCRFTemplateDto request)
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

                var result = await _repository.UpdateCRFTemplate(id, request);

                if (result)
                {
                    _logger.LogInformation("CRF template {TemplateId} updated successfully", id);
                    return Ok(ApiResponse<bool>.SuccessResponse(true, "CRF template updated successfully"));
                }

                return NotFound(ApiResponse<bool>.ErrorResponse($"CRF template with ID {id} not found"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating CRF template {TemplateId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(ex.Message));
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "DevOps")]
        public async Task<ActionResult<ApiResponse<bool>>> Delete(int id)
        {
            try
            {
                var result = await _repository.DeleteCRFTemplate(id);

                if (result)
                {
                    _logger.LogInformation("CRF template {TemplateId} deleted successfully", id);
                    return Ok(ApiResponse<bool>.SuccessResponse(true, "CRF template deleted successfully"));
                }

                return NotFound(ApiResponse<bool>.ErrorResponse($"CRF template with ID {id} not found"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting CRF template {TemplateId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(ex.Message));
            }
        }

        [HttpGet("by-name/{templateName}")]
        public async Task<ActionResult<ApiResponse<CRFTemplateDto>>> GetByName(string templateName)
        {
            try
            {
                var template = await _repository.GetCRFTemplateByName(templateName);
                
                if (template == null)
                {
                    return NotFound(ApiResponse<CRFTemplateDto>.ErrorResponse($"CRF template '{templateName}' not found"));
                }

                return Ok(ApiResponse<CRFTemplateDto>.SuccessResponse(template));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting CRF template by name {TemplateName}", templateName);
                return StatusCode(500, ApiResponse<CRFTemplateDto>.ErrorResponse("An error occurred while retrieving the CRF template"));
            }
        }
    }
}
