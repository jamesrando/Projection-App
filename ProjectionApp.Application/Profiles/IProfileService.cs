namespace ProjectionApp.Application.Profiles;

public interface IProfileService
{
    Task<UserProfileDto?> GetAsync(CancellationToken cancellationToken = default);

    Task<UserProfileDto> SaveAsync(
        SaveUserProfileRequest request,
        CancellationToken cancellationToken = default);
}
