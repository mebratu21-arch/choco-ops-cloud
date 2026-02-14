# Contributing to ChocoOps Cloud

Thank you for your interest in contributing to ChocoOps Cloud! This document provides guidelines and standards for contributing to this project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Branch Naming](#branch-naming)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Code Standards](#code-standards)
- [Reporting Issues](#reporting-issues)

---

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

1. **Fork** the repository
2. **Clone** your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/choco-ops-cloud.git
   ```
3. **Install dependencies:**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
4. **Set up your environment** — Copy `.env.example` to `.env` in both `backend/` and `frontend/`
5. **Create a feature branch** from `main`

## Branch Naming

Use the following prefixes for branch names:

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feature/` | New feature | `feature/recipe-import` |
| `bugfix/` | Bug fix | `bugfix/login-500-error` |
| `hotfix/` | Critical production fix | `hotfix/auth-bypass` |
| `docs/` | Documentation only | `docs/api-endpoints` |
| `refactor/` | Code refactoring | `refactor/service-layer` |
| `chore/` | Maintenance tasks | `chore/update-deps` |

## Commit Messages

We follow the **Conventional Commits** specification:

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code formatting (no logic change) |
| `refactor` | Code restructuring (no feature/fix) |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `chore` | Build process or tooling |
| `ci` | CI/CD configuration |

### Examples

```
feat(inventory): add low-stock alert notifications
fix(auth): resolve JWT refresh token expiration bug
docs(readme): update project structure section
chore(deps): upgrade React to v18.3
```

## Pull Request Process

1. **Update your branch** with the latest `main`:
   ```bash
   git fetch origin
   git rebase origin/main
   ```
2. **Ensure all checks pass:**
   - `npm run build` (no TypeScript errors)
   - `npm run lint` (no linting errors)
   - `npm run test` (all tests pass)
3. **Fill out the PR template** completely
4. **Request review** from at least one maintainer
5. **Address feedback** promptly

### PR Checklist

- [ ] Code follows the project's style guidelines
- [ ] Self-reviewed my own code
- [ ] Added/updated tests for new functionality
- [ ] Updated documentation if needed
- [ ] No new warnings or errors introduced
- [ ] Dependent changes have been merged

## Code Standards

### TypeScript

- Strict mode enabled — no `any` types
- Use nullish coalescing (`??`) over logical OR (`||`) for defaults
- Prefer `interface` over `type` for object shapes
- Use `const` by default, `let` only when reassignment is needed

### React / Frontend

- Functional components with hooks only
- Use React Query for server state, Zustand for client state
- Component files: PascalCase (e.g., `ProductionCard.tsx`)
- Hook files: camelCase with `use` prefix (e.g., `useInventory.ts`)
- Keep components focused — extract logic into custom hooks

### Backend / Express

- Controllers handle HTTP; services handle business logic
- Validate all input with Zod schemas
- Use proper HTTP status codes
- Handle errors with middleware, not try/catch in every handler
- Use Knex transactions for multi-table operations

### General

- ESLint and TypeScript must pass with zero errors
- No `console.log` in production code (use proper logging)
- Environment variables via `.env` — never hardcode secrets

## Reporting Issues

Use the [GitHub Issue Templates](.github/ISSUE_TEMPLATE/) to report bugs or request features. Provide as much context as possible, including:

- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Screenshots or logs if applicable
- Browser/OS/Node.js version

---

Thank you for helping make ChocoOps Cloud better! 🍫
