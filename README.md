# Harmony CRM

A full-stack CRM for sales teams: lead pipeline, tasks, employees, departments, goals, attendance and analytics, with role-based access.

**Stack:** Java 21 · Spring Boot 3 · Spring Security (JWT) · Spring Data JPA · PostgreSQL / H2 · React 18 · TypeScript · Vite · Tailwind · shadcn/ui · Docker

```
┌──────────────┐   JSON + JWT    ┌──────────────────────────────┐    ┌──────────────┐
│  React + TS  │ ──────────────▶ │  Spring Boot REST API (8081) │ ─▶ │  PostgreSQL  │
│  (Vite 8080) │ ◀────────────── │  controller → service → repo │    │  (H2 in dev) │
└──────────────┘                 └──────────────────────────────┘    └──────────────┘
```

## Features

- **Authentication & authorization** – BCrypt passwords, stateless JWT, roles `admin` / `manager` / `employee` enforced with `@PreAuthorize`.
- **Lead pipeline** – CRUD, dynamic filtering (status, temperature, owner, free-text search) built with JPA Specifications, and an automatic activity timeline (a status change is logged by the server).
- **Tasks** – priorities, due dates, `completedAt` is stamped automatically, and a nightly `@Scheduled` job marks late tasks as *overdue*.
- **Employees & departments** – admin-managed users; department headcount is calculated live.
- **Goals, attendance, notifications** – check-in / check-out with late and half-day detection; per-user notifications.
- **Analytics** – dashboard KPIs, lead sources, 6-month sales trend and a rep leaderboard.
- **Engineering basics** – Bean Validation, one global exception handler with consistent JSON errors, CORS config, OpenAPI / Swagger UI, integration tests, Docker Compose.

## Run it

### Option 1 – Docker (everything, with PostgreSQL)
```bash
docker compose up --build
```
Frontend <http://localhost:3000> · API <http://localhost:8081> · Swagger <http://localhost:8081/swagger-ui.html>

### Option 2 – Local development (no database to install)
```bash
# terminal 1 – backend (Java 21 + Maven). Uses in-memory H2 and seeds demo data.
cd backend
mvn spring-boot:run

# terminal 2 – frontend (Node 20+)
cd frontend
cp .env.example .env        # VITE_API_URL=http://localhost:8081
npm install
npm run dev                 # http://localhost:8080
```
Remove `VITE_API_URL` from `.env` to run the UI alone on the built-in mock data.

### Demo accounts
Password for all of them: `password`

| Email | Role |
|---|---|
| alex@nexuscrm.io | admin |
| sarah@nexuscrm.io | manager |
| michael@nexuscrm.io | employee |

## API overview

Interactive docs: `/swagger-ui.html` (click **Authorize** and paste the JWT from `/api/auth/login`).

| Area | Endpoints | Who |
|---|---|---|
| Auth | `POST /api/auth/login`, `GET /api/auth/me` | public / logged in |
| Leads | `GET /api/leads?status=&temperature=&assignedTo=&q=`, `GET/POST /api/leads`, `PATCH /api/leads/{id}`, `GET/POST /api/leads/{id}/activities` | logged in |
| | `DELETE /api/leads/{id}` | admin, manager |
| Tasks | `GET /api/tasks?assignedTo=&status=`, `POST`, `PATCH /{id}` | logged in |
| | `DELETE /api/tasks/{id}` | admin, manager |
| Employees | `GET /api/users`, `GET /api/users/{id}` | logged in |
| | `POST`, `PATCH`, `DELETE /api/users` | admin |
| Departments | `GET /api/departments` | logged in |
| | `POST`, `PATCH` / `DELETE` | admin, manager / admin |
| Goals | `GET /api/goals?userId=`, `PATCH /{id}` | logged in |
| | `POST`, `DELETE` | admin, manager |
| Attendance | `GET /api/attendance`, `POST /api/attendance/check-in`, `POST /api/attendance/check-out` | logged in |
| Notifications | `GET /api/notifications`, `PATCH /{id}/read`, `POST /read-all` | own only |
| Analytics | `GET /api/analytics/dashboard`, `/lead-sources`, `/sales-trend`, `/leaderboard` | logged in |

## Design notes

- **Layering:** `web` (controllers) → `service` (business rules, transactions) → `repository` (Spring Data). Entities live in `domain`.
- **Security:** a `OncePerRequestFilter` reads the `Bearer` token, validates it with `JwtService` and fills the `SecurityContext`. Missing / invalid token → `401`; wrong role → `403`. Password hashes are never serialized.
- **Ids are strings** (UUID, or readable ids like `l1` for seed data) so the JSON matches the existing React types without changes.
- **PATCH** accepts a partial JSON body and updates only the supplied fields (`PatchHelper`), so the frontend can send `{ "status": "qualified" }` from drag-and-drop.
- **Profiles:** default = in-memory H2 (zero setup). `prod` = PostgreSQL via environment variables (`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `CORS_ALLOWED_ORIGINS`).
- **Seed data** is created on first start with dates relative to "today". Disable with `SEED_DATA=false`.

## Tests

```bash
cd backend && mvn test
```
`ApiIntegrationTest` runs the real security chain with MockMvc against H2 (login, 401/403 rules, filtering, validation, status-change timeline, task completion, attendance rules, analytics). `JwtServiceTest` covers valid, tampered and expired tokens.

## Project structure

```
harmony-crm/
├── backend/                 Spring Boot API
│   └── src/main/java/com/harmony/crm/
│       ├── config/          security, CORS, OpenAPI, scheduling, demo data
│       ├── security/        JWT service + request filter
│       ├── domain/          JPA entities
│       ├── enums/           lower-case JSON enums (match the React types)
│       ├── repository/      Spring Data repositories + Specifications
│       ├── service/         business logic
│       ├── web/             REST controllers
│       ├── dto/             request / response records
│       └── exception/       error handling
├── frontend/                React + TypeScript + Vite UI
└── docker-compose.yml
```

## Frontend ↔ backend status

| Screen | Data source |
|---|---|
| Login | real JWT login (backend) |
| Leads (list, create, drag-and-drop status, delete) | backend |
| Tasks, Employees, Departments, Goals, Attendance, Dashboard, Analytics | still the in-memory mock data in the UI. The REST endpoints already exist, so wiring them is the next step. |
