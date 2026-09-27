# Projection App

Personal finance projection calculator — estimate how long it takes to reach a savings target, with UK take-home pay and budget guidance.

## Structure

```
ProjectionApp.Domain/          Core entities and business rules
ProjectionApp.Application/     Use cases, DTOs, service interfaces
ProjectionApp.Infrastructure/  Persistence and external integrations
ProjectionApp.Api/             ASP.NET Core API
ProjectionApp.Client/          React + TypeScript frontend (Vite)
ProjectionApp.Tests/           Unit tests
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

The API runs at `http://localhost:5171`. User profile data is persisted to `ProjectionApp.Api/data/user-profile.json`.

### Frontend

In a second terminal:

```powershell
cd ProjectionApp.Client
npm install
npm run dev
```

The React app runs at `http://localhost:5173` and proxies API requests to the backend.

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/api/profiles` | Get saved user profile |
| PUT | `/api/profiles` | Save user profile |
| POST | `/api/goals/reach-100k` | Analyze goal timeline (optional `targetAmount` in body) |
| POST | `/api/salary/take-home` | Calculate UK take-home pay and 50/30/20 budget split |
| GET | `/api/projections` | List sample projection summaries (demo data) |
| GET | `/api/projections/{id}` | Get a sample projection by id |

OpenAPI is available in Development at `/openapi/v1.json`.

## Features

- **Goal calculator** — compound monthly growth on investments and cash savings toward a target
- **Salary inference** — when monthly contributions are blank, estimates 20% of net income from salary
- **Take-home pay** — UK 2025/26 income tax and National Insurance with 50/30/20 budget split
- **Session history** — projection results saved in the browser tab via sessionStorage

## Branching

- `main` — stable baseline
- `genesis` — initial project scaffolding

## License

Apache 2.0 — see [LICENSE](LICENSE).
