using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoftwareUpdateManagement.API.DTOs.Common;
using SoftwareUpdateManagement.API.DTOs.Search;
using SoftwareUpdateManagement.API.Repositories.Interfaces;

namespace SoftwareUpdateManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SearchController : ControllerBase
    {
        private readonly ISearchRepository _searchRepository;
        private readonly ILogger<SearchController> _logger;

        public SearchController(
            ISearchRepository searchRepository,
            ILogger<SearchController> logger)
        {
            _searchRepository = searchRepository;
            _logger = logger;
        }

        /// <summary>
        /// Perform advanced search across all entity types
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<ApiResponse<AdvancedSearchResultDto>>> Search(
            [FromBody] AdvancedSearchRequestDto request)
        {
            try
            {
                var results = await _searchRepository.SearchAsync(request);
                return Ok(new ApiResponse<AdvancedSearchResultDto>
                {
                    Success = true,
                    Data = results,
                    Message = $"Search completed. Found {results.Summary.TotalResults} results."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error performing advanced search");
                return StatusCode(500, new ApiResponse<AdvancedSearchResultDto>
                {
                    Success = false,
                    Message = "Error performing search",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        /// <summary>
        /// Search CRFs only
        /// </summary>
        [HttpPost("crfs")]
        public async Task<ActionResult<ApiResponse<List<CRFSearchResultDto>>>> SearchCRFs(
            [FromBody] AdvancedSearchRequestDto request)
        {
            try
            {
                var results = await _searchRepository.SearchCRFsAsync(request);
                return Ok(new ApiResponse<List<CRFSearchResultDto>>
                {
                    Success = true,
                    Data = results,
                    Message = $"Found {results.Count} CRFs"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching CRFs");
                return StatusCode(500, new ApiResponse<List<CRFSearchResultDto>>
                {
                    Success = false,
                    Message = "Error searching CRFs",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        /// <summary>
        /// Search clients only
        /// </summary>
        [HttpPost("clients")]
        public async Task<ActionResult<ApiResponse<List<ClientSearchResultDto>>>> SearchClients(
            [FromBody] AdvancedSearchRequestDto request)
        {
            try
            {
                var results = await _searchRepository.SearchClientsAsync(request);
                return Ok(new ApiResponse<List<ClientSearchResultDto>>
                {
                    Success = true,
                    Data = results,
                    Message = $"Found {results.Count} clients"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching clients");
                return StatusCode(500, new ApiResponse<List<ClientSearchResultDto>>
                {
                    Success = false,
                    Message = "Error searching clients",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        /// <summary>
        /// Search versions only
        /// </summary>
        [HttpPost("versions")]
        public async Task<ActionResult<ApiResponse<List<VersionSearchResultDto>>>> SearchVersions(
            [FromBody] AdvancedSearchRequestDto request)
        {
            try
            {
                var results = await _searchRepository.SearchVersionsAsync(request);
                return Ok(new ApiResponse<List<VersionSearchResultDto>>
                {
                    Success = true,
                    Data = results,
                    Message = $"Found {results.Count} versions"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching versions");
                return StatusCode(500, new ApiResponse<List<VersionSearchResultDto>>
                {
                    Success = false,
                    Message = "Error searching versions",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        /// <summary>
        /// Search errors only
        /// </summary>
        [HttpPost("errors")]
        public async Task<ActionResult<ApiResponse<List<ErrorSearchResultDto>>>> SearchErrors(
            [FromBody] AdvancedSearchRequestDto request)
        {
            try
            {
                var results = await _searchRepository.SearchErrorsAsync(request);
                return Ok(new ApiResponse<List<ErrorSearchResultDto>>
                {
                    Success = true,
                    Data = results,
                    Message = $"Found {results.Count} errors"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching errors");
                return StatusCode(500, new ApiResponse<List<ErrorSearchResultDto>>
                {
                    Success = false,
                    Message = "Error searching errors",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        /// <summary>
        /// Search deployments only
        /// </summary>
        [HttpPost("deployments")]
        public async Task<ActionResult<ApiResponse<List<DeploymentSearchResultDto>>>> SearchDeployments(
            [FromBody] AdvancedSearchRequestDto request)
        {
            try
            {
                var results = await _searchRepository.SearchDeploymentsAsync(request);
                return Ok(new ApiResponse<List<DeploymentSearchResultDto>>
                {
                    Success = true,
                    Data = results,
                    Message = $"Found {results.Count} deployments"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching deployments");
                return StatusCode(500, new ApiResponse<List<DeploymentSearchResultDto>>
                {
                    Success = false,
                    Message = "Error searching deployments",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        /// <summary>
        /// Quick search with keyword only (searches across all types)
        /// </summary>
        [HttpGet("quick")]
        public async Task<ActionResult<ApiResponse<AdvancedSearchResultDto>>> QuickSearch(
            [FromQuery] string keyword)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(keyword))
                {
                    return BadRequest(new ApiResponse<AdvancedSearchResultDto>
                    {
                        Success = false,
                        Message = "Keyword is required"
                    });
                }

                var request = new AdvancedSearchRequestDto
                {
                    Keyword = keyword,
                    PageSize = 10 // Limit quick search results
                };

                var results = await _searchRepository.SearchAsync(request);
                return Ok(new ApiResponse<AdvancedSearchResultDto>
                {
                    Success = true,
                    Data = results,
                    Message = $"Quick search completed. Found {results.Summary.TotalResults} results."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error performing quick search");
                return StatusCode(500, new ApiResponse<AdvancedSearchResultDto>
                {
                    Success = false,
                    Message = "Error performing quick search",
                    Errors = new List<string> { ex.Message }
                });
            }
        }
    }
}
