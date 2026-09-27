# Projection App

Financial projection and forecasting application scaffold.

## Structure

```
ProjectionApp.Domain/          Core entities and business rules
ProjectionApp.Application/     Use cases, DTOs, service interfaces
ProjectionApp.Infrastructure/  Persistence and external integrations
ProjectionApp.Api/             ASP.NET Core minimal API
ProjectionApp.Client/          React + TypeScript frontend (Vite)
ProjectionApp.Tests/             Unit tests
```

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) 20+ (for the React client)

## Getting started

### Backend

```powershell
dotnet restore
dotnet build
dotnet test
dotnet run --project ProjectionApp.Api
```

The API runs at `http://localhost:5171`.

### Frontend

In a second terminal:

```powershell
cd ProjectionApp.Client
npm install
npm run dev
```

The React app runs at `http://localhost:5173` and proxies API requests to the backend.

API endpoints:

- `GET /health` — health check
- `GET /api/projections` — list projection summaries
- `GET /api/projections/{id}` — get a projection by id

OpenAPI is available in Development at `/openapi/v1.json`.

## Branching

- `main` — stable baseline
- `genesis` — initial project scaffolding

## License

Apache 2.0 — see [LICENSE](LICENSE).
