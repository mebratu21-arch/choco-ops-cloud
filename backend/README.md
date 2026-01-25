# ChocoOps Cloud Backend

Production-grade PostgreSQL database layer for chocolate manufacturing operations.

##  Quick Start

###  API Documentation
Full API documentation is available via **Swagger UI**:
> **http://localhost:5000/api-docs**

Verify all endpoints and schemas interactively.

### Prerequisites
- Node.js >= 18.0.0
- PostgreSQL >= 14
- npm >= 9.0.0

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your database credentials
# DATABASE_URL=postgresql://username:password@localhost:5432/chocoops_cloud
```

### Database Setup

```bash
# Test database connection
npm run test:connection

# Run migrations
npm run migrate:latest

# Seed development data
npm run seed:run

# Check migration status
npm run migrate:status
```

### Development

```bash
# Start development server
npm run dev

# Reset database (rollback, migrate, seed)
npm run db:reset
```

##  Database Schema

### Tables (12)

1. **users** - Authentication and authorization
2. **suppliers** - Vendor management with reliability tracking
3. **ingredients** - Raw materials inventory with location tracking
4. **recipes** - Product formulations with JSONB instructions
5. **recipe_ingredients** - Recipe bill of materials
6. **batches** - Production batch tracking
7. **batch_ingredients** - Actual ingredients used in production
8. **quality_checks** - Quality control assessments
9. **audit_logs** - Comprehensive audit trail
10. **refresh_tokens** - JWT refresh token management
11. **employee_sales** - Internal employee purchases
12. **online_orders** - External customer orders

### Key Features

 **Advanced Constraints**
- Check constraints for data integrity
- Unique constraints for business rules
- Foreign key relationships with appropriate cascade rules

 **Performance Optimization**
- Strategic B-tree indexes
- GIN indexes for JSONB columns
- Partial indexes for common queries
- Composite indexes for multi-column queries

 **Audit & Compliance**
- Soft delete support (deleted_at)
- Comprehensive audit logging
- Change tracking with old/new values
- IP address and user agent tracking

 **Production Ready**
- Environment-aware configuration
- Connection pooling
- Type-safe with TypeScript
- Zod schema validation


##  Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build TypeScript to JavaScript |
| `npm run start` | Run production build |
| `npm run migrate:latest` | Run all pending migrations |
| `npm run migrate:rollback` | Rollback last migration batch |
| `npm run migrate:status` | Check migration status |
| `npm run seed:run` | Run seed files |
| `npm run db:reset` | Reset database (rollback, migrate, seed) |
| `npm run test:connection` | Test database connection |

## ️ Project Structure

```
backend/
├── migrations/          # Database migrations (001-012)
├── seeds/              # Seed data files
├── src/
│   └── config/
│       ├── environment.ts   # Environment validation
│       └── database.ts      # Database connection
├── knexfile.ts         # Knex configuration
├── tsconfig.json       # TypeScript configuration
├── package.json        # Dependencies and scripts
└── .env.example        # Environment template
```

##  Environment Variables

Required:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret (min 32 chars)

Optional:
- `JWT_REFRESH_SECRET` - Refresh token secret
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000)

##  Database Best Practices

### Migrations
- Never modify existing migrations
- Always create new migrations for schema changes
- Use descriptive migration names
- Test rollback functionality

### Queries
- Use prepared statements (Knex handles this)
- Leverage indexes for performance
- Use transactions for multi-table operations
- Implement pagination for large result sets

### Security
- Never store plain text passwords
- Use parameterized queries
- Validate input with Zod schemas
- Implement proper RBAC

##  Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Create migration if needed
5. Submit pull request

##  License

MIT
