# System Architecture

## Overview
ChocoOps Cloud Backend follows a strict **Service-Repository** pattern to ensure separation of concerns and testability.

## Layers

### 1. Controllers (HTTP Layer)
- **Responsibility**: Handle incoming HTTP requests, validate input (Zod/Joi), and send HTTP responses.
- **Location**: `src/controllers`
- **Rules**: NO business logic here. Only extracting params and calling Services.

### 2. Services (Business Logic)
- **Responsibility**: Core business rules, complex calculations, and coordinating multiple repositories.
- **Location**: `src/services`
- **Rules**: Pure business logic. Should ideally be database-agnostic.

### 3. Repositories (Data Access)
- **Responsibility**: Direct interaction with the database (Knex/SQL).
- **Location**: `src/repositories`
- **Rules**: Only SQL queries here. No business logic.

## Configuration
- All strictly typed configuration is located in `src/config`.
- Tool-specific configs (Knex, Jest) are in `.config/`.

## Testing
- Tests mirror the `src` structure in the `tests/` directory.
- `tests/services/*` unit tests business logic.
- `tests/repositories/*` integration tests DB queries.
