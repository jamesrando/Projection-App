namespace ProjectionApp.Application.Salary;

public interface ISalaryService
{
    Task<TakeHomeResultDto> CalculateTakeHomeAsync(
        CalculateTakeHomeRequest? request = null,
        CancellationToken cancellationToken = default);
}
