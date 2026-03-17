using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoftwareUpdateManagement.API.DTOs.API;
using SoftwareUpdateManagement.API.DTOs.Common;
using SoftwareUpdateManagement.API.Repositories.Interfaces;
using System.Security.Claims;

namespace SoftwareUpdateManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "DevOps")]
    public class APIConfigurationController : ControllerBase
    {
        private readonly IAPIConfigurationRepository _apiConfigRepository;
        private readonly ILogger<APIConfigurationController> _logger;

        public APIConfigurationController(IAPIConfigurationRepository apiConfigRepository, 
            ILogger<APIConfigurationController> logger)
        {
            _apiConfigRepository = apiConfigRepository;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<APIConfigurationDto>>>> GetAllConfigurations([FromQuery] string? apiType = null)
        {
            try
            {
                var configs = await _apiConfigRepository.GetAllAsync(apiType);
                var configDtos = configs.Select(c => new APIConfigurationDto
                {
                    APIConfigurationId = c.APIConfigurationId,
                    APIName = c.APIName,
                    APIType = c.APIType,
                    HTTPMethod = c.HTTPMethod,
                    EndpointURL = c.EndpointURL,
                    ExecutionOrder = c.ExecutionOrder,
                    Headers = c.Headers ?? "",
                    RequestBody = c.RequestBody ?? "",
                    TimeoutSeconds = c.TimeoutSeconds,
                    RetryCount = c.RetryCount,
                    IsEnabled = c.IsEnabled,
                    Description = c.Description ?? "",
                    CreatedDate = c.CreatedDate,
                    UpdatedDate = c.UpdatedDate,
                    CreatedBy = c.CreatedBy,
                    CreatedByName = c.CreatedByName ?? ""
                });

                return Ok(ApiResponse<IEnumerable<APIConfigurationDto>>.SuccessResponse(configDtos));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting API configurations");
                return StatusCode(500, ApiResponse<IEnumerable<APIConfigurationDto>>.ErrorResponse("An error occurred"));
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<APIConfigurationDto>>> GetConfigurationById(int id)
        {
            try
            {
                var config = await _apiConfigRepository.GetByIdAsync(id);
                
                if (config == null)
                {
                    return NotFound(ApiResponse<APIConfigurationDto>.ErrorResponse("API configuration not found"));
                }

                var configDto = new APIConfigurationDto
                {
                    APIConfigurationId = config.APIConfigurationId,
                    APIName = config.APIName,
                    APIType = config.APIType,
                    HTTPMethod = config.HTTPMethod,
                    EndpointURL = config.EndpointURL,
                    ExecutionOrder = config.ExecutionOrder,
                    Headers = config.Headers ?? "",
                    RequestBody = config.RequestBody ?? "",
                    TimeoutSeconds = config.TimeoutSeconds,
                    RetryCount = config.RetryCount,
                    IsEnabled = config.IsEnabled,
                    Description = config.Description ?? "",
                    CreatedDate = config.CreatedDate,
                    UpdatedDate = config.UpdatedDate,
                    CreatedBy = config.CreatedBy,
                    CreatedByName = config.CreatedByName ?? ""
                };

                return Ok(ApiResponse<APIConfigurationDto>.SuccessResponse(configDto));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting API configuration {APIConfigurationId}", id);
                return StatusCode(500, ApiResponse<APIConfigurationDto>.ErrorResponse("An error occurred"));
            }
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<int>>> CreateConfiguration([FromBody] CreateAPIConfigurationRequestDto request)
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

                var configId = await _apiConfigRepository.CreateAsync(
                    request.APIName,
                    request.APIType,
                    request.HTTPMethod,
                    request.EndpointURL,
                    request.ExecutionOrder,
                    request.Headers,
                    request.RequestBody,
                    request.TimeoutSeconds,
                    request.RetryCount,
                    request.IsEnabled,
                    request.Description,
                    userId
                );

                _logger.LogInformation("API configuration {APIName} created successfully", request.APIName);
                return Ok(ApiResponse<int>.SuccessResponse(configId, "API configuration created successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating API configuration");
                return StatusCode(500, ApiResponse<int>.ErrorResponse(ex.Message));
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> UpdateConfiguration(int id, [FromBody] UpdateAPIConfigurationRequestDto request)
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

                var config = await _apiConfigRepository.GetByIdAsync(id);
                if (config == null)
                {
                    return NotFound(ApiResponse<bool>.ErrorResponse("API configuration not found"));
                }

                var result = await _apiConfigRepository.UpdateAsync(
                    id,
                    request.APIName,
                    request.HTTPMethod,
                    request.EndpointURL,
                    request.ExecutionOrder,
                    request.Headers,
                    request.RequestBody,
                    request.TimeoutSeconds,
                    request.RetryCount,
                    request.IsEnabled,
                    request.Description
                );

                if (result > 0)
                {
                    _logger.LogInformation("API configuration {APIConfigurationId} updated successfully", id);
                    return Ok(ApiResponse<bool>.SuccessResponse(true, "API configuration updated successfully"));
                }

                return BadRequest(ApiResponse<bool>.ErrorResponse("Update failed"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating API configuration {APIConfigurationId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(ex.Message));
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteConfiguration(int id)
        {
            try
            {
                var config = await _apiConfigRepository.GetByIdAsync(id);
                if (config == null)
                {
                    return NotFound(ApiResponse<bool>.ErrorResponse("API configuration not found"));
                }

                var result = await _apiConfigRepository.DeleteAsync(id);

                if (result > 0)
                {
                    _logger.LogInformation("API configuration {APIConfigurationId} deleted successfully", id);
                    return Ok(ApiResponse<bool>.SuccessResponse(true, "API configuration deleted successfully"));
                }

                return BadRequest(ApiResponse<bool>.ErrorResponse("Delete failed"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting API configuration {APIConfigurationId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(ex.Message));
            }
        }

        [HttpPut("{id}/toggle")]
        public async Task<ActionResult<ApiResponse<bool>>> ToggleConfiguration(int id, [FromBody] bool isEnabled)
        {
            try
            {
                var config = await _apiConfigRepository.GetByIdAsync(id);
                if (config == null)
                {
                    return NotFound(ApiResponse<bool>.ErrorResponse("API configuration not found"));
                }

                var result = await _apiConfigRepository.ToggleAsync(id, isEnabled);

                if (result > 0)
                {
                    _logger.LogInformation("API configuration {APIConfigurationId} toggled to {IsEnabled}", id, isEnabled);
                    return Ok(ApiResponse<bool>.SuccessResponse(true, "API configuration toggled successfully"));
                }

                return BadRequest(ApiResponse<bool>.ErrorResponse("Toggle failed"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error toggling API configuration {APIConfigurationId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(ex.Message));
            }
        }

        [HttpGet("execution-logs")]
        public async Task<ActionResult<ApiResponse<IEnumerable<APIExecutionLogDto>>>> GetExecutionLogs(
            [FromQuery] int? crfId = null, [FromQuery] int? clientId = null, [FromQuery] string? status = null)
        {
            try
            {
                var logs = await _apiConfigRepository.GetExecutionLogsAsync(crfId, clientId, status);
                var logDtos = logs.Select(l => new APIExecutionLogDto
                {
                    APIExecutionLogId = l.APIExecutionLogId,
                    CRFId = l.CRFId,
                    ClientId = l.ClientId,
                    APIConfigurationId = l.APIConfigurationId,
                    ExecutionType = l.ExecutionType,
                    RequestURL = l.RequestURL,
                    RequestHeaders = l.RequestHeaders ?? "",
                    RequestBody = l.RequestBody ?? "",
                    ResponseStatusCode = l.ResponseStatusCode,
                    ResponseBody = l.ResponseBody ?? "",
                    ExecutionStartTime = l.ExecutionStartTime,
                    ExecutionEndTime = l.ExecutionEndTime,
                    DurationMs = l.DurationMs,
                    Status = l.Status,
                    ErrorMessage = l.ErrorMessage ?? "",
                    RetryAttempt = l.RetryAttempt,
                    APIName = l.APIName ?? "",
                    ClientName = l.ClientName ?? "",
                    CRFNumber = l.CRFNumber ?? ""
                });

                return Ok(ApiResponse<IEnumerable<APIExecutionLogDto>>.SuccessResponse(logDtos));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting API execution logs");
                return StatusCode(500, ApiResponse<IEnumerable<APIExecutionLogDto>>.ErrorResponse("An error occurred"));
            }
        }
    }
}
