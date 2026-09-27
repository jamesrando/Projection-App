using ProjectionApp.Application;
using ProjectionApp.Application.Projections;
using ProjectionApp.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddControllers();
builder.Services.AddApplication();
builder.Services.AddInfrastructure();
builder.Services.AddCors(options =>
{
    options.AddPolicy("Development", policy =>
        policy.WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseCors("Development");
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.MapControllers();

app.MapGet("/health", () => Results.Ok(new { status = "healthy" }))
    .WithName("HealthCheck");

app.MapGet("/api/projections", async (IProjectionService service, CancellationToken cancellationToken) =>
    Results.Ok(await service.GetSummariesAsync(cancellationToken)))
    .WithName("GetProjections");

app.MapGet("/api/projections/{id:guid}", async (Guid id, IProjectionService service, CancellationToken cancellationToken) =>
{
    var projection = await service.GetSummaryByIdAsync(id, cancellationToken);
    return projection is null ? Results.NotFound() : Results.Ok(projection);
})
.WithName("GetProjectionById");

app.Run();
