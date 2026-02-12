# CocoaFlow AI - Frontend

Smart chocolate factory management system built with React, TypeScript, and Tailwind CSS.

## Features

- **Role-based Authentication** - 6 user roles with granular permissions
- **Smart Inventory Management** - Location tracking (Aisle/Shelf/Box), low stock alerts, expiry warnings
- **Production Batch Tracking** - Recipe management, real-time batch status, ingredient availability
- **Quality Control** - Inspection forms, defect tracking, QC analytics
- **Mechanic SOS System** - Emergency alerts, machine status, maintenance logs
- **Manager Command Center** - Real-time analytics, announcements, task management
- **AI Assistant** - Multilingual support (6 languages), context-aware responses
- **Fully Responsive** - Mobile, tablet, and desktop optimized

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 18 |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| State Management | React Query (TanStack), Zustand |
| Routing | React Router v6 |
| Charts | Chart.js, Recharts |
| Icons | Lucide React |
| HTTP Client | Axios |
| Forms | React Hook Form |
| AI Integration | Google Gemini API |

## Prerequisites

- Node.js 20.x or higher
- npm 9.x or higher
- Backend API running (see backend README)

## Installation

```bash
# Clone repository
git clone https://github.com/yourusername/choco-ops-cloud.git

# Navigate to frontend
cd choco-ops-cloud/frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your backend URL
# VITE_API_URL=http://localhost:5000/api

# Start development server
npm run dev
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run build:prod` | Production build with optimizations |
| `npm run preview` | Preview production build locally |
| `npm run serve` | Serve production build on port 4173 |
| `npm run type-check` | Run TypeScript type checking |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors automatically |
| `npm run test` | Run unit tests with Vitest |
| `npm run test:ui` | Run tests with UI |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run analyze` | Analyze bundle size |
| `npm run clean` | Clean build artifacts |

## User Roles & Demo Accounts

| Role | Email | Password | Dashboard Access |
|------|-------|----------|------------------|
| Admin | admin@cocoaflow.com | Admin123! | Full system access |
| Manager | manager@cocoaflow.com | Manager123! | Command center, reports |
| Warehouse | warehouse@cocoaflow.com | Warehouse123! | Inventory management |
| Production | production@cocoaflow.com | Production123! | Batches, recipes |
| QC Inspector | qc@cocoaflow.com | QC123! | Quality inspections |
| Mechanic | mechanic@cocoaflow.com | Mechanic123! | SOS alerts, maintenance |

## Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable components
│   │   ├── ai/            # AI chat components
│   │   ├── common/        # Common UI (Modal, Toast)
│   │   ├── dashboard/     # Dashboard widgets
│   │   ├── inventory/     # Inventory components
│   │   ├── layout/        # Layout (Navbar, Sidebar)
│   │   ├── manager/       # Manager-specific
│   │   ├── mechanic/      # Mechanic-specific
│   │   ├── production/    # Production components
│   │   ├── qc/           # QC components
│   │   └── ui/           # Base UI (Button, Input)
│   ├── context/           # React contexts
│   │   ├── AuthContext    # Authentication state
│   │   └── ToastContext   # Toast notifications
│   ├── hooks/             # Custom React hooks
│   │   ├── useAuth        # Authentication hook
│   │   ├── useInventory   # Inventory data hook
│   │   ├── useProduction  # Production data hook
│   │   ├── useQC          # QC data hook
│   │   ├── useMechanic    # Mechanic data hook
│   │   └── useManager     # Manager data hook
│   ├── pages/             # Page components
│   │   ├── auth/          # Login, Register
│   │   ├── dashboard/     # Role-based dashboards
│   │   ├── inventory/     # Inventory pages
│   │   ├── production/    # Production pages
│   │   ├── qc/           # QC pages
│   │   ├── mechanic/     # Mechanic pages
│   │   └── manager/      # Manager pages
│   ├── services/          # API service layer
│   │   ├── api.ts        # Axios instance
│   │   ├── authService   # Auth API calls
│   │   ├── inventoryService
│   │   ├── productionService
│   │   ├── qcService
│   │   ├── mechanicService
│   │   └── managerService
│   ├── types/             # TypeScript definitions
│   │   └── index.ts      # All type exports
│   ├── utils/             # Utility functions
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── docs/                  # Documentation
├── .env.example          # Environment template
├── .env.production       # Production env vars
├── vercel.json           # Vercel configuration
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind configuration
└── tsconfig.json         # TypeScript config
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000/api` |
| `VITE_WS_URL` | WebSocket URL | `http://localhost:5000` |
| `VITE_APP_NAME` | Application name | `CocoaFlow AI` |
| `VITE_APP_VERSION` | App version | `1.0.0` |
| `VITE_ENV` | Environment | `development` |

## Testing

### Unit Tests (Vitest)

```bash
# Run all tests
npm run test

# Run with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### E2E Tests (Playwright)

```bash
# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# View test report
npm run test:e2e:report
```

## Deployment

See [DEPLOYMENT.md](../DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

## Design System

### Colors

| Name | Hex | Usage |
|------|-----|-------|
| Primary | `#92400e` | Chocolate Brown - buttons, links |
| Secondary | `#78350f` | Dark Chocolate - headers |
| Accent | `#fbbf24` | Gold - highlights, badges |
| Background | `#fef3c7` | Cream - page background |
| Success | `#10b981` | Green - success states |
| Error | `#ef4444` | Red - error states |
| Warning | `#f59e0b` | Amber - warning states |

### Typography

- **Font Family:** Inter, system-ui, sans-serif
- **Headings:** Bold, text-amber-900
- **Body:** Regular, text-gray-700

### Spacing

Uses Tailwind's default spacing scale (4px base unit).

## API Documentation

Backend API documentation available at `/api/docs` when running the backend server.

See [docs/API_INTEGRATION.md](./docs/API_INTEGRATION.md) for frontend integration patterns.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software developed for educational purposes.

## Author

**Mebratu Mengstu**
Developer Institute Final Project
Based on real experience at Max Brenner Chocolate Factory

## Acknowledgments

- Developer Institute
- Max Brenner Chocolate Factory (inspiration)
- Anthropic Claude AI (development assistance)
