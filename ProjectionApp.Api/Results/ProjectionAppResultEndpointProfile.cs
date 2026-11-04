using FluentResults.Extensions.AspNetCore;
using Microsoft.AspNetCore.Mvc;
using ProjectionApp.Application.Common;

namespace ProjectionApp.Api.Results;

public sealed class ProjectionAppResultEndpointProfile : DefaultAspNetCoreResultEndpointProfile
{
    public override ActionResult TransformFailedResultToActionResult(
        FailedResultToActionResultTransformationContext context)
    {
        if (context.Result.Errors.Any(e => e is NotFoundError))
        {
            return new NotFoundResult();
        }

        var message = context.Result.Errors.FirstOrDefault()?.Message ?? "Request failed.";
        return new BadRequestObjectResult(new { error = message });
    }
}
