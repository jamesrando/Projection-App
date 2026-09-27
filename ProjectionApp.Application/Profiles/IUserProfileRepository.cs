using ProjectionApp.Domain.Entities;

namespace ProjectionApp.Application.Profiles;

public interface IUserProfileRepository
{
    Task<UserProfile?> GetAsync(CancellationToken cancellationToken = default);

    Task<UserProfile> SaveAsync(UserProfile profile, CancellationToken cancellationToken = default);
}
