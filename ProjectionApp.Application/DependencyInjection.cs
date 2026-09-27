using Microsoft.Extensions.DependencyInjection;
using ProjectionApp.Application.Projections;

namespace ProjectionApp.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IProjectionService, ProjectionService>();
        return services;
    }
}
