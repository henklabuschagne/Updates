using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoftwareUpdateManagement.API.DTOs.Common;
using SoftwareUpdateManagement.API.DTOs.Error;
using SoftwareUpdateManagement.API.Repositories.Interfaces;
using System.Security.Claims;

namespace SoftwareUpdateManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ErrorNotificationController : ControllerBase
    {
        private readonly IErrorNotificationRepository _errorRepository;
        private readonly ILogger<ErrorNotificationController> _logger;

        public ErrorNotificationController(IErrorNotificationRepository errorRepository, 
            ILogger<ErrorNotificationController> logger)
        {
            _errorRepository = errorRepository;
            _logger = logger;
        }

        [HttpGet]
        [Authorize(Roles = "DevOps,Delivery")]
        public async Task<ActionResult<ApiResponse<IEnumerable<ErrorNotificationDto>>>> GetAllErrors(
            [FromQuery] bool? isResolved = null, [FromQuery] string? severity = null, [FromQuery] string? errorType = null)
        {
            try
            {
                var errors = await _errorRepository.GetAllAsync(isResolved, severity, errorType);
                var errorDtos = errors.Select(e => new ErrorNotificationDto
                {
                    ErrorNotificationId = e.ErrorNotificationId,
                    CRFId = e.CRFId,
                    ClientId = e.ClientId,
                    ErrorType = e.ErrorType,
                    ErrorSource = e.ErrorSource,
                    ErrorMessage = e.ErrorMessage,
                    StackTrace = e.StackTrace ?? "",
                    Severity = e.Severity,
                    IsResolved = e.IsResolved,
                    ResolvedBy = e.ResolvedBy,
                    ResolvedDate = e.ResolvedDate,
                    ResolutionNotes = e.ResolutionNotes ?? "",
                    NotificationSent = e.NotificationSent,
                    NotificationSentDate = e.NotificationSentDate,
                    CreatedDate = e.CreatedDate,
                    CRFNumber = e.CRFNumber ?? "",
                    ClientName = e.ClientName ?? "",
                    ResolvedByName = e.ResolvedByName ?? ""
                });

                return Ok(ApiResponse<IEnumerable<ErrorNotificationDto>>.SuccessResponse(errorDtos));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting error notifications");
                return StatusCode(500, ApiResponse<IEnumerable<ErrorNotificationDto>>.ErrorResponse("An error occurred"));
            }
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "DevOps,Delivery")]
        public async Task<ActionResult<ApiResponse<ErrorNotificationDto>>> GetErrorById(int id)
        {
            try
            {
                var error = await _errorRepository.GetByIdAsync(id);
                
                if (error == null)
                {
                    return NotFound(ApiResponse<ErrorNotificationDto>.ErrorResponse("Error notification not found"));
                }

                var errorDto = new ErrorNotificationDto
                {
                    ErrorNotificationId = error.ErrorNotificationId,
                    CRFId = error.CRFId,
                    ClientId = error.ClientId,
                    ErrorType = error.ErrorType,
                    ErrorSource = error.ErrorSource,
                    ErrorMessage = error.ErrorMessage,
                    StackTrace = error.StackTrace ?? "",
                    Severity = error.Severity,
                    IsResolved = error.IsResolved,
                    ResolvedBy = error.ResolvedBy,
                    ResolvedDate = error.ResolvedDate,
                    ResolutionNotes = error.ResolutionNotes ?? "",
                    NotificationSent = error.NotificationSent,
                    NotificationSentDate = error.NotificationSentDate,
                    CreatedDate = error.CreatedDate,
                    CRFNumber = error.CRFNumber ?? "",
                    ClientName = error.ClientName ?? "",
                    ResolvedByName = error.ResolvedByName ?? ""
                };

                return Ok(ApiResponse<ErrorNotificationDto>.SuccessResponse(errorDto));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting error notification {ErrorNotificationId}", id);
                return StatusCode(500, ApiResponse<ErrorNotificationDto>.ErrorResponse("An error occurred"));
            }
        }

        [HttpPost]
        [Authorize(Roles = "DevOps,Delivery")]
        public async Task<ActionResult<ApiResponse<int>>> CreateError([FromBody] CreateErrorNotificationRequestDto request)
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

                var errorId = await _errorRepository.CreateAsync(
                    request.CRFId,
                    request.ClientId,
                    request.ErrorType,
                    request.ErrorSource,
                    request.ErrorMessage,
                    request.StackTrace,
                    request.Severity
                );

                _logger.LogInformation("Error notification created successfully");
                return Ok(ApiResponse<int>.SuccessResponse(errorId, "Error notification created successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating error notification");
                return StatusCode(500, ApiResponse<int>.ErrorResponse(ex.Message));
            }
        }

        [HttpPut("{id}/resolve")]
        [Authorize(Roles = "DevOps,Delivery")]
        public async Task<ActionResult<ApiResponse<bool>>> ResolveError(int id, [FromBody] ResolveErrorRequestDto request)
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

                var error = await _errorRepository.GetByIdAsync(id);
                if (error == null)
                {
                    return NotFound(ApiResponse<bool>.ErrorResponse("Error notification not found"));
                }

                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");

                var result = await _errorRepository.ResolveAsync(id, userId, request.ResolutionNotes);

                if (result > 0)
                {
                    _logger.LogInformation("Error notification {ErrorNotificationId} resolved successfully", id);
                    return Ok(ApiResponse<bool>.SuccessResponse(true, "Error resolved successfully"));
                }

                return BadRequest(ApiResponse<bool>.ErrorResponse("Resolve failed"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resolving error notification {ErrorNotificationId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(ex.Message));
            }
        }
    }
}
