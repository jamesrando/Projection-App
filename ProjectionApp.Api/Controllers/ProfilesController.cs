using FluentResults.Extensions.AspNetCore;
using Microsoft.AspNetCore.Mvc;
using ProjectionApp.Application.Profiles;

namespace ProjectionApp.Api.Controllers;

[ApiController]
[Route("api/profile")]
public sealed class ProfilesController(IProfileService profileService) : ControllerBase
{
    [HttpGet]
    public Task<ActionResult> Get(CancellationToken cancellationToken) =>
        profileService.GetAsync(cancellationToken).ToActionResult();

    [HttpPut]
    public Task<ActionResult> Save(
        [FromBody] SaveUserProfileRequest request,
        CancellationToken cancellationToken) =>
        profileService.SaveAsync(request, cancellationToken).ToActionResult();
}
