# Test Dependencies Installation Guide

## Current Problems in workflows.spec.ts

The TypeScript errors you're seeing are **expected** because the test dependencies haven't been installed yet. These are development dependencies that need to be added to your project.

## Errors Explained

1. **"Cannot find module '@playwright/test'"** - Playwright is not installed
2. **"Binding element 'page' implicitly has an 'any' type"** - TypeScript can't infer types without Playwright types

## Quick Fix - Install All Test Dependencies

Run these commands in the `frontend` directory:

```bash
cd frontend

# Install Playwright for E2E tests
npm install -D @playwright/test

# Install browsers for Playwright
npx playwright install

# Install Vitest and React Testing Library for unit tests
npm install -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom

# Install socket.io-client for WebSocket support
npm install socket.io-client

# Install react-hot-toast for notifications
npm install react-hot-toast

# Install @vitest/ui for test UI (optional)
npm install -D @vitest/ui
```

## Step-by-Step Installation (if you prefer)

### Option 1: E2E Tests Only

```bash
npm install -D @playwright/test
npx playwright install
```

### Option 2: Unit Tests Only

```bash
npm install -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

### Option 3: WebSocket Support Only

```bash
npm install socket.io-client react-hot-toast
```

## After Installation

Once installed, the TypeScript errors will disappear automatically. You can then run:

### Unit Tests

```bash
npm run test              # Run tests in watch mode
npm run test:ui           # Open Vitest UI
npm run test:coverage     # Generate coverage report
```

### E2E Tests

```bash
npm run test:e2e          # Run all E2E tests
npm run test:e2e:ui       # Run with Playwright UI
npm run test:e2e:report   # View test report
```

## Verify Installation

After installing, you can verify with:

```bash
# Check if Playwright is installed
npx playwright --version

# Check if Vitest is installed
npx vitest --version

# List all installed dependencies
npm list --depth=0
```

## Configuration Files Created

✅ `e2e/tsconfig.json` - TypeScript config for E2E tests (already created)  
✅ `playwright.config.ts` - Playwright configuration (already created)  
✅ Updated `package.json` with test scripts

## Expected package.json devDependencies (after install)

```json
{
  "devDependencies": {
    "@playwright/test": "^1.40.0",
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/react": "^14.1.2",
    "@testing-library/user-event": "^14.5.1",
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "@vitest/ui": "^1.0.4",
    "autoprefixer": "^10.4.16",
    "jsdom": "^23.0.1",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "typescript": "^5.3.3",
    "vite": "^5.0.8",
    "vitest": "^1.0.4"
  }
}
```

## Expected package.json dependencies (after install)

```json
{
  "dependencies": {
    "react-hot-toast": "^2.4.1",
    "socket.io-client": "^4.7.2",
    // ... existing dependencies
  }
}
```

## Note

These are **development-only errors** that won't affect your production build. The main application builds successfully (as we verified earlier). The test files are separate and optional.

You can install these dependencies **when you're ready to run tests**. The production build doesn't require them.
