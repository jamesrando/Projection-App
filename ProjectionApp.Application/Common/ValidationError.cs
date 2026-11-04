using FluentResults;

namespace ProjectionApp.Application.Common;

public sealed class ValidationError : Error
{
    public ValidationError(string message) : base(message)
    {
    }
}
