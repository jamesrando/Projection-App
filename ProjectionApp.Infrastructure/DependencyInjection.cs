using Microsoft.Extensions.DependencyInjection;
using ProjectionApp.Application.Projections;
using ProjectionApp.Infrastructure.Persistence;

namespace ProjectionApp.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddSingleton<IProjectionRepository, InMemoryProjectionRepository>();
        return services;
    }
}
