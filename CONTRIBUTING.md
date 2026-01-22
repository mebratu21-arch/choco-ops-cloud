# Contributing to ChocoOps Cloud

Thank you for your interest in contributing! We want to make it as easy as possible for you to get started.

## 🛠️ Development Workflow

1. **Fork the repository** and clone it locally.
2. **Create a branch** for your feature or bug fix:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Install dependencies** and run tests:
   ```bash
   cd backend
   npm install
   npm run test:connection
   ```
4. **Make your changes**. Ensure code follows the existing style.

## 📝 Commit Guidelines

We follow the **Conventional Commits** specification:

- `feat:` A new feature
- `fix:` A bug fix
- `docs:` Documentation only changes
- `style:` Changes that do not affect the meaning of the code
- `refactor:` A code change that neither fixes a bug nor adds a feature
- `test:` Adding missing tests or correcting existing tests
- `chore:` Changes to the build process or auxiliary tools

**Example**:
```
feat(auth): implement jwt token refresh mechanism
```

## 🧪 Testing

Before submitting a PR, ensure all migrations run successfully:

```bash
cd backend
npm run db:reset
```

## 🚀 Pull Request Process

1. Push your branch to GitHub.
2. Open a Pull Request against the `main` branch.
3. Provide a clear description of the problem and solution.
4. Wait for code review!

Thank you for helping us build better software! 🍫
