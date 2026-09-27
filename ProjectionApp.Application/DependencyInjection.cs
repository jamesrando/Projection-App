using Microsoft.Extensions.DependencyInjection;
using ProjectionApp.Application.Goals;
using ProjectionApp.Application.Profiles;
using ProjectionApp.Application.Projections;

namespace ProjectionApp.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IProjectionService, ProjectionService>();
        services.AddScoped<IProfileService, ProfileService>();
        services.AddScoped<IGoalService, GoalService>();
        return services;
    }
}
