using System.Text.Json;
using ProjectionApp.Application.Profiles;
using ProjectionApp.Domain.Entities;

namespace ProjectionApp.Infrastructure.Persistence;

public sealed class JsonFileUserProfileRepository(string filePath) : IUserProfileRepository
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        WriteIndented = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    private readonly SemaphoreSlim _gate = new(1, 1);

    public async Task<UserProfile?> GetAsync(CancellationToken cancellationToken = default)
    {
        await _gate.WaitAsync(cancellationToken);
        try
        {
            if (!File.Exists(filePath))
            {
                return null;
            }

            await using var stream = File.OpenRead(filePath);
            return await JsonSerializer.DeserializeAsync<UserProfile>(stream, JsonOptions, cancellationToken);
        }
        finally
        {
            _gate.Release();
        }
    }

    public async Task<UserProfile> SaveAsync(UserProfile profile, CancellationToken cancellationToken = default)
    {
        await _gate.WaitAsync(cancellationToken);
        try
        {
            var directory = Path.GetDirectoryName(filePath);
            if (!string.IsNullOrEmpty(directory))
            {
                Directory.CreateDirectory(directory);
            }

            await using var stream = File.Create(filePath);
            await JsonSerializer.SerializeAsync(stream, profile, JsonOptions, cancellationToken);
            return profile;
        }
        finally
        {
            _gate.Release();
        }
    }
}
