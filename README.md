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
GROQ_PROJECT_SEARCH_API_KEY="your-groq-project-search-key"
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
# Stable full-stack startup (recommended): frees ports 5000/5001/5173, starts scraper + turbo dev
pnpm dev:full

# Run all apps in development mode
pnpm dev

# Free API/scraper/web dev ports if needed
pnpm dev:kill-ports

# Run only API
pnpm --filter @freelancer/api dev

# Run only Web
pnpm --filter @freelancer/web dev
```

### Ports And API URL Notes

- API app listens on `5000` by default (local): `apps/api/src/index.ts`
- Web defaults to `http://localhost:5000/api/v1` if `VITE_API_URL` is not set: `apps/web/src/lib/api.ts`

### Build

```bash
# Build all apps
pnpm build
```

## Deploy On Render

1. Push your latest code to GitHub.
2. In Render, choose `New +` -> `Blueprint`.
3. Select this repo and deploy using [render.yaml](render.yaml).
4. After the first deploy, verify your API URL:
	- API service URL should be `https://freelancer-api.onrender.com` if that name is available.
	- If Render assigned a different API URL, update `VITE_API_URL` in the `freelancer-web` service env vars to:
	  - `https://<your-api-service>.onrender.com/api/v1`
5. Add required secret keys in the `freelancer-api` service:
	- `GROQ_API_KEY`
	- `GROQ_PROJECT_SEARCH_API_KEY`
	- `OPENAI_API_KEY` (if you use OpenAI features)

Render notes:
- Database is provisioned automatically from the blueprint as `freelancer-db`.
- Prisma generate/build/migrate runs during API build.
- Local development commands are unchanged.

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
- Timezone: frontend page and backend persistence are fully active.
- Quick Templates: backend persistence and routes are fully active.
- Meetings: backend persistence and routes are fully active.

### Partially Wired

- Clients and Project Search pages are routed, but advanced persistence paths require additional Prisma models not included in the base schema.

### Experimental Backend Modules

- Some backend modules are present for future features (for example meetings and quick templates) and may need schema and migration updates before full production use.
