using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoftwareUpdateManagement.API.DTOs.Common;
using SoftwareUpdateManagement.API.DTOs.CRF;
using SoftwareUpdateManagement.API.Repositories.Interfaces;
using System.Security.Claims;

namespace SoftwareUpdateManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CRFController : ControllerBase
    {
        private readonly ICRFRepository _crfRepository;
        private readonly ILogger<CRFController> _logger;

        public CRFController(ICRFRepository crfRepository, ILogger<CRFController> logger)
        {
            _crfRepository = crfRepository;
            _logger = logger;
        }

        [HttpGet]
        [Authorize(Roles = "DevOps,Delivery")]
        public async Task<ActionResult<ApiResponse<IEnumerable<CRFResponseDto>>>> GetAllCRFs([FromQuery] string? status = null)
        {
            try
            {
                var crfs = await _crfRepository.GetAllAsync(status);
                var crfDtos = crfs.Select(c => new CRFResponseDto
                {
                    CRFId = c.CRFId,
                    CRFNumber = c.CRFNumber,
                    Title = c.Title,
                    Description = c.Description,
                    VersionId = c.VersionId,
                    VersionNumber = c.VersionNumber ?? "",
                    VersionName = c.VersionName ?? "",
                    RequestedBy = c.RequestedBy,
                    RequestedByName = c.RequestedByName ?? "",
                    Status = c.Status,
                    Priority = c.Priority,
                    ScheduledDeploymentDate = c.ScheduledDeploymentDate,
                    ActualDeploymentDate = c.ActualDeploymentDate,
                    CreatedDate = c.CreatedDate,
                    UpdatedDate = c.UpdatedDate,
                    CompletedDate = c.CompletedDate,
                    ClientCount = c.ClientCount,
                    SuccessfulDeployments = c.SuccessfulDeployments
                });

                return Ok(ApiResponse<IEnumerable<CRFResponseDto>>.SuccessResponse(crfDtos));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all CRFs");
                return StatusCode(500, ApiResponse<IEnumerable<CRFResponseDto>>.ErrorResponse("An error occurred"));
            }
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "DevOps,Delivery")]
        public async Task<ActionResult<ApiResponse<CRFResponseDto>>> GetCRFById(int id)
        {
            try
            {
                var crf = await _crfRepository.GetByIdAsync(id);
                
                if (crf == null)
                {
                    return NotFound(ApiResponse<CRFResponseDto>.ErrorResponse("CRF not found"));
                }

                var crfDto = new CRFResponseDto
                {
                    CRFId = crf.CRFId,
                    CRFNumber = crf.CRFNumber,
                    Title = crf.Title,
                    Description = crf.Description,
                    VersionId = crf.VersionId,
                    VersionNumber = crf.VersionNumber ?? "",
                    VersionName = crf.VersionName ?? "",
                    RequestedBy = crf.RequestedBy,
                    RequestedByName = crf.RequestedByName ?? "",
                    Status = crf.Status,
                    Priority = crf.Priority,
                    ScheduledDeploymentDate = crf.ScheduledDeploymentDate,
                    ActualDeploymentDate = crf.ActualDeploymentDate,
                    CreatedDate = crf.CreatedDate,
                    UpdatedDate = crf.UpdatedDate,
                    CompletedDate = crf.CompletedDate
                };

                return Ok(ApiResponse<CRFResponseDto>.SuccessResponse(crfDto));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting CRF {CRFId}", id);
                return StatusCode(500, ApiResponse<CRFResponseDto>.ErrorResponse("An error occurred"));
            }
        }

        [HttpPost]
        [Authorize(Roles = "DevOps")]
        public async Task<ActionResult<ApiResponse<int>>> CreateCRF([FromBody] CreateCRFRequestDto request)
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

                var crfId = await _crfRepository.CreateAsync(
                    request.CRFNumber,
                    request.Title,
                    request.Description,
                    request.VersionId,
                    userId,
                    request.Priority,
                    request.ScheduledDeploymentDate
                );

                // Add clients if provided
                if (request.ClientIds.Any())
                {
                    var clientIds = string.Join(",", request.ClientIds);
                    await _crfRepository.AddClientsAsync(crfId, clientIds);
                }

                _logger.LogInformation("CRF {CRFNumber} created successfully with ID {CRFId}", request.CRFNumber, crfId);
                return Ok(ApiResponse<int>.SuccessResponse(crfId, "CRF created successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating CRF {CRFNumber}", request.CRFNumber);
                return StatusCode(500, ApiResponse<int>.ErrorResponse(ex.Message));
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "DevOps")]
        public async Task<ActionResult<ApiResponse<bool>>> UpdateCRF(int id, [FromBody] UpdateCRFRequestDto request)
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

                var crf = await _crfRepository.GetByIdAsync(id);
                if (crf == null)
                {
                    return NotFound(ApiResponse<bool>.ErrorResponse("CRF not found"));
                }

                var result = await _crfRepository.UpdateAsync(
                    id,
                    request.Title,
                    request.Description,
                    request.Priority,
                    request.ScheduledDeploymentDate
                );

                if (result > 0)
                {
                    _logger.LogInformation("CRF {CRFId} updated successfully", id);
                    return Ok(ApiResponse<bool>.SuccessResponse(true, "CRF updated successfully"));
                }

                return BadRequest(ApiResponse<bool>.ErrorResponse("Update failed"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating CRF {CRFId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(ex.Message));
            }
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "DevOps")]
        public async Task<ActionResult<ApiResponse<bool>>> UpdateCRFStatus(int id, [FromBody] string status)
        {
            try
            {
                var crf = await _crfRepository.GetByIdAsync(id);
                if (crf == null)
                {
                    return NotFound(ApiResponse<bool>.ErrorResponse("CRF not found"));
                }

                var result = await _crfRepository.UpdateStatusAsync(id, status);

                if (result > 0)
                {
                    _logger.LogInformation("CRF {CRFId} status updated to {Status}", id, status);
                    return Ok(ApiResponse<bool>.SuccessResponse(true, "CRF status updated successfully"));
                }

                return BadRequest(ApiResponse<bool>.ErrorResponse("Status update failed"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating CRF {CRFId} status", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(ex.Message));
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "DevOps")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteCRF(int id)
        {
            try
            {
                var crf = await _crfRepository.GetByIdAsync(id);
                if (crf == null)
                {
                    return NotFound(ApiResponse<bool>.ErrorResponse("CRF not found"));
                }

                var result = await _crfRepository.DeleteAsync(id);

                if (result > 0)
                {
                    _logger.LogInformation("CRF {CRFId} deleted successfully", id);
                    return Ok(ApiResponse<bool>.SuccessResponse(true, "CRF deleted successfully"));
                }

                return BadRequest(ApiResponse<bool>.ErrorResponse("Delete failed"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting CRF {CRFId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(ex.Message));
            }
        }

        [HttpGet("{id}/clients")]
        [Authorize(Roles = "DevOps,Delivery")]
        public async Task<ActionResult<ApiResponse<IEnumerable<CRFClientDto>>>> GetCRFClients(int id)
        {
            try
            {
                var clients = await _crfRepository.GetCRFClientsAsync(id);
                var clientDtos = clients.Select(c => new CRFClientDto
                {
                    CRFClientId = c.CRFClientId,
                    CRFId = c.CRFId,
                    ClientId = c.ClientId,
                    ClientName = c.ClientName,
                    ContactEmail = c.ContactEmail,
                    CurrentVersion = c.CurrentVersion ?? "",
                    CurrentVersionName = c.CurrentVersionName ?? "",
                    DeploymentStatus = c.DeploymentStatus,
                    DeploymentDate = c.DeploymentDate,
                    DeploymentNotes = c.DeploymentNotes ?? ""
                });

                return Ok(ApiResponse<IEnumerable<CRFClientDto>>.SuccessResponse(clientDtos));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting CRF {CRFId} clients", id);
                return StatusCode(500, ApiResponse<IEnumerable<CRFClientDto>>.ErrorResponse("An error occurred"));
            }
        }

        [HttpGet("{id}/approvals")]
        [Authorize(Roles = "DevOps,Delivery")]
        public async Task<ActionResult<ApiResponse<IEnumerable<CRFApprovalDto>>>> GetCRFApprovals(int id)
        {
            try
            {
                var approvals = await _crfRepository.GetCRFApprovalsAsync(id);
                var approvalDtos = approvals.Select(a => new CRFApprovalDto
                {
                    CRFApprovalId = a.CRFApprovalId,
                    CRFId = a.CRFId,
                    WorkflowStepId = a.WorkflowStepId,
                    StepName = a.StepName,
                    StepOrder = a.StepOrder,
                    ApproverUserId = a.ApproverUserId,
                    ApproverName = a.ApproverName ?? "",
                    Status = a.Status,
                    ApprovalDate = a.ApprovalDate,
                    Comments = a.Comments ?? "",
                    CreatedDate = a.CreatedDate
                });

                return Ok(ApiResponse<IEnumerable<CRFApprovalDto>>.SuccessResponse(approvalDtos));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting CRF {CRFId} approvals", id);
                return StatusCode(500, ApiResponse<IEnumerable<CRFApprovalDto>>.ErrorResponse("An error occurred"));
            }
        }

        [HttpPut("approvals/{approvalId}")]
        [Authorize(Roles = "DevOps,Delivery")]
        public async Task<ActionResult<ApiResponse<bool>>> UpdateApproval(int approvalId, [FromBody] UpdateApprovalRequestDto request)
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

                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");

                var result = await _crfRepository.UpdateApprovalAsync(approvalId, userId, request.Status, request.Comments);

                if (result > 0)
                {
                    _logger.LogInformation("Approval {ApprovalId} updated successfully", approvalId);
                    return Ok(ApiResponse<bool>.SuccessResponse(true, "Approval updated successfully"));
                }

                return BadRequest(ApiResponse<bool>.ErrorResponse("Approval update failed"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating approval {ApprovalId}", approvalId);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(ex.Message));
            }
        }

        [HttpGet("{id}/logs")]
        [Authorize(Roles = "DevOps,Delivery")]
        public async Task<ActionResult<ApiResponse<IEnumerable<DeploymentLogDto>>>> GetDeploymentLogs(int id, [FromQuery] int? clientId = null)
        {
            try
            {
                var logs = await _crfRepository.GetDeploymentLogsAsync(id, clientId);
                var logDtos = logs.Select(l => new DeploymentLogDto
                {
                    DeploymentLogId = l.DeploymentLogId,
                    CRFId = l.CRFId,
                    ClientId = l.ClientId,
                    ClientName = l.ClientName ?? "",
                    LogType = l.LogType,
                    LogMessage = l.LogMessage,
                    Severity = l.Severity,
                    CreatedDate = l.CreatedDate,
                    CreatedBy = l.CreatedBy,
                    CreatedByName = l.CreatedByName ?? ""
                });

                return Ok(ApiResponse<IEnumerable<DeploymentLogDto>>.SuccessResponse(logDtos));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting deployment logs for CRF {CRFId}", id);
                return StatusCode(500, ApiResponse<IEnumerable<DeploymentLogDto>>.ErrorResponse("An error occurred"));
            }
        }
    }
}
