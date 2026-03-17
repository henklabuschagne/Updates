using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoftwareUpdateManagement.API.DTOs.Common;
using SoftwareUpdateManagement.API.DTOs.Workflow;
using SoftwareUpdateManagement.API.Repositories.Interfaces;

namespace SoftwareUpdateManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class WorkflowController : ControllerBase
    {
        private readonly IWorkflowRepository _workflowRepository;
        private readonly ILogger<WorkflowController> _logger;

        public WorkflowController(IWorkflowRepository workflowRepository, ILogger<WorkflowController> logger)
        {
            _workflowRepository = workflowRepository;
            _logger = logger;
        }

        [HttpGet("steps")]
        public async Task<ActionResult<ApiResponse<IEnumerable<WorkflowStepDto>>>> GetAllSteps()
        {
            try
            {
                var steps = await _workflowRepository.GetAllStepsAsync();
                var stepDtos = steps.Select(s => new WorkflowStepDto
                {
                    WorkflowStepId = s.WorkflowStepId,
                    StepName = s.StepName,
                    StepOrder = s.StepOrder,
                    IsRequired = s.IsRequired,
                    IsActive = s.IsActive,
                    CreatedDate = s.CreatedDate
                });

                return Ok(ApiResponse<IEnumerable<WorkflowStepDto>>.SuccessResponse(stepDtos));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting workflow steps");
                return StatusCode(500, ApiResponse<IEnumerable<WorkflowStepDto>>.ErrorResponse("An error occurred"));
            }
        }

        [HttpPost("steps")]
        [Authorize(Roles = "DevOps")]
        public async Task<ActionResult<ApiResponse<int>>> CreateStep([FromBody] CreateWorkflowStepRequestDto request)
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

                var stepId = await _workflowRepository.CreateStepAsync(
                    request.StepName,
                    request.StepOrder,
                    request.IsRequired
                );

                _logger.LogInformation("Workflow step {StepName} created successfully with ID {StepId}", request.StepName, stepId);
                return Ok(ApiResponse<int>.SuccessResponse(stepId, "Workflow step created successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating workflow step {StepName}", request.StepName);
                return StatusCode(500, ApiResponse<int>.ErrorResponse(ex.Message));
            }
        }

        [HttpPut("steps/{id}")]
        [Authorize(Roles = "DevOps")]
        public async Task<ActionResult<ApiResponse<bool>>> UpdateStep(int id, [FromBody] UpdateWorkflowStepRequestDto request)
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

                var result = await _workflowRepository.UpdateStepAsync(id, request.StepName, request.IsRequired);

                if (result > 0)
                {
                    _logger.LogInformation("Workflow step {StepId} updated successfully", id);
                    return Ok(ApiResponse<bool>.SuccessResponse(true, "Workflow step updated successfully"));
                }

                return BadRequest(ApiResponse<bool>.ErrorResponse("Update failed"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating workflow step {StepId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(ex.Message));
            }
        }

        [HttpDelete("steps/{id}")]
        [Authorize(Roles = "DevOps")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteStep(int id)
        {
            try
            {
                var result = await _workflowRepository.DeleteStepAsync(id);

                if (result > 0)
                {
                    _logger.LogInformation("Workflow step {StepId} deleted successfully", id);
                    return Ok(ApiResponse<bool>.SuccessResponse(true, "Workflow step deleted successfully"));
                }

                return BadRequest(ApiResponse<bool>.ErrorResponse("Delete failed"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting workflow step {StepId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(ex.Message));
            }
        }

        [HttpPut("steps/{id}/reorder")]
        [Authorize(Roles = "DevOps")]
        public async Task<ActionResult<ApiResponse<bool>>> ReorderStep(int id, [FromBody] int newOrder)
        {
            try
            {
                var result = await _workflowRepository.ReorderStepAsync(id, newOrder);

                if (result > 0)
                {
                    _logger.LogInformation("Workflow step {StepId} reordered successfully", id);
                    return Ok(ApiResponse<bool>.SuccessResponse(true, "Workflow step reordered successfully"));
                }

                return BadRequest(ApiResponse<bool>.ErrorResponse("Reorder failed"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reordering workflow step {StepId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(ex.Message));
            }
        }
    }
}
