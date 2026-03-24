<div align="center">

# 🍫 CocoaFlow AI

### Smart Chocolate Factory Management System

![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)

![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Build](https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge)
![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=for-the-badge)

**A production-grade Manufacturing Execution System (MES) built from real operational experience at Max Brenner Chocolate Factory. Manages production batches, quality control, smart inventory, predictive maintenance, AI-powered insights, and integrated commerce — all in one platform.**

[▶️ View Demo](https://www.loom.com/share/cdd0e54e1e994b97bdcc0ec57180e4ba) · [Report Bug](https://github.com/mebratu21-arch/choco-ops-cloud/issues/new?template=bug_report.yml) · [Request Feature](https://github.com/mebratu21-arch/choco-ops-cloud/issues/new?template=feature_request.yml)

</div>

---

## 📋 Table of Contents

- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
- [API Overview](#-api-overview)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [Author](#-author)
- [Acknowledgments](#-acknowledgments)

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🏭 **Production Orchestration** | Full batch lifecycle tracking across 5 manufacturing stages — Roasting → Winnowing → Grinding → Conching → Tempering |
| 🔍 **Quality Assurance** | Score-based QC inspections with sensory evaluation, defect classification, and full audit trails |
| 📦 **Smart Inventory** | Real-time ingredient tracking with movement history, low-stock alerts, and trajectory forecasting |
| 🔧 **Predictive Maintenance** | Machine health monitoring, maintenance scheduling, alert resolution, and downtime tracking |
| 🤖 **AI Assistant (Gemini)** | Context-aware chatbot for production optimization, inventory recommendations, and quality analysis |
| 🛒 **Commerce & Sales** | Product catalog, Stripe payment integration, order management, and sales analytics |
| 👥 **Role-Based Access** | JWT authentication with 6 distinct roles — Admin, Manager, Production Worker, Warehouse, QC Inspector, Mechanic |
| ⚡ **Real-Time Updates** | WebSocket-powered live dashboards, notifications, and instant alerts across all roles |
| 📊 **Executive Dashboard** | Manager-level telemetry with yield convergence, workforce monitoring, and critical path actions |
| 🌍 **AI Recipe Translation** | Multilingual recipe translation powered by Google Gemini |

---

## 🛠️ Tech Stack

<div align="center">

### Frontend

![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![React Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chart.js&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=react&logoColor=white)

### Backend

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)

### Database

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Neon](https://img.shields.io/badge/Neon-00E5A0?style=for-the-badge&logo=neon&logoColor=black)
![Knex.js](https://img.shields.io/badge/Knex.js-E16426?style=for-the-badge&logo=knex&logoColor=white)

### AI & DevOps

![Google Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)

</div>

---

## 🏗️ Architecture

```mermaid
graph TB
    subgraph Client["🖥️ Frontend — React + Vite"]
        UI[React 18 + TypeScript]
        State[Zustand + TanStack Query]
        Charts[Chart.js + Recharts]
    end

    subgraph Server["⚙️ Backend — Node.js + Express"]
        API[REST API — 60+ Endpoints]
        Auth[JWT Authentication]
        WS[Socket.IO — Real-Time]
        AI[Gemini AI Service]
        Valid[Zod Validation]
    end

    subgraph Data["🗄️ Database — PostgreSQL"]
        DB[(Neon PostgreSQL)]
        Knex[Knex.js ORM]
        Tables[18 Tables with Indexes & Triggers]
    end

    subgraph External["🌐 External Services"]
        Gemini[Google Gemini Pro API]
        StripeAPI[Stripe Payments API]
    end

    UI -->|HTTP/REST| API
    UI <-->|WebSocket| WS
    API --> Auth
    API --> Valid
    API --> Knex --> DB
    AI --> Gemini
    API --> AI
    API --> StripeAPI
    State --> UI
    Charts --> UI
```

### Role-Based Access Flow

```mermaid
graph LR
    Login[🔐 Login] --> JWT{JWT Token}
    JWT --> Admin[👑 Admin Dashboard]
    JWT --> Manager[📊 Manager Dashboard]
    JWT --> Worker[🏭 Production Worker]
    JWT --> Warehouse[📦 Warehouse Staff]
    JWT --> QC[🔍 QC Inspector]
    JWT --> Mechanic[🔧 Mechanic]
```

Each role sees a customized dashboard with permissions scoped to their responsibilities.

---

## 🗃️ Database Schema

```mermaid
erDiagram
    USERS ||--o{ BATCHES : manages
    USERS ||--o{ QUALITY_CHECKS : performs
    USERS ||--o{ AUDIT_LOGS : generates
    USERS ||--o{ REFRESH_TOKENS : has
    USERS ||--o{ CHAT_HISTORY : chats
    SUPPLIERS ||--o{ INGREDIENTS : supplies
    INGREDIENTS ||--o{ RECIPE_INGREDIENTS : used_in
    RECIPES ||--o{ RECIPE_INGREDIENTS : contains
    RECIPES ||--o{ BATCHES : produces
    BATCHES ||--o{ BATCH_INGREDIENTS : consumes
    BATCHES ||--o{ QUALITY_CHECKS : inspected_by
    INGREDIENTS ||--o{ BATCH_INGREDIENTS : consumed
    PRODUCTS ||--o{ SHOP_ORDERS : ordered
    USERS ||--o{ EMPLOYEE_SALES : sells
```

**18 tables** including: `users`, `suppliers`, `ingredients`, `recipes`, `recipe_ingredients`, `batches`, `batch_ingredients`, `quality_checks`, `audit_logs`, `refresh_tokens`, `employee_sales`, `online_orders`, `chat_history`, `alerts`, `maintenance`, `products`, `shop_orders`, `machines`

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **PostgreSQL** 14+ (or [Neon](https://neon.tech) serverless account)
- **Google Gemini API Key** — [Get one here](https://aistudio.google.com/apikey)
- **Stripe API Key** (optional, for payment features)

### Installation

```bash
# Clone the repository
git clone https://github.com/mebratu21-arch/choco-ops-cloud.git
cd choco-ops-cloud

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Environment Setup

Create `.env` files from the examples:

```bash
# Backend
cp backend/.env.example backend/.env
```

#### Backend `.env` Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/cocoaflow` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |
| `GEMINI_API_KEY` | Google Gemini API key | `AIza...` |
| `CORS_ORIGIN` | Frontend URL | `http://localhost:5173` |

### Database Setup

```bash
cd backend

# Run migrations
npx knex migrate:latest

# Seed with demo data
npx knex seed:run
```

### Start Development Servers

```bash
# Terminal 1 — Backend (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
```

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@cocoaflow.com | admin123 |
| Manager | manager@cocoaflow.com | manager123 |
| Production | worker@cocoaflow.com | worker123 |
| Warehouse | warehouse@cocoaflow.com | warehouse123 |
| QC Inspector | qc@cocoaflow.com | qc123 |
| Mechanic | mechanic@cocoaflow.com | mechanic123 |

---

## 📡 API Overview

**60+ RESTful endpoints** organized by domain. Rate limited at **100 requests / 15 minutes**.

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login & receive JWT |
| `POST` | `/api/auth/refresh` | Refresh access token |
| `GET` | `/api/auth/profile` | Get current user profile |
| `PUT` | `/api/auth/change-password` | Change password |

### Production

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/batches` | List all production batches |
| `POST` | `/api/batches` | Create new batch |
| `PATCH` | `/api/batches/:id/stage` | Update batch stage |
| `GET` | `/api/production/stats` | Production statistics |

### Inventory & Warehouse

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/inventory` | List all ingredients |
| `POST` | `/api/inventory/adjust` | Adjust stock levels |
| `GET` | `/api/inventory/:id/movements` | Stock movement history |
| `GET` | `/api/inventory/stats` | Inventory analytics |

### AI Assistant

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ai/chat` | Send message to AI |
| `GET` | `/api/ai/history` | Chat history |
| `POST` | `/api/ai/suggestions` | Production optimization |
| `POST` | `/api/ai/quality-analysis` | Quality insights |

### Quality Control

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/qc/inspections` | List inspections |
| `POST` | `/api/qc/inspections` | Submit QC inspection |
| `GET` | `/api/qc/stats` | QC statistics |

<details>
<summary><strong>Additional Domains: Maintenance, Sales, Shop, Recipes, Dashboard, Manager...</strong></summary>

#### Maintenance
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/maintenance` | List maintenance tasks |
| `POST` | `/api/maintenance` | Create task |
| `GET` | `/api/machines` | Machine health status |

#### Sales & Commerce
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/shop/products` | Product catalog |
| `POST` | `/api/payment/create-intent` | Create Stripe payment |
| `GET` | `/api/sales/stats` | Sales analytics |

#### Recipes
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/recipes` | List recipes |
| `POST` | `/api/recipes` | Create recipe |
| `POST` | `/api/ai/translate-recipe` | AI recipe translation |

</details>

---

## 📁 Project Structure

```
choco-ops-cloud/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handling
│   │   ├── services/        # Business logic
│   │   ├── repositories/    # Database queries
│   │   ├── routes/          # API route definitions
│   │   ├── middleware/      # Auth, validation, rate limiting
│   │   ├── models/          # TypeScript interfaces
│   │   ├── config/          # App configuration
│   │   ├── utils/           # Shared utilities
│   │   └── websocket/       # Socket.IO handlers
│   ├── migrations/          # Knex database migrations (18)
│   ├── seeds/               # Demo data seeders
│   └── scripts/             # Categorized utility scripts
│       ├── admin/           # Admin management
│       ├── db/              # Database utilities
│       ├── debug/           # Debugging tools
│       ├── fix/             # Data fixes
│       ├── maintenance/     # Maintenance helpers
│       ├── migration/       # Migration helpers
│       ├── seed/            # Seed data generators
│       └── test/            # API test scripts
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components (18 groups)
│   │   ├── pages/           # Route-level pages (18 modules)
│   │   │   ├── admin/       # Admin management
│   │   │   ├── ai/          # AI chat assistant
│   │   │   ├── dashboard/   # Role-based dashboards
│   │   │   ├── inventory/   # Warehouse management
│   │   │   ├── production/  # Batch management
│   │   │   ├── qc/          # Quality control
│   │   │   ├── recipes/     # Recipe book
│   │   │   ├── sales/       # Commerce & analytics
│   │   │   ├── shop/        # Product storefront
│   │   │   └── ...          # Settings, Support, Tasks, etc.
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API client services
│   │   ├── stores/          # Zustand state stores
│   │   └── types/           # TypeScript definitions
│   └── scripts/             # Build & analysis scripts
│
├── .github/
│   ├── workflows/           # CI/CD pipelines
│   ├── ISSUE_TEMPLATE/      # Bug & feature templates
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── dependabot.yml       # Auto dependency updates
│
├── CONTRIBUTING.md           # Contribution guidelines
├── CODE_OF_CONDUCT.md        # Community standards
├── CHANGELOG.md              # Version history
├── LICENSE                   # MIT License
└── README.md                 # ← You are here
```

---

## 🚢 Deployment

| Service | Platform | Purpose |
|---------|----------|---------|
| Frontend | **Vercel** | React SPA hosting + CDN |
| Backend | **Render** | Node.js API server |
| Database | **Neon** | Serverless PostgreSQL |
| CI/CD | **GitHub Actions** | Lint, test, deploy |
| Payments | **Stripe** | Payment processing |

---

## 🤝 Contributing

Contributions are welcome! Please read the [Contributing Guidelines](CONTRIBUTING.md) and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

```bash
# Fork → Clone → Branch → Code → Test → PR
git checkout -b feature/amazing-feature
git commit -m "feat: add amazing feature"
git push origin feature/amazing-feature
```

---

## 👨‍💻 Author

### Mebratu Mengstu

Full-Stack Developer | Information Systems Graduate

Built from real operational experience at **Max Brenner Chocolate Factory**, Petah Tikva, Israel. This project transforms hands-on factory knowledge into a production-grade digital solution.

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/mebratu21)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/mebratu21-arch)
[![Portfolio](https://img.shields.io/badge/Portfolio-FF5722?style=for-the-badge&logo=google-chrome&logoColor=white)](https://github.com/mebratu21-arch/Mebratu-Mengstu---Portfolio-Website)
[![Demo Video](https://img.shields.io/badge/Demo_Video-FF0000?style=for-the-badge&logo=loom&logoColor=white)](https://www.loom.com/share/cdd0e54e1e994b97bdcc0ec57180e4ba)

---

## 🙏 Acknowledgments

- **Developer Institute** — Full-Stack Development Bootcamp
- **Max Brenner Chocolate Factory** — Real-world inspiration and domain expertise
- **Google Gemini** — AI-powered factory assistant capabilities
- **Open Source Community** — React, Node.js, PostgreSQL, and all the incredible tools

---

<div align="center">

Built with ❤️ and real factory experience

**⭐ Star this repo if you find it helpful!**

</div>
