# Risk Calculator

A full-stack risk calculator application built with Nest.js and React, featuring both qualitative and quantitative risk assessment methods.

## Architecture

This is a monorepo using pnpm workspaces with the following structure:

- `apps/api` - Nest.js backend with Fastify adapter
- `apps/web` - React frontend with Vite
- `packages/shared` - Shared TypeScript types, Zod schemas, and utility functions

## Features

### Risk Assessment Methods

1. **Qualitative Risk Assessment**

   - Input: Asset name, threat description, likelihood (1-5), impact (1-5)
   - Optional controls: Control effectiveness, detection capability
   - Output: Inherent and residual severity scores with risk bands

2. **Quantitative Risk Assessment**
   - Input: Asset value, exposure factor, annualized rate of occurrence
   - Optional: Control costs and effectiveness
   - Output: SLE, ALE (inherent/residual), Net risk calculations

### Frontend Features

- Dashboard with risk summary and latest entries
- Interactive forms for both risk assessment types
- 5x5 risk heatmap visualization
- Risk management table with filtering and sorting
- Scenario simulation for quantitative risks

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Installation

1. Install pnpm globally (if not already installed):

```bash
npm install -g pnpm
```

2. Install dependencies:

```bash
pnpm install
```

3. Run the setup script:

```bash
# On Windows (PowerShell)
.\setup.ps1

# On Unix/Linux/macOS
./setup.sh
```

Or manually:

```bash
# Build shared package
pnpm -C packages/shared build

# Create data directory
mkdir -p apps/api/data

# Create environment files (see .env.example files in each app)
```

### Development

Start both backend and frontend in development mode:

```bash
pnpm dev
```

This will start:

- API server on http://localhost:3001
- Web application on http://localhost:5173

### Building

Build all applications:

```bash
pnpm build
```

### Testing

Run all tests:

```bash
pnpm test
```

## Environment Variables

### API (.env in apps/api)

```
PORT=3001
PERSIST_PATH=./data/risks.json
CORS_ORIGIN=http://localhost:5173
```

### Web (.env in apps/web)

```
VITE_API_BASE=http://localhost:3001/api
```

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/risks` - List risks with filtering and pagination
- `POST /api/risks/qualitative` - Create qualitative risk assessment
- `POST /api/risks/quantitative` - Create quantitative risk assessment
- `GET /api/risks/:id` - Get risk by ID
- `DELETE /api/risks/:id` - Delete risk
- `POST /api/simulate/quantitative` - Run quantitative risk scenarios

## Risk Bands

- **Low**: 1-5
- **Moderate**: 6-10
- **High**: 11-15
- **Extreme**: 16-25

## Tech Stack

- **Backend**: Nest.js, Fastify, TypeScript, Zod
- **Frontend**: React, Vite, TypeScript, Tailwind CSS, React Query, Recharts
- **Shared**: TypeScript, Zod schemas, utility functions
- **Testing**: Vitest, Jest
- **Code Quality**: ESLint, Prettier
- **Package Manager**: pnpm workspaces

## Project Structure

```
risk-calculator/
├── apps/
│   ├── api/                 # Nest.js backend
│   │   ├── src/
│   │   │   ├── health/      # Health check endpoints
│   │   │   ├── risks/       # Risk management endpoints
│   │   │   └── main.ts      # Application entry point
│   │   └── package.json
│   └── web/                 # React frontend
│       ├── src/
│       │   ├── components/  # Reusable UI components
│       │   ├── pages/       # Application pages
│       │   ├── lib/         # API client and utilities
│       │   └── main.tsx     # Application entry point
│       └── package.json
├── packages/
│   └── shared/              # Shared types and utilities
│       ├── src/
│       │   ├── types.ts     # TypeScript type definitions
│       │   ├── schemas.ts   # Zod validation schemas
│       │   ├── risk-calculator.ts  # Risk calculation functions
│       │   └── constants.ts # Application constants
│       └── package.json
├── package.json             # Root package.json with workspaces
├── pnpm-workspace.yaml      # pnpm workspace configuration
└── README.md
```

## Features Implemented

✅ **Qualitative Risk Assessment**

- Likelihood and impact scoring (1-5 scale)
- Control effectiveness and detection capability factors
- Inherent vs residual risk calculations
- Risk band classification (Low, Moderate, High, Extreme)

✅ **Quantitative Risk Assessment**

- Asset value, exposure factor, and ARO inputs
- SLE and ALE calculations
- Control cost and effectiveness modeling
- Net risk calculations

✅ **Risk Heatmap**

- 5x5 grid visualization
- Color-coded risk levels
- Inherent and residual risk highlighting

✅ **Dashboard**

- Risk statistics and summaries
- Recent risk assessments table
- Risk distribution by bands

✅ **Risk Management**

- Full CRUD operations for risk assessments
- Filtering and sorting capabilities
- Pagination support
- Risk details modal

✅ **Scenario Simulation**

- Quantitative risk scenario modeling
- Control effectiveness vs ALE visualization
- Interactive charts with Recharts

✅ **Data Persistence**

- In-memory storage with JSON file backup
- Automatic data persistence
- Seed data for development

✅ **Testing**

- Unit tests for risk calculation functions
- API endpoint tests
- Frontend component tests

## API Endpoints

| Method | Endpoint                     | Description                          |
| ------ | ---------------------------- | ------------------------------------ |
| GET    | `/api/health`                | Health check                         |
| GET    | `/api/risks`                 | List risks with filtering/pagination |
| GET    | `/api/risks/stats`           | Get risk statistics                  |
| GET    | `/api/risks/:id`             | Get risk by ID                       |
| POST   | `/api/risks/qualitative`     | Create qualitative risk              |
| POST   | `/api/risks/quantitative`    | Create quantitative risk             |
| DELETE | `/api/risks/:id`             | Delete risk                          |
| POST   | `/api/simulate/quantitative` | Run quantitative simulation          |
