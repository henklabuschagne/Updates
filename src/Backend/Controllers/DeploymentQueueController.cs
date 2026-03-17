using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoftwareUpdateManagement.API.DTOs.Common;
using SoftwareUpdateManagement.API.DTOs.Deployment;
using SoftwareUpdateManagement.API.Repositories.Interfaces;
using System.Security.Claims;

namespace SoftwareUpdateManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "DevOps")]
    public class DeploymentQueueController : ControllerBase
    {
        private readonly IDeploymentQueueRepository _deploymentQueueRepository;
        private readonly ILogger<DeploymentQueueController> _logger;

        public DeploymentQueueController(IDeploymentQueueRepository deploymentQueueRepository, 
            ILogger<DeploymentQueueController> logger)
        {
            _deploymentQueueRepository = deploymentQueueRepository;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<DeploymentQueueDto>>>> GetAllQueueItems([FromQuery] string? status = null)
        {
            try
            {
                var items = await _deploymentQueueRepository.GetAllAsync(status);
                var itemDtos = items.Select(i => new DeploymentQueueDto
                {
                    DeploymentQueueId = i.DeploymentQueueId,
                    CRFId = i.CRFId,
                    ClientId = i.ClientId,
                    QueuedBy = i.QueuedBy,
                    QueuedDate = i.QueuedDate,
                    ScheduledStartTime = i.ScheduledStartTime,
                    ActualStartTime = i.ActualStartTime,
                    CompletedTime = i.CompletedTime,
                    Status = i.Status,
                    Priority = i.Priority,
                    DeploymentType = i.DeploymentType,
                    Notes = i.Notes ?? "",
                    CRFNumber = i.CRFNumber ?? "",
                    CRFTitle = i.CRFTitle ?? "",
                    ClientName = i.ClientName ?? "",
                    QueuedByName = i.QueuedByName ?? "",
                    VersionNumber = i.VersionNumber ?? ""
                });

                return Ok(ApiResponse<IEnumerable<DeploymentQueueDto>>.SuccessResponse(itemDtos));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting deployment queue items");
                return StatusCode(500, ApiResponse<IEnumerable<DeploymentQueueDto>>.ErrorResponse("An error occurred"));
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<DeploymentQueueDto>>> GetQueueItemById(int id)
        {
            try
            {
                var item = await _deploymentQueueRepository.GetByIdAsync(id);
                
                if (item == null)
                {
                    return NotFound(ApiResponse<DeploymentQueueDto>.ErrorResponse("Deployment queue item not found"));
                }

                var itemDto = new DeploymentQueueDto
                {
                    DeploymentQueueId = item.DeploymentQueueId,
                    CRFId = item.CRFId,
                    ClientId = item.ClientId,
                    QueuedBy = item.QueuedBy,
                    QueuedDate = item.QueuedDate,
                    ScheduledStartTime = item.ScheduledStartTime,
                    ActualStartTime = item.ActualStartTime,
                    CompletedTime = item.CompletedTime,
                    Status = item.Status,
                    Priority = item.Priority,
                    DeploymentType = item.DeploymentType,
                    Notes = item.Notes ?? "",
                    CRFNumber = item.CRFNumber ?? "",
                    CRFTitle = item.CRFTitle ?? "",
                    ClientName = item.ClientName ?? "",
                    QueuedByName = item.QueuedByName ?? "",
                    VersionNumber = item.VersionNumber ?? ""
                };

                return Ok(ApiResponse<DeploymentQueueDto>.SuccessResponse(itemDto));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting deployment queue item {DeploymentQueueId}", id);
                return StatusCode(500, ApiResponse<DeploymentQueueDto>.ErrorResponse("An error occurred"));
            }
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<int>>> QueueDeployment([FromBody] QueueDeploymentRequestDto request)
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

                var queueId = await _deploymentQueueRepository.AddToQueueAsync(
                    request.CRFId,
                    request.ClientId,
                    userId,
                    request.ScheduledStartTime,
                    request.Priority,
                    request.DeploymentType,
                    request.Notes
                );

                _logger.LogInformation("Deployment queued successfully with ID {QueueId}", queueId);
                return Ok(ApiResponse<int>.SuccessResponse(queueId, "Deployment queued successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error queuing deployment");
                return StatusCode(500, ApiResponse<int>.ErrorResponse(ex.Message));
            }
        }

        [HttpPut("{id}/status")]
        public async Task<ActionResult<ApiResponse<bool>>> UpdateStatus(int id, [FromBody] string status)
        {
            try
            {
                var item = await _deploymentQueueRepository.GetByIdAsync(id);
                if (item == null)
                {
                    return NotFound(ApiResponse<bool>.ErrorResponse("Deployment queue item not found"));
                }

                var result = await _deploymentQueueRepository.UpdateStatusAsync(id, status, "");

                if (result > 0)
                {
                    _logger.LogInformation("Deployment queue item {DeploymentQueueId} status updated to {Status}", id, status);
                    return Ok(ApiResponse<bool>.SuccessResponse(true, "Status updated successfully"));
                }

                return BadRequest(ApiResponse<bool>.ErrorResponse("Status update failed"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating deployment queue status {DeploymentQueueId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(ex.Message));
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> CancelDeployment(int id, [FromBody] string notes)
        {
            try
            {
                var item = await _deploymentQueueRepository.GetByIdAsync(id);
                if (item == null)
                {
                    return NotFound(ApiResponse<bool>.ErrorResponse("Deployment queue item not found"));
                }

                var result = await _deploymentQueueRepository.CancelAsync(id, notes);

                if (result > 0)
                {
                    _logger.LogInformation("Deployment queue item {DeploymentQueueId} cancelled successfully", id);
                    return Ok(ApiResponse<bool>.SuccessResponse(true, "Deployment cancelled successfully"));
                }

                return BadRequest(ApiResponse<bool>.ErrorResponse("Cancel failed"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling deployment {DeploymentQueueId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(ex.Message));
            }
        }

        [HttpGet("next")]
        public async Task<ActionResult<ApiResponse<DeploymentQueueDto>>> GetNextQueued()
        {
            try
            {
                var item = await _deploymentQueueRepository.GetNextQueuedAsync();
                
                if (item == null)
                {
                    return Ok(ApiResponse<DeploymentQueueDto>.SuccessResponse(null, "No deployments in queue"));
                }

                var itemDto = new DeploymentQueueDto
                {
                    DeploymentQueueId = item.DeploymentQueueId,
                    CRFId = item.CRFId,
                    ClientId = item.ClientId,
                    QueuedBy = item.QueuedBy,
                    QueuedDate = item.QueuedDate,
                    ScheduledStartTime = item.ScheduledStartTime,
                    Priority = item.Priority,
                    DeploymentType = item.DeploymentType,
                    Notes = item.Notes ?? "",
                    CRFNumber = item.CRFNumber ?? "",
                    CRFTitle = item.CRFTitle ?? "",
                    ClientName = item.ClientName ?? "",
                    VersionNumber = item.VersionNumber ?? ""
                };

                return Ok(ApiResponse<DeploymentQueueDto>.SuccessResponse(itemDto));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting next queued deployment");
                return StatusCode(500, ApiResponse<DeploymentQueueDto>.ErrorResponse("An error occurred"));
            }
        }
    }
}
