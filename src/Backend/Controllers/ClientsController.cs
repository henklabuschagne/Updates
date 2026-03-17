using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoftwareUpdateManagement.API.DTOs.Clients;
using SoftwareUpdateManagement.API.DTOs.Common;
using SoftwareUpdateManagement.API.Repositories.Interfaces;
using System.Security.Claims;

namespace SoftwareUpdateManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ClientsController : ControllerBase
    {
        private readonly IClientRepository _clientRepository;
        private readonly ILogger<ClientsController> _logger;

        public ClientsController(IClientRepository clientRepository, ILogger<ClientsController> logger)
        {
            _clientRepository = clientRepository;
            _logger = logger;
        }

        [HttpGet]
        [Authorize(Roles = "DevOps,Delivery")]
        public async Task<ActionResult<ApiResponse<IEnumerable<ClientResponseDto>>>> GetAllClients([FromQuery] bool includeInactive = false)
        {
            try
            {
                var clients = await _clientRepository.GetAllAsync(includeInactive);
                var clientDtos = clients.Select(c => new ClientResponseDto
                {
                    ClientId = c.ClientId,
                    ClientName = c.ClientName,
                    ContactEmail = c.ContactEmail,
                    ContactPerson = c.ContactPerson,
                    Phone = c.Phone,
                    Address = c.Address,
                    CurrentVersionId = c.CurrentVersionId,
                    CurrentVersion = c.CurrentVersion ?? "",
                    CurrentVersionName = c.CurrentVersionName ?? "",
                    Status = c.Status,
                    LastUpdateDate = c.LastUpdateDate,
                    CreatedBy = c.CreatedBy,
                    CreatedByName = c.CreatedByName ?? "",
                    CreatedDate = c.CreatedDate,
                    UpdatedDate = c.UpdatedDate,
                    IsActive = c.IsActive,
                    HasCustomizations = c.HasCustomizations  // NEW FIELD
                });

                return Ok(ApiResponse<IEnumerable<ClientResponseDto>>.SuccessResponse(clientDtos));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all clients");
                return StatusCode(500, ApiResponse<IEnumerable<ClientResponseDto>>.ErrorResponse("An error occurred"));
            }
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "DevOps,Delivery")]
        public async Task<ActionResult<ApiResponse<ClientResponseDto>>> GetClientById(int id)
        {
            try
            {
                var client = await _clientRepository.GetByIdAsync(id);
                
                if (client == null)
                {
                    return NotFound(ApiResponse<ClientResponseDto>.ErrorResponse("Client not found"));
                }

                var clientDto = new ClientResponseDto
                {
                    ClientId = client.ClientId,
                    ClientName = client.ClientName,
                    ContactEmail = client.ContactEmail,
                    ContactPerson = client.ContactPerson,
                    Phone = client.Phone,
                    Address = client.Address,
                    CurrentVersionId = client.CurrentVersionId,
                    CurrentVersion = client.CurrentVersion ?? "",
                    CurrentVersionName = client.CurrentVersionName ?? "",
                    Status = client.Status,
                    LastUpdateDate = client.LastUpdateDate,
                    CreatedBy = client.CreatedBy,
                    CreatedByName = client.CreatedByName ?? "",
                    CreatedDate = client.CreatedDate,
                    UpdatedDate = client.UpdatedDate,
                    IsActive = client.IsActive,
                    HasCustomizations = client.HasCustomizations  // NEW FIELD
                };

                return Ok(ApiResponse<ClientResponseDto>.SuccessResponse(clientDto));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting client {ClientId}", id);
                return StatusCode(500, ApiResponse<ClientResponseDto>.ErrorResponse("An error occurred"));
            }
        }

        [HttpPost]
        [Authorize(Roles = "DevOps")]
        public async Task<ActionResult<ApiResponse<int>>> CreateClient([FromBody] CreateClientRequestDto request)
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

                var clientId = await _clientRepository.CreateAsync(
                    request.ClientName,
                    request.ContactEmail,
                    request.ContactPerson,
                    request.Phone,
                    request.Address,
                    request.CurrentVersionId,
                    request.Status,
                    userId,
                    request.HasCustomizations  // NEW PARAMETER
                );

                _logger.LogInformation("Client {ClientName} created successfully with ID {ClientId}", request.ClientName, clientId);
                return Ok(ApiResponse<int>.SuccessResponse(clientId, "Client created successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating client {ClientName}", request.ClientName);
                return StatusCode(500, ApiResponse<int>.ErrorResponse(ex.Message));
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "DevOps")]
        public async Task<ActionResult<ApiResponse<bool>>> UpdateClient(int id, [FromBody] UpdateClientRequestDto request)
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

                var client = await _clientRepository.GetByIdAsync(id);
                if (client == null)
                {
                    return NotFound(ApiResponse<bool>.ErrorResponse("Client not found"));
                }

                var result = await _clientRepository.UpdateAsync(
                    id,
                    request.ClientName,
                    request.ContactEmail,
                    request.ContactPerson,
                    request.Phone,
                    request.Address,
                    request.Status,
                    request.IsActive,
                    request.HasCustomizations  // NEW PARAMETER
                );

                if (result > 0)
                {
                    _logger.LogInformation("Client {ClientId} updated successfully", id);
                    return Ok(ApiResponse<bool>.SuccessResponse(true, "Client updated successfully"));
                }

                return BadRequest(ApiResponse<bool>.ErrorResponse("Update failed"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating client {ClientId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(ex.Message));
            }
        }

        [HttpPut("{id}/version")]
        [Authorize(Roles = "DevOps")]
        public async Task<ActionResult<ApiResponse<bool>>> UpdateClientVersion(int id, [FromBody] UpdateClientVersionRequestDto request)
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

                var client = await _clientRepository.GetByIdAsync(id);
                if (client == null)
                {
                    return NotFound(ApiResponse<bool>.ErrorResponse("Client not found"));
                }

                // PREVENT AUTO-UPDATE FOR CLIENTS WITH CUSTOMIZATIONS
                if (client.HasCustomizations)
                {
                    return BadRequest(ApiResponse<bool>.ErrorResponse(
                        "Cannot perform auto-update: This client has customizations and requires manual deployment. " +
                        "Please use the Manual Deployment feature instead."
                    ));
                }

                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");

                var result = await _clientRepository.UpdateVersionAsync(id, request.VersionId, userId, request.Notes);

                if (result > 0)
                {
                    _logger.LogInformation("Client {ClientId} version updated successfully", id);
                    return Ok(ApiResponse<bool>.SuccessResponse(true, "Client version updated successfully"));
                }

                return BadRequest(ApiResponse<bool>.ErrorResponse("Version update failed"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating client {ClientId} version", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(ex.Message));
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "DevOps")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteClient(int id)
        {
            try
            {
                var client = await _clientRepository.GetByIdAsync(id);
                if (client == null)
                {
                    return NotFound(ApiResponse<bool>.ErrorResponse("Client not found"));
                }

                var result = await _clientRepository.DeleteAsync(id);

                if (result > 0)
                {
                    _logger.LogInformation("Client {ClientId} deleted successfully", id);
                    return Ok(ApiResponse<bool>.SuccessResponse(true, "Client deleted successfully"));
                }

                return BadRequest(ApiResponse<bool>.ErrorResponse("Delete failed"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting client {ClientId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(ex.Message));
            }
        }

        [HttpGet("{id}/history")]
        [Authorize(Roles = "DevOps,Delivery")]
        public async Task<ActionResult<ApiResponse<IEnumerable<ClientVersionHistoryDto>>>> GetClientVersionHistory(int id)
        {
            try
            {
                var history = await _clientRepository.GetVersionHistoryAsync(id);
                var historyDtos = history.Select(h => new ClientVersionHistoryDto
                {
                    ClientVersionId = h.ClientVersionId,
                    ClientId = h.ClientId,
                    VersionId = h.VersionId,
                    VersionNumber = h.VersionNumber,
                    VersionName = h.VersionName,
                    AssignedDate = h.AssignedDate,
                    UpdatedBy = h.UpdatedBy,
                    UpdatedByName = h.UpdatedByName,
                    Notes = h.Notes,
                    IsCurrentVersion = h.IsCurrentVersion
                });

                return Ok(ApiResponse<IEnumerable<ClientVersionHistoryDto>>.SuccessResponse(historyDtos));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting version history for client {ClientId}", id);
                return StatusCode(500, ApiResponse<IEnumerable<ClientVersionHistoryDto>>.ErrorResponse("An error occurred"));
            }
        }

        [HttpGet("by-version/{versionId}")]
        [Authorize(Roles = "DevOps,Delivery")]
        public async Task<ActionResult<ApiResponse<IEnumerable<ClientResponseDto>>>> GetClientsByVersion(int versionId)
        {
            try
            {
                var clients = await _clientRepository.GetByVersionAsync(versionId);
                var clientDtos = clients.Select(c => new ClientResponseDto
                {
                    ClientId = c.ClientId,
                    ClientName = c.ClientName,
                    ContactEmail = c.ContactEmail,
                    ContactPerson = c.ContactPerson,
                    Phone = c.Phone,
                    Address = c.Address,
                    Status = c.Status,
                    LastUpdateDate = c.LastUpdateDate,
                    CreatedBy = c.CreatedBy,
                    CreatedDate = c.CreatedDate,
                    IsActive = c.IsActive
                });

                return Ok(ApiResponse<IEnumerable<ClientResponseDto>>.SuccessResponse(clientDtos));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting clients by version {VersionId}", versionId);
                return StatusCode(500, ApiResponse<IEnumerable<ClientResponseDto>>.ErrorResponse("An error occurred"));
            }
        }
    }
}