using FluentResults.Extensions.AspNetCore;
using ProjectionApp.Api.Results;
using ProjectionApp.Application;
using ProjectionApp.Infrastructure;

AspNetCoreResult.Setup(config =>
    config.DefaultProfile = new ProjectionAppResultEndpointProfile());

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddControllers();
builder.Services.AddApplication();
builder.Services.AddInfrastructure(Path.Combine(builder.Environment.ContentRootPath, "data"));
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

app.Run();
