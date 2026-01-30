# CocoaFlow AI - Project Structure

## Root Directory
```
choco-ops-cloud/
├── backend/           # Node.js + Express + TypeScript API
├── frontend/          # React + Vite + TypeScript UI
└── PROJECT_STRUCTURE.md
```

## Backend Structure

```
backend/
├── src/
│   ├── config/                   # Configuration files
│   │   ├── database.ts          # Knex database connection
│   │   ├── env.ts               # Environment variables
│   │   ├── logger.ts            # Winston logger
│   │   ├── redis.ts             # Redis config
│   │   └── swagger.ts           # API documentation
│   │
│   ├── db/
│   │   ├── migrations/          # Database migrations
│   │   │   ├── 001_create_users.ts
│   │   │   ├── 002_create_suppliers.ts
│   │   │   ├── 003_create_ingredients.ts
│   │   │   ├── 004_create_recipes.ts
│   │   │   ├── 005_create_recipe_ingredients.ts
│   │   │   ├── 006_create_batches.ts
│   │   │   ├── 007_create_batch_ingredients.ts
│   │   │   ├── 008_create_quality_checks.ts
│   │   │   ├── 009_create_audit_logs.ts
│   │   │   ├── 010_create_refresh_tokens.ts
│   │   │   ├── 011_create_employee_sales.ts
│   │   │   ├── 012_create_online_orders.ts
│   │   │   └── 013_create_maintenance_logs.ts
│   │   │
│   │   └── seeds/               # Seed data
│   │       └── demo-data.ts
│   │
│   ├── controllers/             # Request handlers
│   │   ├── identity/
│   │   │   ├── auth.controller.ts
│   │   │   └── user.controller.ts
│   │   ├── inventory/
│   │   │   ├── inventory.controller.ts
│   │   │   ├── ingredient.controller.ts
│   │   │   ├── supplier.controller.ts
│   │   │   └── warehouse.controller.ts
│   │   ├── production/
│   │   │   ├── production.controller.ts
│   │   │   └── recipe.controller.ts
│   │   ├── quality/
│   │   │   ├── qc.controller.ts
│   │   │   └── mechanics.controller.ts
│   │   ├── shop/
│   │   │   ├── products.controller.ts
│   │   │   ├── orders.controller.ts
│   │   │   └── analytics.controller.ts
│   │   └── system/
│   │       ├── ai.controller.ts
│   │       ├── dashboard.controller.ts
│   │       └── health.controller.ts
│   │
│   ├── services/                # Business logic
│   │   ├── identity/
│   │   │   └── auth.service.ts
│   │   ├── inventory/
│   │   │   └── inventory.service.ts
│   │   ├── production/
│   │   │   └── production.service.ts
│   │   ├── quality/
│   │   │   ├── qc.service.ts
│   │   │   └── mechanics.service.ts
│   │   ├── sales/
│   │   │   └── sales.service.ts
│   │   └── system/
│   │       ├── ai.service.ts
│   │       ├── admin.service.ts
│   │       ├── audit.service.ts
│   │       └── dashboard.service.ts
│   │
│   ├── repositories/            # Database access layer
│   │   ├── identity/
│   │   │   └── user.repository.ts
│   │   ├── inventory/
│   │   │   ├── inventory.repository.ts
│   │   │   ├── supplier.repository.ts
│   │   │   └── warehouse.repository.ts
│   │   ├── production/
│   │   │   ├── production.repository.ts
│   │   │   └── recipe.repository.ts
│   │   ├── quality/
│   │   │   ├── qc.repository.ts
│   │   │   └── mechanics.repository.ts
│   │   ├── sales/
│   │   │   └── sales.repository.ts
│   │   └── system/
│   │       ├── admin.repository.ts
│   │       ├── alert.repository.ts
│   │       ├── audit.repository.ts
│   │       └── chat.repository.ts
│   │
│   ├── routes/                  # Express routes
│   │   ├── identity/
│   │   │   ├── auth.routes.ts
│   │   │   └── user.routes.ts
│   │   ├── inventory/
│   │   │   ├── inventory.routes.ts
│   │   │   ├── ingredient.routes.ts
│   │   │   └── supplier.routes.ts
│   │   ├── production/
│   │   │   ├── production.routes.ts
│   │   │   └── recipe.routes.ts
│   │   ├── quality/
│   │   │   ├── qc.routes.ts
│   │   │   └── mechanics.routes.ts
│   │   ├── shop/
│   │   │   ├── products.routes.ts
│   │   │   ├── orders.routes.ts
│   │   │   └── analytics.routes.ts
│   │   └── system/
│   │       ├── ai.routes.ts
│   │       ├── admin.routes.ts
│   │       ├── dashboard.routes.ts
│   │       └── health.routes.ts
│   │
│   ├── middleware/              # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── role.middleware.ts
│   │   ├── validate.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── rate-limit.middleware.ts
│   │
│   ├── schemas/                 # Validation schemas (Zod)
│   │   ├── auth.schema.ts
│   │   ├── inventory.schema.ts
│   │   ├── production.schema.ts
│   │   ├── qc.schema.ts
│   │   └── index.ts
│   │
│   ├── types/                   # TypeScript types
│   │   ├── auth.types.ts
│   │   ├── domain.types.ts
│   │   ├── inventory.types.ts
│   │   ├── production.types.ts
│   │   ├── qc.types.ts
│   │   └── express.d.ts
│   │
│   ├── utils/                   # Utility functions
│   │   ├── errors.ts
│   │   ├── helpers.ts
│   │   ├── jwt.ts
│   │   └── audit.ts
│   │
│   ├── app.ts                   # Express app setup
│   └── server.ts                # Server entry point
│
├── tests/                       # Test files
│   ├── integration/
│   └── repositories/
│
├── migrations/                  # Legacy migrations (to be cleaned)
├── seeds/                       # Legacy seeds (to be cleaned)
├── scripts/                     # Utility scripts
├── logs/                        # Application logs
│
├── .env                         # Environment variables
├── .env.example                 # Environment template
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── knexfile.ts                  # Knex migrations config
└── jest.config.ts               # Jest test config
```

## Frontend Structure

```
frontend/
├── src/
│   ├── pages/                   # Page components
│   │   ├── auth/
│   │   │   └── LoginPage.tsx
│   │   ├── dashboard/
│   │   │   ├── DashboardPage.tsx
│   │   │   └── DashboardSelector.tsx
│   │   ├── admin/
│   │   │   ├── AdminDashboardPage.tsx
│   │   │   ├── AdminAIDashboard.tsx
│   │   │   └── UserManagement.tsx
│   │   ├── inventory/
│   │   │   ├── InventoryPage.tsx
│   │   │   └── WarehouseDashboard.tsx
│   │   ├── production/
│   │   │   ├── ProductionBatches.tsx
│   │   │   └── ProductionBatchPage.tsx
│   │   ├── qc/
│   │   │   └── QualityControl.tsx
│   │   ├── mechanic/
│   │   │   ├── MechanicDashboardPage.tsx
│   │   │   └── MaintenanceTickets.tsx
│   │   └── manager/
│   │       ├── ManagerDashboardPage.tsx
│   │       └── Reports.tsx
│   │
│   ├── components/              # Reusable components
│   │   ├── layout/
│   │   │   ├── Layout.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Alert.tsx
│   │   │   └── Loader.tsx
│   │   ├── ai/
│   │   │   ├── AIAssistant.tsx
│   │   │   └── AIChat.tsx
│   │   ├── production/
│   │   │   ├── RecipeCard.tsx
│   │   │   └── InstructionClarifier.tsx
│   │   ├── qc/
│   │   │   └── DefectTranslator.tsx
│   │   ├── manager/
│   │   │   └── BroadcastTranslator.tsx
│   │   ├── dashboard/
│   │   │   └── PurpleStatCard.tsx
│   │   ├── common/
│   │   │   └── Modal.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── AIChatWidget.tsx
│   │
│   ├── lib/                     # Libraries and utilities
│   │   ├── api/
│   │   │   └── axios.ts         # Axios setup
│   │   ├── socketService.ts     # WebSocket client
│   │   └── utils.ts             # Helper functions
│   │
│   ├── hooks/                   # Custom React hooks
│   │   └── useArtisanTranslation.ts
│   │
│   ├── context/                 # React Context
│   │   ├── AuthContext.tsx
│   │   └── SearchContext.tsx
│   │
│   ├── domain/                  # Domain layer (Clean Architecture)
│   │   ├── models/
│   │   │   ├── InventoryItem.ts
│   │   │   └── UserRole.ts
│   │   └── repositories/
│   │       ├── IInventoryRepository.ts
│   │       └── ISalesRepository.ts
│   │
│   ├── data/                    # Data layer
│   │   ├── infrastructure/
│   │   │   ├── auth.api.ts
│   │   │   └── httpClient.ts
│   │   ├── repositories/
│   │   │   ├── InventoryRepositoryImpl.ts
│   │   │   └── SalesRepositoryImpl.ts
│   │   └── mockData.ts
│   │
│   ├── assets/                  # Static assets
│   ├── App.tsx                  # Root component
│   └── main.tsx                 # Entry point
│
├── public/                      # Public static files
├── e2e/                        # End-to-end tests
│   └── workflows.spec.ts
│
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── vite.config.ts               # Vite config
├── tailwind.config.js           # Tailwind CSS config
└── playwright.config.ts         # Playwright test config
```

## Key Database Tables (PostgreSQL)

1. **users** - User accounts with roles (Admin, Manager, Production, Warehouse, QC, Mechanic)
2. **suppliers** - Supplier information
3. **ingredients** - Raw materials and ingredients
4. **recipes** - Production recipes
5. **recipe_ingredients** - Recipe-ingredient relationships
6. **batches** - Production batches
7. **batch_ingredients** - Batch-ingredient usage
8. **quality_checks** - QC inspections
9. **equipment** - Machines and equipment
10. **maintenance_logs** - Maintenance records
11. **sos_alerts** - Emergency alerts
12. **refresh_tokens** - JWT refresh tokens
13. **audit_logs** - System audit trail
14. **employee_sales** - Employee shop orders
15. **online_orders** - Customer orders

## API Endpoints Structure

### Identity & Auth
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh token
- `GET /api/users/me` - Get current user

### Inventory
- `GET /api/inventory` - List inventory items
- `POST /api/inventory` - Add item
- `PUT /api/inventory/:id` - Update item
- `GET /api/inventory/search` - Search items
- `POST /api/inventory/movements` - Record movement

### Production
- `GET /api/recipes` - List recipes
- `POST /api/production/batches` - Create batch
- `GET /api/production/batches/:id` - Get batch details
- `PUT /api/production/batches/:id/status` - Update status

### Quality Control
- `POST /api/qc/inspections` - Create QC check
- `GET /api/qc/statistics` - QC statistics
- `GET /api/qc/defects` - Defect history

### Mechanics
- `POST /api/mechanics/sos` - Create SOS alert
- `GET /api/mechanics/machines` - List machines
- `POST /api/mechanics/maintenance` - Log maintenance

### Manager
- `POST /api/manager/announcements` - Broadcast message
- `GET /api/manager/dashboard` - Analytics dashboard
- `POST /api/manager/tasks` - Assign task

### AI Assistant
- `POST /api/ai/chat` - Send message to AI
- `GET /api/ai/history` - Chat history

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-gemini-api-key
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

## Color Scheme (Chocolate Factory Theme)

- Primary: `#78350f` (Brown-900)
- Accent: `#fbbf24` (Amber-400)
- Background: `#fef3c7` (Amber-100)
- Text: `#1c1917` (Stone-900)
- Success: `#10b981` (Green-500)
- Error: `#ef4444` (Red-500)
- Warning: `#f59e0b` (Amber-500)
