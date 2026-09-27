using Microsoft.AspNetCore.Mvc;
using ProjectionApp.Application.Profiles;

namespace ProjectionApp.Api.Controllers;

[ApiController]
[Route("api/profile")]
public sealed class ProfilesController(IProfileService profileService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<UserProfileDto>> Get(CancellationToken cancellationToken)
    {
        var profile = await profileService.GetAsync(cancellationToken);
        return profile is null ? NotFound() : Ok(profile);
    }

    [HttpPut]
    public async Task<ActionResult<UserProfileDto>> Save(
        [FromBody] SaveUserProfileRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var profile = await profileService.SaveAsync(request, cancellationToken);
            return Ok(profile);
        }
        catch (ArgumentOutOfRangeException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
