using FluentResults;

namespace ProjectionApp.Application.Profiles;

public interface IProfileService
{
    Task<Result<UserProfileDto>> GetAsync(CancellationToken cancellationToken = default);

    Task<Result<UserProfileDto>> SaveAsync(
        SaveUserProfileRequest request,
        CancellationToken cancellationToken = default);
}
