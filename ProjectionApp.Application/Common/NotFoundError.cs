using FluentResults;

namespace ProjectionApp.Application.Common;

public sealed class NotFoundError : Error
{
    public NotFoundError(string message) : base(message)
    {
    }
}
