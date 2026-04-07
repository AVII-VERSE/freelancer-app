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

2. Create `.env` file in `apps/web/` for local development:

```env
VITE_API_URL="http://localhost:5000/api/v1"
```

3. Generate Prisma client and run migrations:

```bash
# Generate Prisma client
pnpm --filter @freelancer/api exec prisma generate

# Apply existing migrations
pnpm --filter @freelancer/api exec prisma migrate deploy

# For local schema changes (development)
# pnpm --filter @freelancer/api exec prisma migrate dev
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

### Ports And API URL Notes

- API app listens on `5000` by default (local): `apps/api/src/index.ts`
- Web defaults to `http://localhost:5001/api/v1` if `VITE_API_URL` is not set: `apps/web/src/lib/api.ts`
- Docker maps API container `5000` to host `5001`: `docker-compose.yml`

This means:

- Docker setup works out-of-the-box with `5001`.
- Local non-Docker setup should set `VITE_API_URL=http://localhost:5000/api/v1`.

### Build

```bash
# Build all apps
pnpm build
```

## Features

- User authentication (Login/Signup)
- Dashboard with analytics
- Project records
- Proposal management
- AI-powered analysis
- Templates
- Profile management
- Timezone support (frontend world clock and local alert UI)

## Current Status

### Fully Wired

- Auth: login/signup/me
- Profile: profile + profile completion
- Templates: create/list/delete/duplicate
- Proposals: create/list/status/delete/clone
- AI: analyze + generate proposal
- Records/Analytics: project records + dashboard analytics

### Partially Wired

- Timezone: frontend page is active; backend timezone persistence is not mounted.
- Clients and Project Search pages are routed, but advanced persistence paths require additional Prisma models not included in the base schema.

### Experimental Backend Modules

- Some backend modules are present for future features (for example meetings and quick templates) and may need schema and migration updates before full production use.
