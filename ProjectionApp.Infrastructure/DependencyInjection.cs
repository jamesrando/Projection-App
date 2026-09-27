using Microsoft.Extensions.DependencyInjection;
using ProjectionApp.Application.Profiles;
using ProjectionApp.Application.Projections;
using ProjectionApp.Infrastructure.Persistence;

namespace ProjectionApp.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        string? dataDirectory = null)
    {
        services.AddSingleton<IProjectionRepository, InMemoryProjectionRepository>();
        services.AddSingleton<IUserProfileRepository>(sp =>
        {
            var directory = dataDirectory ?? Path.Combine(AppContext.BaseDirectory, "data");
            Directory.CreateDirectory(directory);
            var filePath = Path.Combine(directory, "user-profile.json");
            return new JsonFileUserProfileRepository(filePath);
        });
        return services;
    }
}
