using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace SoftwareUpdateManagement.API.Controllers
{
    [Authorize(Roles = "DevOps")]
    [ApiController]
    [Route("api/[controller]")]
    public class BulkOperationsController : ControllerBase
    {
        private readonly IBulkOperationRepository _bulkOperationRepository;
        private readonly ICRFRepository _crfRepository;
        private readonly IClientRepository _clientRepository;
        private readonly IAuditLogRepository _auditLogRepository;

        public BulkOperationsController(
            IBulkOperationRepository bulkOperationRepository,
            ICRFRepository crfRepository,
            IClientRepository clientRepository,
            IAuditLogRepository auditLogRepository)
        {
            _bulkOperationRepository = bulkOperationRepository;
            _crfRepository = crfRepository;
            _clientRepository = clientRepository;
            _auditLogRepository = auditLogRepository;
        }

        /// <summary>
        /// Get all bulk operations
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<BulkOperationPagedResponse>> GetAllBulkOperations(
            [FromQuery] int? initiatedBy = null,
            [FromQuery] string? status = null,
            [FromQuery] string? operationType = null,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 50)
        {
            var result = await _bulkOperationRepository.GetAllBulkOperations(
                initiatedBy, status, operationType, pageNumber, pageSize);
            return Ok(result);
        }

        /// <summary>
        /// Get bulk operation by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<BulkOperationDto>> GetBulkOperationById(int id)
        {
            var operation = await _bulkOperationRepository.GetBulkOperationById(id);
            if (operation == null)
                return NotFound();
            return Ok(operation);
        }

        /// <summary>
        /// Create bulk CRFs
        /// </summary>
        [HttpPost("crfs")]
        public async Task<ActionResult<BulkOperationDto>> BulkCreateCRFs([FromBody] BulkCreateCRFsRequest request)
        {
            var userId = GetCurrentUserId();
            
            // Create bulk operation record
            var bulkOperation = await _bulkOperationRepository.CreateBulkOperation(
                "BulkCRFCreate", userId, request.CRFs.Count, System.Text.Json.JsonSerializer.Serialize(request));

            // Process in background (in production, use background job)
            _ = Task.Run(async () => await ProcessBulkCRFCreation(bulkOperation.BulkOperationId, request.CRFs, userId));

            await _auditLogRepository.CreateAuditLog(new CreateAuditLogDto
            {
                UserId = userId,
                Action = "BulkCreate",
                EntityType = "CRF",
                Details = $"Started bulk CRF creation: {request.CRFs.Count} items"
            });

            return CreatedAtAction(nameof(GetBulkOperationById), new { id = bulkOperation.BulkOperationId }, bulkOperation);
        }

        /// <summary>
        /// Bulk update clients
        /// </summary>
        [HttpPost("clients/update")]
        public async Task<ActionResult<BulkOperationDto>> BulkUpdateClients([FromBody] BulkUpdateClientsRequest request)
        {
            var userId = GetCurrentUserId();
            
            var bulkOperation = await _bulkOperationRepository.CreateBulkOperation(
                "BulkClientUpdate", userId, request.ClientIds.Count, System.Text.Json.JsonSerializer.Serialize(request));

            _ = Task.Run(async () => await ProcessBulkClientUpdate(bulkOperation.BulkOperationId, request, userId));

            await _auditLogRepository.CreateAuditLog(new CreateAuditLogDto
            {
                UserId = userId,
                Action = "BulkUpdate",
                EntityType = "Client",
                Details = $"Started bulk client update: {request.ClientIds.Count} items"
            });

            return CreatedAtAction(nameof(GetBulkOperationById), new { id = bulkOperation.BulkOperationId }, bulkOperation);
        }

        /// <summary>
        /// Get bulk operation statistics
        /// </summary>
        [HttpGet("statistics")]
        public async Task<ActionResult<BulkOperationStatisticsDto>> GetStatistics(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            var stats = await _bulkOperationRepository.GetBulkOperationStatistics(startDate, endDate);
            return Ok(stats);
        }

        private async Task ProcessBulkCRFCreation(int bulkOperationId, List<CreateCRFRequestDto> crfs, int userId)
        {
            int processed = 0;
            int successful = 0;
            int failed = 0;
            var results = new List<object>();

            try
            {
                await _bulkOperationRepository.UpdateBulkOperationProgress(
                    bulkOperationId, processed, successful, failed, "InProgress");

                foreach (var crfRequest in crfs)
                {
                    try
                    {
                        var crf = await _crfRepository.CreateCRF(crfRequest);
                        successful++;
                        results.Add(new { CRFId = crf.CRFId, Status = "Success" });
                    }
                    catch (Exception ex)
                    {
                        failed++;
                        results.Add(new { CRF = crfRequest.CRFNumber, Error = ex.Message, Status = "Failed" });
                    }
                    finally
                    {
                        processed++;
                        if (processed % 10 == 0) // Update progress every 10 items
                        {
                            await _bulkOperationRepository.UpdateBulkOperationProgress(
                                bulkOperationId, processed, successful, failed, "InProgress");
                        }
                    }
                }

                var finalStatus = failed == 0 ? "Completed" : failed < processed ? "PartiallyCompleted" : "Failed";
                await _bulkOperationRepository.CompleteBulkOperation(
                    bulkOperationId, finalStatus, System.Text.Json.JsonSerializer.Serialize(results), null);
            }
            catch (Exception ex)
            {
                await _bulkOperationRepository.CompleteBulkOperation(
                    bulkOperationId, "Failed", System.Text.Json.JsonSerializer.Serialize(results), ex.Message);
            }
        }

        private async Task ProcessBulkClientUpdate(int bulkOperationId, BulkUpdateClientsRequest request, int userId)
        {
            int processed = 0;
            int successful = 0;
            int failed = 0;
            var results = new List<object>();

            try
            {
                await _bulkOperationRepository.UpdateBulkOperationProgress(
                    bulkOperationId, processed, successful, failed, "InProgress");

                foreach (var clientId in request.ClientIds)
                {
                    try
                    {
                        if (!string.IsNullOrEmpty(request.NewVersion))
                        {
                            await _clientRepository.UpdateClientVersion(clientId, request.NewVersion, userId);
                        }
                        if (!string.IsNullOrEmpty(request.NewStatus))
                        {
                            // Update client status (would need to implement in repository)
                        }
                        successful++;
                        results.Add(new { ClientId = clientId, Status = "Success" });
                    }
                    catch (Exception ex)
                    {
                        failed++;
                        results.Add(new { ClientId = clientId, Error = ex.Message, Status = "Failed" });
                    }
                    finally
                    {
                        processed++;
                        if (processed % 10 == 0)
                        {
                            await _bulkOperationRepository.UpdateBulkOperationProgress(
                                bulkOperationId, processed, successful, failed, "InProgress");
                        }
                    }
                }

                var finalStatus = failed == 0 ? "Completed" : failed < processed ? "PartiallyCompleted" : "Failed";
                await _bulkOperationRepository.CompleteBulkOperation(
                    bulkOperationId, finalStatus, System.Text.Json.JsonSerializer.Serialize(results), null);
            }
            catch (Exception ex)
            {
                await _bulkOperationRepository.CompleteBulkOperation(
                    bulkOperationId, "Failed", System.Text.Json.JsonSerializer.Serialize(results), ex.Message);
            }
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            return int.Parse(userIdClaim ?? "0");
        }
    }

    public class BulkCreateCRFsRequest
    {
        public List<CreateCRFRequestDto> CRFs { get; set; } = new();
    }

    public class BulkUpdateClientsRequest
    {
        public List<int> ClientIds { get; set; } = new();
        public string? NewVersion { get; set; }
        public string? NewStatus { get; set; }
    }
}
