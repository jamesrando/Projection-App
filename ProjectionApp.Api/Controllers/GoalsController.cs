using FluentResults.Extensions.AspNetCore;
using Microsoft.AspNetCore.Mvc;
using ProjectionApp.Application.Goals;

namespace ProjectionApp.Api.Controllers;

[ApiController]
[Route("api/goals")]
public sealed class GoalsController(IGoalService goalService) : ControllerBase
{
    [HttpPost("analyze")]
    public Task<ActionResult> AnalyzeSavingsGoal(
        [FromBody] AnalyzeSavingsGoalRequest? request,
        CancellationToken cancellationToken) =>
        goalService.AnalyzeSavingsGoalAsync(
            request?.TargetAmount,
            request?.Overrides,
            cancellationToken).ToActionResult();
}
