using FluentResults.Extensions.AspNetCore;
using Microsoft.AspNetCore.Mvc;
using ProjectionApp.Application.Salary;

namespace ProjectionApp.Api.Controllers;

[ApiController]
[Route("api/salary")]
public sealed class SalaryController(ISalaryService salaryService) : ControllerBase
{
    [HttpPost("take-home")]
    public Task<ActionResult> CalculateTakeHome(
        [FromBody] CalculateTakeHomeRequest? request,
        CancellationToken cancellationToken) =>
        salaryService.CalculateTakeHomeAsync(request, cancellationToken).ToActionResult();
}
