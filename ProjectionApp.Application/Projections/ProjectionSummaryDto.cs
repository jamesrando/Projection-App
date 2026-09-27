namespace ProjectionApp.Application.Projections;

public sealed record ProjectionSummaryDto(
    Guid Id,
    string Name,
    DateOnly StartDate,
    DateOnly EndDate,
    decimal TotalIncome,
    decimal TotalExpenses,
    decimal Net);
