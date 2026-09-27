using ProjectionApp.Application.Profiles;
using ProjectionApp.Domain.Entities;

namespace ProjectionApp.Infrastructure.Persistence;

public sealed class InMemoryUserProfileRepository : IUserProfileRepository
{
    private UserProfile? _profile;

    public Task<UserProfile?> GetAsync(CancellationToken cancellationToken = default) =>
        Task.FromResult(_profile);

    public Task<UserProfile> SaveAsync(UserProfile profile, CancellationToken cancellationToken = default)
    {
        _profile = profile;
        return Task.FromResult(_profile);
    }
}
