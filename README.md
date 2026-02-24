# Freelancer App

A full-stack freelancer management platform built with React, Express, and Prisma.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Zustand, React Router, Recharts
- **Backend**: Express.js, Prisma, JWT Authentication
- **AI**: Groq SDK, OpenAI
- **Database**: PostgreSQL (via Prisma)
- **Monorepo**: Turbo

## Project Structure

```
freelancer-app/
├── apps/
│   ├── api/          # Express.js backend
│   └── web/          # React frontend
├── packages/         # Shared packages
└── turbo.json       # Turbo monorepo config
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL

### Installation

```bash
# Install dependencies
pnpm install
```

### Configuration

1. Create `.env` file in `apps/api/`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/freelancer"
JWT_SECRET="your-secret-key"
GROQ_API_KEY="your-groq-api-key"
```

### Development

```bash
# Run all apps in development mode
pnpm dev

# Run only API
pnpm --filter @freelancer/api dev

# Run only Web
pnpm --filter @freelancer/web dev
```

### Build

```bash
# Build all apps
pnpm build
```

## Features

- User authentication (Login/Signup)
- Dashboard with analytics
- Proposal management
- AI-powered analysis
- Templates
- Timezone support
