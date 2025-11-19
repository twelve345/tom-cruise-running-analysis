# Contributing to Tom Cruise Running Analysis

Thank you for your interest in contributing to this project! This document provides guidelines and instructions for developers.

## 💻 Development Setup

### Prerequisites

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **PostgreSQL**: For the backend database
- **MongoDB**: For flexible data storage

### Getting Started

This project uses a monorepo structure with separate frontend and backend workspaces managed by npm workspaces.

```bash
# Clone the repository
git clone https://github.com/yourusername/tom-cruise-running-analysis.git
cd tom-cruise-running-analysis

# Install all dependencies (root, backend, and frontend)
npm install

# Set up environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your database credentials

# Initialize databases
npm run db:setup --workspace=backend

# Run both frontend and backend in development mode
npm run dev
```

## 🌐 Running the Application Locally

### Quick Access

Once the application is running, you can access it at:

**With Docker Compose:**
- **Frontend (React App)**: http://localhost:3000
- **Backend GraphQL API (GraphiQL)**: http://localhost:4000/graphiql
- **Health Check**: http://localhost:4000/health

**Without Docker (Manual Setup):**
- **Frontend (React App)**: http://localhost:5173
- **Backend GraphQL API (GraphiQL)**: http://localhost:4000/graphiql
- **Health Check**: http://localhost:4000/health

### Option A: Using Docker Compose (Recommended)

Docker Compose runs the entire stack including databases. This is the easiest way to get started.

**Start the application:**
```bash
docker-compose up
```

**Run in detached mode (background):**
```bash
docker-compose up -d
```

**View logs:**
```bash
docker-compose logs -f              # All services
docker-compose logs -f frontend     # Frontend only
docker-compose logs -f backend      # Backend only
```

**Stop the application:**
```bash
docker-compose down
```

**Restart a specific service:**
```bash
docker-compose restart frontend
docker-compose restart backend
```

**Docker Services:**
- `tomcruise_frontend` - React app (port 3000)
- `tomcruise_backend` - GraphQL API with GraphiQL (port 4000)
- `tomcruise_postgres` - PostgreSQL database (port 5433)
- `tomcruise_mongo` - MongoDB (port 27017)

### Option B: Manual Setup (Without Docker)

If you prefer to run the services manually without Docker, you'll need to have PostgreSQL and MongoDB running separately.

**1. Start Backend:**
```bash
cd backend
npm run dev
```
Backend will be available at http://localhost:4000

**2. Start Frontend (in another terminal):**
```bash
cd frontend
npm run dev
```
Frontend will be available at http://localhost:5173

**3. Or use the root workspace script:**
```bash
npm run dev    # Runs both backend and frontend concurrently
```

**Note:** When running manually, the frontend runs on port **5173** instead of 3000.

### Database Connection Details

**PostgreSQL (Docker):**
- Host: `localhost`
- Port: `5433`
- Database: `mydatabase`
- User: `user`
- Password: `password`

**MongoDB (Docker):**
- Connection String: `mongodb://localhost:27017/mydatabase`
- Port: `27017`

### Hot Reloading

Both frontend and backend support hot reloading:
- **Frontend**: Vite HMR automatically refreshes your browser when you edit files in `frontend/src/`
- **Backend**: Nodemon automatically restarts the server when you edit files in `backend/`

### Available Scripts

**Root level:**
```bash
npm run dev              # Run both frontend and backend
npm run dev:backend      # Run backend only
npm run dev:frontend     # Run frontend only
npm run lint             # Lint all workspaces
npm run lint:fix         # Auto-fix linting issues
npm run format           # Format all files with Prettier
npm run format:check     # Check formatting without changes
```

**Backend:**
```bash
npm run dev --workspace=backend       # Start backend dev server
npm run start --workspace=backend     # Start production backend
npm run lint --workspace=backend      # Lint backend code
npm run db:init --workspace=backend   # Initialize databases
npm run db:seed --workspace=backend   # Seed sample data
npm run db:setup --workspace=backend  # Init + seed
```

**Frontend:**
```bash
npm run dev --workspace=frontend      # Start frontend dev server
npm run build --workspace=frontend    # Build for production
npm run preview --workspace=frontend  # Preview production build
npm run lint --workspace=frontend     # Lint frontend code
```

## 🔍 Code Quality & Pre-commit Hooks

This project uses **Husky** and **lint-staged** to automatically enforce code quality standards before each commit. All tooling is JavaScript-native (no Python required).

### Automatic Checks on Every Commit

When you run `git commit`, the following checks run automatically on your staged files:

- ✅ **Prettier**: Automatically formats all JS/TS/JSON/CSS/MD files
- ✅ **ESLint**: Lints backend JavaScript and frontend TypeScript/React code (with auto-fix)
- ✅ **Secretlint**: Scans for accidentally committed secrets (API keys, credentials, tokens, etc.)

If any check fails, the commit will be blocked until the issues are resolved.

### Initial Setup

Pre-commit hooks are automatically installed when you run `npm install` via Husky's prepare script. No additional setup is required.

### Running Checks Manually

You can run any of these checks manually without committing:

```bash
# Format all files with Prettier
npm run format

# Check formatting without making changes
npm run format:check

# Run ESLint on all workspaces
npm run lint

# Fix ESLint issues automatically
npm run lint:fix

# Run secretlint on all files
npx secretlint "**/*"
```

### Skipping Hooks (Emergency Only)

In rare emergency situations, you can skip pre-commit hooks:

```bash
git commit --no-verify -m "emergency fix"
```

**Important**: Skipping hooks should be extremely rare. All checks also run in CI/CD, so skipped validations will be caught before deployment.

## 📝 Code Style Guidelines

### JavaScript/TypeScript

- Use **single quotes** for strings
- Use **semicolons**
- **2 spaces** for indentation
- **100 characters** max line length
- Use **trailing commas** (ES5 style)
- Use **arrow functions** where appropriate

These rules are enforced automatically by Prettier and ESLint.

### React/TSX

- Use **functional components** with hooks
- Keep components **focused and small**
- Use **TypeScript** for type safety
- Follow **React hooks rules** (enforced by ESLint)

### Backend

- Use **CommonJS** modules (`require`/`module.exports`)
- Handle errors properly with try-catch
- Use environment variables for configuration
- Add JSDoc comments for complex functions

## 🐛 Reporting Issues

If you find a bug or have a feature request:

1. Check if the issue already exists in the Issues tab
2. If not, create a new issue with:
   - Clear, descriptive title
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Screenshots if applicable
   - Your environment (OS, Node version, etc.)

## 🔀 Pull Request Process

1. **Fork the repository** and create a new branch from `main`
2. **Make your changes** following the code style guidelines
3. **Test your changes** thoroughly
4. **Ensure all pre-commit hooks pass** (they'll run automatically)
5. **Update documentation** if needed
6. **Submit a pull request** with:
   - Clear description of changes
   - Reference to related issue (if applicable)
   - Screenshots for UI changes

## 🏗️ Project Structure

```
tom-cruise-running-analysis/
├── backend/              # Node.js + GraphQL API
│   ├── db/              # Database connections
│   │   ├── mongodb.js   # MongoDB connection
│   │   └── postgres.js  # PostgreSQL connection
│   ├── graphql/         # GraphQL API layer
│   │   ├── schema.js    # GraphQL schema definitions
│   │   └── resolvers.js # GraphQL resolvers
│   ├── scripts/         # Database initialization
│   │   ├── initDb.js    # Initialize databases
│   │   └── seedDb.js    # Seed sample data
│   ├── index.js         # Backend entry point
│   ├── package.json     # Backend dependencies
│   └── Dockerfile       # Backend container config
├── frontend/            # React + Vite application
│   ├── src/
│   │   ├── App.tsx      # Main React component
│   │   └── main.tsx     # React entry point
│   ├── public/          # Static assets
│   ├── index.html       # HTML entry point
│   ├── vite.config.ts   # Vite configuration
│   ├── package.json     # Frontend dependencies
│   └── Dockerfile       # Frontend container config
├── .husky/              # Git hooks (Husky)
├── .github/             # GitHub assets
├── docker-compose.yml   # Docker orchestration
├── package.json         # Root workspace config
└── CONTRIBUTING.md      # This file
```

## 📚 Additional Resources

- [GraphQL Documentation](https://graphql.org/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Husky Documentation](https://typicode.github.io/husky/)
- [Prettier Documentation](https://prettier.io/)

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🎬🏃‍♂️
