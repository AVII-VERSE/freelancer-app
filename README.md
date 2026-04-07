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

## Deploy On Vercel

Deploy as two Vercel projects from the same repository:

1. API project
	- Create a new Vercel project from this repo.
	- Set Root Directory to `apps/api`.
	- Framework preset: `Other`.
	- Add env vars:
	  - `DATABASE_URL`
	  - `JWT_SECRET`
	  - `GROQ_API_KEY`
	  - `GROQ_PROJECT_SEARCH_API_KEY`
	  - `OPENAI_API_KEY` (if used)
	  - `CORS_ORIGIN` (set to your web app domain, e.g. `https://your-web.vercel.app`)
	- Deploy.

2. Web project
	- Create another Vercel project from this repo.
	- Set Root Directory to `apps/web`.
	- Framework preset: `Vite`.
	- Add env var:
	  - `VITE_API_URL=https://<your-api-project>.vercel.app/api/v1`
	- Deploy.

Notes:
- [apps/api/vercel.json](apps/api/vercel.json) routes all API paths through the serverless function.
- [apps/web/vercel.json](apps/web/vercel.json) enables SPA route rewrites.
- Local development commands are unchanged.

## Deploy Web On Netlify

Netlify is a good fit for the frontend app in [apps/web](apps/web).

1. Create a new Netlify site from this GitHub repository.
2. Keep base directory as repo root.
3. Netlify will use [netlify.toml](netlify.toml) automatically:
	- Install and build with pnpm workspace support
	- Publish from `apps/web/dist`
	- Apply SPA redirects for React Router
4. In Netlify site environment variables, set:
	- `VITE_API_URL=https://<your-api-domain>/api/v1`
5. Trigger deploy.

Important:
- Your Express + Prisma API should be hosted separately (for example Vercel/Railway/Render/Fly).
- Netlify in this setup deploys the web app only.

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
