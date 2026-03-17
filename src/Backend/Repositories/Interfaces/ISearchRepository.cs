using SoftwareUpdateManagement.API.DTOs.Search;

namespace SoftwareUpdateManagement.API.Repositories.Interfaces
{
    public interface ISearchRepository
    {
        Task<AdvancedSearchResultDto> SearchAsync(AdvancedSearchRequestDto request);
        Task<List<CRFSearchResultDto>> SearchCRFsAsync(AdvancedSearchRequestDto request);
        Task<List<ClientSearchResultDto>> SearchClientsAsync(AdvancedSearchRequestDto request);
        Task<List<VersionSearchResultDto>> SearchVersionsAsync(AdvancedSearchRequestDto request);
        Task<List<ErrorSearchResultDto>> SearchErrorsAsync(AdvancedSearchRequestDto request);
        Task<List<DeploymentSearchResultDto>> SearchDeploymentsAsync(AdvancedSearchRequestDto request);
    }
}
