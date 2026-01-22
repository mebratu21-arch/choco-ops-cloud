# ChocoOps Cloud - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Install PostgreSQL

**Windows**:
```powershell
# Download from https://www.postgresql.org/download/windows/
# Or use Chocolatey:
choco install postgresql
```

**Mac**:
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux (Ubuntu/Debian)**:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Step 2: Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# In psql:
CREATE DATABASE chocoops_cloud;
CREATE USER chocoops WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE chocoops_cloud TO chocoops;
\q
```

### Step 3: Configure Environment

```bash
cd backend

# Copy template
cp .env.example .env

# Edit .env (use your favorite editor)
notepad .env  # Windows
nano .env     # Linux/Mac
```

**Required in .env**:
```env
DATABASE_URL=postgresql://chocoops:your_secure_password@localhost:5432/chocoops_cloud
JWT_SECRET=<run command below to generate>
NODE_ENV=development
PORT=5000
```

**Generate JWT Secret**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Run Migrations & Seed

```bash
# Test connection
npm run test:connection

# Run migrations
npm run migrate:latest

# Seed demo data
npm run seed:run
```

### Step 5: Verify

```bash
# Connect to database
psql -U chocoops -d chocoops_cloud

# Check tables
\dt

# Query users
SELECT email, role FROM users;

# Exit
\q
```

## 🎯 Common Commands

```bash
# Development
npm run dev                 # Start dev server
npm run test:connection     # Test DB connection

# Migrations
npm run migrate:latest      # Run all migrations
npm run migrate:rollback    # Undo last batch
npm run migrate:status      # Check status

# Seeds
npm run seed:run           # Run seed files

# Database Reset
npm run db:reset           # Rollback + Migrate + Seed
```

## 🔐 Demo Login

All users have password: `password123`

- manager@chocoops.com
- warehouse@chocoops.com
- production@chocoops.com
- qc@chocoops.com
- mechanic@chocoops.com
- controller@chocoops.com
- admin@chocoops.com

## 🐛 Troubleshooting

### "Connection refused"
- PostgreSQL not running: `sudo systemctl start postgresql`
- Wrong host/port in DATABASE_URL

### "Database does not exist"
- Run: `createdb chocoops_cloud`

### "Authentication failed"
- Check username/password in DATABASE_URL
- Verify user permissions

### "Migration failed"
- Check PostgreSQL version (>= 14 recommended)
- Ensure database is empty or run `npm run db:reset`

## 📚 Next Steps

1. ✅ Database setup complete
2. 🔨 Build REST API layer
3. 🔐 Implement authentication endpoints
4. 📊 Create dashboard frontend
5. 🧪 Write integration tests

## 🆘 Need Help?

Check the full documentation:
- [README.md](file:///c:/Users/mebra/OneDrive/Desktop/choco-ops-cloud/backend/README.md)
- [Walkthrough](file:///C:/Users/mebra/.gemini/antigravity/brain/d87fd197-e7db-4cb6-8bfd-34d2d3b10c2f/walkthrough.md)
