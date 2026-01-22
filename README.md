# ChocoOps Cloud 🍫

Production-grade manufacturing operations platform for chocolate factories. Integrated inventory, production tracking, quality control, and sales management.

## 🚀 Architecture

**Backend**: Node.js + TypeScript + PostgreSQL (Neon)
**Frontend**: (Coming Soon)

### Key Features
- **IAM**: Role-based access control (RBAC) with 7 distinct roles.
- **Inventory**: Real-time stock tracking with location management.
- **Production**: Batch lifecycle management (Start -> Conche -> Temper -> Complete).
- **Quality**: Multi-criteria quality assurance checkpoints.
- **Sales**: B2B and B2C order processing with financial tracking.

## 🛠️ Quick Start

### Prerequisites
- Node.js >= 18
- PostgreSQL >= 14
- npm >= 9

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mebratu21-arch/choco-ops-cloud.git
   cd choco-ops-cloud
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Update .env with your PostgreSQL credentials
   ```

3. **Initialize Database**
   ```bash
   npm run migrate:latest
   npm run seed:run
   ```

## 📚 Documentation

- [Backend Documentation](./backend/README.md)
- [Database Schema Walkthrough](./brain/d87fd197-e7db-4cb6-8bfd-34d2d3b10c2f/walkthrough.md)
- [Quick Start Guide](./backend/QUICKSTART.md)

## 🤝 Contributing

We love contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting a Pull Request.

## 📄 License

This project is licensed under the [MIT License](LICENSE).
