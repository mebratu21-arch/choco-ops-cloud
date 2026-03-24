# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-14

### Added

- **Production Orchestration** — Full batch lifecycle management with multi-stage tracking (Roasting → Winnowing → Grinding → Conching → Tempering)
- **Quality Assurance** — Digital QC inspection forms with sensory scoring, defect classification, and audit logging
- **Smart Inventory** — Real-time ingredient tracking with stock movement history, low-stock alerts, and trajectory visualization
- **Predictive Maintenance** — Machine health monitoring, maintenance scheduling, and alert resolution system
- **Recipe Management** — JSONB-based recipe storage with ingredient linking, multilingual translation, and editorial cookbook UI
- **Commerce & Sales** — Product catalog, Stripe payment integration, and sales analytics dashboards
- **AI Assistant** — Google Gemini-powered chat for operational insights and recipe translation
- **Role-Based Access** — JWT authentication with role-based routing (Admin, Manager, Worker, Mechanic, QC Inspector)
- **Real-Time Updates** — Socket.io integration for live dashboard data
- **Manager Dashboard** — Executive telemetry with yield convergence charts, workforce monitoring, and critical path actions
- **CI/CD Pipeline** — GitHub Actions for linting, testing, and automated deployment
- **Responsive Design** — Premium dark-theme UI with Framer Motion animations, glassmorphism effects, and TailwindCSS

### Technical Stack

- **Frontend:** React 18, TypeScript, Vite, TailwindCSS, Framer Motion, TanStack Query, Zustand, Recharts, Chart.js
- **Backend:** Node.js, Express, TypeScript, PostgreSQL, Knex.js, Socket.io, Zod, JWT
- **Payments:** Stripe
- **AI:** Google Gemini API
- **Testing:** Vitest, Playwright, Jest
- **Deployment:** Vercel, GitHub Actions
