using Microsoft.AspNetCore.Mvc;
using ProjectionApp.Application.Salary;

namespace ProjectionApp.Api.Controllers;

[ApiController]
[Route("api/salary")]
public sealed class SalaryController(ISalaryService salaryService) : ControllerBase
{
    [HttpPost("take-home")]
    public async Task<ActionResult<TakeHomeResultDto>> CalculateTakeHome(
        [FromBody] CalculateTakeHomeRequest? request,
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await salaryService.CalculateTakeHomeAsync(request, cancellationToken);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
