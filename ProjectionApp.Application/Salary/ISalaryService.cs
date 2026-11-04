using FluentResults;

namespace ProjectionApp.Application.Salary;

public interface ISalaryService
{
    Task<Result<TakeHomeResultDto>> CalculateTakeHomeAsync(
        CalculateTakeHomeRequest? request = null,
        CancellationToken cancellationToken = default);
}
