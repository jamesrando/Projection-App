using Microsoft.AspNetCore.Mvc;
using ProjectionApp.Application.Goals;

namespace ProjectionApp.Api.Controllers;

[ApiController]
[Route("api/goals")]
public sealed class GoalsController(IGoalService goalService) : ControllerBase
{
    [HttpPost("reach-100k")]
    public async Task<ActionResult<Reach100kGoalResultDto>> AnalyzeReach100k(
        [FromBody] AnalyzeReachGoalRequest? request,
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await goalService.AnalyzeReach100kAsync(
                request?.TargetAmount,
                request?.Overrides,
                cancellationToken);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
