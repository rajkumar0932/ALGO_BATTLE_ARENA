<div align="center">

```
 █████╗ ██╗      ██████╗  ██████╗ ██████╗  █████╗ ████████╗████████╗██╗     ███████╗
██╔══██╗██║     ██╔════╝ ██╔═══██╗██╔══██╗██╔══██╗╚══██╔══╝╚══██╔══╝██║     ██╔════╝
███████║██║     ██║  ███╗██║   ██║██████╔╝███████║   ██║      ██║   ██║     █████╗  
██╔══██║██║     ██║   ██║██║   ██║██╔══██╗██╔══██║   ██║      ██║   ██║     ██╔══╝  
██║  ██║███████╗╚██████╔╝╚██████╔╝██████╔╝██║  ██║   ██║      ██║   ███████╗███████╗
╚═╝  ╚═╝╚══════╝ ╚═════╝  ╚═════╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝      ╚═╝   ╚══════╝╚══════╝
```

**⚔️ Real-time 1v1 Competitive Programming Battles**

[![TypeScript](https://img.shields.io/badge/TypeScript-97%25-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-00e5ff?style=flat-square)](LICENSE)
[![Turborepo](https://img.shields.io/badge/Turborepo-monorepo-EF4444?style=flat-square&logo=turborepo)](https://turbo.build/)
[![pnpm](https://img.shields.io/badge/pnpm-workspace-F69220?style=flat-square&logo=pnpm)](https://pnpm.io/)

*Get matched with an opponent, solve the same algorithm problem, and race to submit the best solution. Climb the ELO leaderboard and prove your skills.*

[**Live Demo**](https://algobattle.vercel.app) · [**Report a Bug**](https://github.com/rajkumar0932/AlgoBattle/issues) · [**Request a Feature**](https://github.com/rajkumar0932/AlgoBattle/issues)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Running Locally](#running-locally)
  - [Docker Setup](#docker-setup)
- [How It Works](#how-it-works)
  - [Ranked 1v1 Matchmaking](#ranked-1v1-matchmaking)
  - [AI Bot System](#ai-bot-system)
  - [Private Rooms](#private-rooms)
  - [ELO Rating System](#elo-rating-system)
  - [Code Judge Engine](#code-judge-engine)
- [Pages & Routes](#pages--routes)
- [Deployment](#deployment)
- [UI & Design System](#ui--design-system)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

AlgoBattle is a **real-time competitive programming platform** where developers go head-to-head in live 1v1 coding battles. Both players receive the same algorithmic challenge and race to submit a correct, efficient solution. The winner earns ELO rating points; the loser loses them. Climb the global leaderboard from **AI Beginner (800 ELO)** all the way to **Grandmaster (2200+ ELO)**.

The platform is built around three core experiences:

| Mode | Description |
|------|-------------|
| **Ranked 1v1** | Skill-based matchmaking against real players. Live WebSocket sync, shared problem, real-time opponent progress. |
| **vs AI Bot** | Practice against LLM-powered bots at 6 difficulty tiers — from Beginner (solves only Easy, makes deliberate mistakes) to Grandmaster (optimal solutions in 1–3 min). |
| **Private Room** | Generate a 6-character room code, share it with a friend, and battle with custom settings. |

---

## Features

### Core Gameplay
- **Live 1v1 Ranked Battles** — Real-time WebSocket matchmaking pairs you with a player of similar ELO. Both see the same problem simultaneously.
- **AI Bot Battles** — Six bot difficulty tiers powered by Groq LLMs. Each tier has human-like solve times, realistic mistake patterns, and appropriate solution quality.
- **Private Rooms** — Generate shareable 6-character room codes for friend battles. No ELO stakes unless opted in.
- **Surrender Mechanism** — Gracefully forfeit a match in progress; ELO adjusts accordingly.

### Problem System
- **Curated Problem Library** — Problems categorized by difficulty (Easy / Medium / Hard), each tested against 25 hidden test cases.
- **Multi-language Support** — Solve in JavaScript (Node.js) with more languages planned.
- **"Today's Featured" Problems** — A daily highlighted problem to drive engagement.
- **Structured Test Harness** — Each problem ships with example inputs, constraints, and a complete specification.

### Ranking & Progression
- **True ELO Rating System** — Win/loss adjusts your ELO based on opponent strength. Beating a stronger player gains more; losing to a weaker player costs more.
- **Global Leaderboard** — Filter by All Time / This Week / Today. Podium display for top 3 players.
- **Personal Dashboard** — Track ELO Rating, Win count, Loss count, Win Rate %, and full match history.
- **Live Battle Feed** — Homepage ticker showing recent match results across the platform in real time.

### Platform
- **Secure Code Execution** — Custom sandboxed judge engine evaluates submitted code against hidden test cases without exposing test data to clients.
- **NextAuth Authentication** — Session-based auth with secure sign-in flow.
- **Real-time Sync** — Socket.io ensures both players see opponent submission status live during a match.
- **Responsive Design** — Works across desktop and tablet viewports.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14 (App Router) | Pages, routing, server components |
| **UI** | React + Tailwind CSS | Component styling |
| **Animation** | Framer Motion | Page transitions, micro-interactions |
| **Real-time** | Socket.io | Live match sync, matchmaking queue |
| **Backend API** | Next.js API Routes | Auth, problem fetch, ELO updates |
| **Socket Server** | Node.js + Socket.io | Dedicated WebSocket server |
| **Database** | PostgreSQL | User accounts, ELO, match history |
| **ORM** | Prisma | Type-safe DB queries, schema migrations |
| **Caching** | Redis | Queue management, session data |
| **AI Integration** | Groq API | LLM-powered AI bot solution generation |
| **Monorepo** | Turborepo | Parallel builds, task orchestration |
| **Package Manager** | pnpm (workspaces) | Efficient dependency management |
| **Language** | TypeScript (97%) | End-to-end type safety |
| **Containerization** | Docker + Docker Compose | Local Postgres + Redis |
| **Deployment** | Vercel (web) + Render/Railway (socket) | Production hosting |
| **Fonts** | Chakra Petch, JetBrains Mono | UI typography, monospace data |

---

## Architecture

AlgoBattle is a **Turborepo monorepo** with clear separation between the web application, real-time server, and shared packages. This structure allows type-safe code sharing across services while keeping each concern independently deployable.

```
┌─────────────────────────────────────────────────────────┐
│                        CLIENT                            │
│              Next.js 14 (App Router)                     │
│    Pages: Landing, Play, Battle, Dashboard,              │
│           Leaderboard, Problems, AI Bot                  │
└──────────────┬──────────────────┬───────────────────────┘
               │  HTTP/REST        │  WebSocket
               ▼                  ▼
┌──────────────────┐   ┌──────────────────────────────────┐
│  Next.js API      │   │      Socket.io Server            │
│  Routes           │   │   (apps/socket-server)           │
│                   │   │                                  │
│  /api/auth        │   │  Events:                         │
│  /api/problems    │   │  - join_queue                    │
│  /api/battle      │   │  - match_found                   │
│  /api/leaderboard │   │  - submit_solution               │
│  /api/user        │   │  - opponent_submitted            │
│  /api/ai-battle   │   │  - battle_end                    │
└────────┬─────────┘   └──────────────┬───────────────────┘
         │                            │
         ▼                            ▼
┌─────────────────────────────────────────────────────────┐
│                    packages/db                           │
│            Prisma ORM  ←→  PostgreSQL                   │
│                                                          │
│   Models: User, Battle, Problem, Submission, EloHistory │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────┐    ┌─────────────────────────────┐
│   packages/judge    │    │      External Services       │
│                     │    │                              │
│  Sandboxed code     │    │  Groq API → AI Bot logic     │
│  execution engine   │    │  Redis   → Queue management  │
│  Test case runner   │    │                              │
└─────────────────────┘    └─────────────────────────────┘
```

### Key Architectural Decisions

**Why Turborepo?** The web app, socket server, and judge package share TypeScript types. Turborepo's remote caching means shared packages are only rebuilt when they change, cutting CI times significantly.

**Why a separate Socket server?** Vercel's serverless functions don't support persistent WebSocket connections. The socket server runs as a separate long-lived Node.js process on Render/Railway, with the Next.js app communicating to it via `NEXT_PUBLIC_SOCKET_URL`.

**Why Redis?** The matchmaking queue needs fast in-memory reads and writes. Redis also handles temporary session state during active battles that doesn't need to be persisted to PostgreSQL until a match ends.

**Why Groq for AI bots?** Groq's inference speed is critical for simulating realistic "human-like" solve times. Lower-tier bots deliberately delay responses to simulate a beginner thinking; Groq's speed gives headroom to artificially slow down while still responding quickly for Grandmaster-tier bots.

---

## Project Structure

```
algobattle/
│
├── apps/
│   ├── web/                          # Next.js 14 App Router
│   │   ├── app/
│   │   │   ├── (auth)/               # Sign-in / sign-up routes
│   │   │   ├── battle/               # Active battle arena (/battle)
│   │   │   ├── dashboard/            # Personal stats dashboard
│   │   │   ├── leaderboard/          # Global ELO leaderboard
│   │   │   ├── play/                 # Battle mode selection
│   │   │   ├── play/ai-bot/          # AI difficulty selection
│   │   │   ├── problems/             # Problem library
│   │   │   ├── api/                  # Next.js API routes
│   │   │   ├── layout.tsx            # Root layout + font loading
│   │   │   └── page.tsx              # Landing page
│   │   ├── components/               # Reusable React components
│   │   ├── lib/                      # Auth config, helpers, hooks
│   │   ├── public/                   # Static assets
│   │   └── package.json
│   │
│   └── socket-server/                # Dedicated Socket.io server
│       ├── src/
│       │   ├── index.ts              # Server entry point
│       │   ├── matchmaking.ts        # Queue logic, ELO-based pairing
│       │   ├── battle.ts             # Room management, state sync
│       │   └── events.ts             # Socket event handlers
│       └── package.json
│
├── packages/
│   ├── db/                           # Database layer
│   │   ├── prisma/
│   │   │   ├── schema.prisma         # Data models
│   │   │   └── seed.ts               # Problem seeder
│   │   ├── src/
│   │   │   └── index.ts              # Prisma client export
│   │   └── package.json
│   │
│   ├── judge/                        # Code evaluation engine
│   │   ├── src/
│   │   │   ├── runner.ts             # Sandboxed execution
│   │   │   ├── evaluator.ts          # Test case comparison
│   │   │   └── languages/            # Language-specific runners
│   │   └── package.json
│   │
│   └── types/                        # Shared TypeScript definitions
│       ├── src/
│       │   ├── battle.ts             # Battle state types
│       │   ├── user.ts               # User/ELO types
│       │   └── problem.ts            # Problem schema types
│       └── package.json
│
├── docker-compose.yml                # PostgreSQL + Redis for local dev
├── turbo.json                        # Turborepo pipeline config
├── pnpm-workspace.yaml               # Workspace declaration
├── package.json                      # Root scripts
└── tsconfig.json                     # Base TypeScript config
```

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

| Tool | Version | Notes |
|------|---------|-------|
| [Node.js](https://nodejs.org/) | v18+ | LTS recommended |
| [pnpm](https://pnpm.io/installation) | v8+ | `npm install -g pnpm` |
| [PostgreSQL](https://www.postgresql.org/) | v14+ | Or use Docker (recommended) |
| [Redis](https://redis.io/) | v7+ | Or use Docker (recommended) |
| [Docker](https://www.docker.com/) | Any | Optional but easiest for DB setup |

You'll also need API keys:

| Service | Required | Where to get it |
|---------|----------|-----------------|
| [Groq](https://console.groq.com/) | Yes (for AI Bot) | Free tier available |
| NextAuth Secret | Yes | Any random string |

---

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/rajkumar0932/AlgoBattle.git
cd AlgoBattle
```

**2. Install all dependencies**

pnpm workspaces installs dependencies for all apps and packages in one command:

```bash
pnpm install
```

---

### Environment Variables

Create a `.env` file at the **root** of the project (and optionally in `apps/web/` for app-specific overrides). Copy the template below and fill in your values:

```bash
# ─── Database ──────────────────────────────────────────────────────────────────
# PostgreSQL connection string
# If using Docker (recommended): use the values from docker-compose.yml
DATABASE_URL="postgresql://algobattle:algobattle_secret@localhost:5433/algobattle"

# ─── Authentication (NextAuth.js) ───────────────────────────────────────────────
# Generate a secret: run `openssl rand -base64 32` in your terminal
NEXTAUTH_SECRET="your-random-secret-at-least-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# ─── AI Bot (Groq) ──────────────────────────────────────────────────────────────
# Get your key at https://console.groq.com
# Required for vs AI Bot game mode
GROQ_API_KEY="gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# ─── Socket Server ──────────────────────────────────────────────────────────────
# URL where the socket server runs (used by the Next.js client)
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"

# ─── Redis ──────────────────────────────────────────────────────────────────────
# Used for matchmaking queue and battle session state
REDIS_URL="redis://localhost:6379"
```

> **Security note:** Never commit `.env` files. They are already listed in `.gitignore`. For production, set these as environment variables in your hosting provider's dashboard.

---

### Database Setup

**Option A — Docker (recommended for local dev)**

The `docker-compose.yml` spins up both PostgreSQL and Redis with zero configuration:

```bash
docker compose up -d
```

This starts:
- **PostgreSQL** on port `5433` (not 5432, to avoid conflicts with local installs)
  - User: `algobattle`
  - Password: `algobattle_secret`
  - Database: `algobattle`
- **Redis** on port `6379` with append-only persistence enabled

**Option B — Local PostgreSQL**

If you have PostgreSQL installed locally, create a database manually:

```bash
psql -U postgres
CREATE DATABASE algobattle;
CREATE USER algobattle WITH PASSWORD 'algobattle_secret';
GRANT ALL PRIVILEGES ON DATABASE algobattle TO algobattle;
\q
```

Then update `DATABASE_URL` in `.env` to point to port `5432`.

**Push the Prisma schema**

Once your database is running, push the schema and seed the problem library:

```bash
# Navigate to the db package
cd packages/db

# Push schema to database (creates all tables)
npx prisma db push

# Seed the database with algorithmic problems
npx prisma db seed

# Return to project root
cd ../..
```

**Inspect the database (optional)**

```bash
cd packages/db
npx prisma studio
# Opens a visual browser-based DB explorer at http://localhost:5555
```

---

### Running Locally

From the project root, Turborepo starts all services in parallel:

```bash
pnpm dev
```

This runs:

| Service | URL | Description |
|---------|-----|-------------|
| Web App | `http://localhost:3000` | Next.js frontend + API routes |
| Socket Server | `http://localhost:3001` | Real-time WebSocket server |

> **Tip:** The first run may take 30–60 seconds as Turborepo builds shared packages. Subsequent starts are much faster thanks to caching.

To run a specific app only:

```bash
# Web app only
pnpm --filter web dev

# Socket server only
pnpm --filter socket-server dev
```

---

### Docker Setup

The `docker-compose.yml` manages infrastructure services (database and cache). The application itself runs outside Docker during development for faster hot-reload.

```yaml
# docker-compose.yml overview
services:
  postgres:
    image: postgres:16-alpine
    ports: ["5433:5432"]
    environment:
      POSTGRES_USER: algobattle
      POSTGRES_PASSWORD: algobattle_secret
      POSTGRES_DB: algobattle
    volumes:
      - pgdata:/var/lib/postgresql/data   # persistent across restarts

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    command: redis-server --appendonly yes
    volumes:
      - redisdata:/data                   # persistent across restarts
```

```bash
# Start infrastructure
docker compose up -d

# Stop infrastructure
docker compose down

# Stop and wipe all data (fresh start)
docker compose down -v

# View logs
docker compose logs -f postgres
docker compose logs -f redis
```

---

## How It Works

### Ranked 1v1 Matchmaking

1. Player clicks **"Enter Queue"** on the Play page.
2. Their client emits a `join_queue` Socket.io event with their ELO rating.
3. The socket server's matchmaking module finds the closest ELO opponent currently in queue (within a ±200 ELO window that expands over time if no match is found).
4. When two players are matched, the server emits `match_found` to both clients with a shared room ID and a randomly selected problem appropriate to their combined ELO range.
5. Both clients redirect to `/battle?room=<roomId>`. The battle timer starts simultaneously.
6. When a player submits, the `packages/judge` engine runs their code against all 25 hidden test cases in a sandboxed process.
7. The server emits `opponent_submitted` to the other player (without revealing the opponent's code).
8. When the battle ends (first correct solution, or timer expires), the server calculates ELO delta, updates both users' ratings in PostgreSQL, and emits `battle_end` with results.

### AI Bot System

The AI bot system is powered by the **Groq API** and simulates human-like behavior:

| Tier | ELO | Behavior |
|------|-----|----------|
| Beginner | 800 | Only solves Easy. Makes 2–3 wrong submissions first. Takes 15–25 min. |
| Rookie | 1000 | Solves Easy fast, Medium slow. Takes 12–20 min. |
| Intermediate | 1200 | Solves Easy/Medium. Takes 8–15 min. One wrong attempt. |
| Advanced | 1500 | Solves Easy/Medium/Hard in 5–10 min. Clean solution. |
| Expert | 1800 | Solves all problems in 3–6 min. Optimal solution. |
| Grandmaster | 2200 | Solves all problems instantly (1–3 min). Always beats you. |

Each bot tier sends a carefully crafted prompt to Groq specifying: the problem, the desired solution quality, and explicit instructions to simulate wrong attempts and timing delays. The bot's submission is inserted into the battle as if it were a real player.

### Private Rooms

1. Host clicks **"Create Room"** — the server generates a unique 6-character alphanumeric code and a room in Redis.
2. Host shares the code. Guest enters it in the **"ENTER 6-CHAR CODE"** field.
3. Both players are joined to the same Socket.io room and a battle begins when both are ready.
4. Private room battles can optionally count toward ELO (toggled at room creation).

### ELO Rating System

AlgoBattle uses the standard **FIDE ELO formula**:

```
Expected Score:  Ea = 1 / (1 + 10^((Rb - Ra) / 400))
New Rating:      Ra' = Ra + K × (Score - Ea)
```

Where:
- `K = 32` for players below 2100 ELO
- `K = 24` for players 2100–2399
- `K = 16` for players 2400+
- `Score = 1` for a win, `0` for a loss

This means beating a 1800 ELO player as a 1200 ELO player gains substantially more points than beating a 1200 ELO player as a 1200 ELO player. The system is designed to reward upsets.

### Code Judge Engine

The `packages/judge` engine:

1. Receives submitted source code + language + problem ID.
2. Spawns an isolated child process with strict resource limits (memory cap, CPU timeout).
3. Runs the code against each of the 25 hidden test cases via stdin/stdout (matching the `readline()` / `console.log()` pattern visible in the editor template).
4. Compares output to expected answers (with whitespace normalization).
5. Returns: pass/fail per test case, total passed count, execution time, and first failing case (without revealing the expected output).

---

## Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Hero section, feature highlights, live battle feed ticker |
| `/play` | Battle Mode Select | Choose Ranked / AI Bot / Private Room |
| `/play/ai-bot` | AI Difficulty | Select bot tier (Beginner → Grandmaster) |
| `/battle` | Battle Arena | Live coding editor, problem statement, timer, opponent status |
| `/dashboard` | Personal Dashboard | ELO stats, recent battles, quick action links |
| `/leaderboard` | Global Leaderboard | Top players by ELO, filterable by time range |
| `/problems` | Problem Library | Searchable/filterable problem list with difficulty tags |
| `/api/auth/[...nextauth]` | Auth | NextAuth.js authentication handler |
| `/api/battle/*` | Battle API | Create room, submit solution, fetch result |
| `/api/user/*` | User API | Profile, ELO history, match history |
| `/api/leaderboard` | Leaderboard API | Ranked user list |

---

## Deployment

### Web App → Vercel

Vercel is the recommended host for the Next.js app.

1. Push your fork to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the `AlgoBattle` repo.
3. Configure the project:

| Setting | Value |
|---------|-------|
| Framework Preset | Next.js |
| Root Directory | `apps/web` |
| Build Command | `pnpm build` |
| Install Command | `pnpm install` |
| Output Directory | `.next` |

4. Add all environment variables from your `.env` under **Settings → Environment Variables**.
5. Click **Deploy**.

### Socket Server → Render / Railway / Fly.io

The socket server needs a persistent process (not serverless). Deploy it to any platform that supports long-lived Node.js processes.

**Render example:**
1. Create a new **Web Service** on Render.
2. Connect the `AlgoBattle` GitHub repo.
3. Set:
   - Root Directory: `apps/socket-server`
   - Build Command: `pnpm install && pnpm build`
   - Start Command: `node dist/index.js`
4. Add environment variables (at minimum: `REDIS_URL`, `DATABASE_URL`).
5. After deploy, copy the Render service URL (e.g. `https://algobattle-socket.onrender.com`).
6. Add that URL as `NEXT_PUBLIC_SOCKET_URL` in your Vercel environment variables and redeploy the web app.

### Database → Neon / Supabase

For production PostgreSQL, use a managed provider:

- **[Neon](https://neon.tech)** — Serverless Postgres, generous free tier, connection pooling built-in.
- **[Supabase](https://supabase.com)** — Postgres + auth + storage bundle.

Set the `DATABASE_URL` to the connection string provided by your chosen service. Remember to run `prisma db push` against the production database on first deploy.

### Redis → Upstash

**[Upstash](https://upstash.com)** offers serverless Redis with a free tier. Create a database, copy the `REDIS_URL`, and set it in both Vercel and Render environment variables.

---

## UI & Design System

AlgoBattle uses a cohesive **Dark Sci-Fi** design language across all pages. Design decisions prioritize **zero-JS animation cost** — all visual effects use pure CSS.

### Color Palette

```css
:root {
  --color-bg:       #0a0f1e;  /* Deep navy base */
  --color-accent:   #00e5ff;  /* Cyan — primary interactive/glow */
  --color-gold:     #fbbf24;  /* Amber — leaderboard/prestige */
  --color-green:    #4ade80;  /* Win / Easy difficulty */
  --color-orange:   #f97316;  /* Medium difficulty / ELO stat */
  --color-red:      #f43f5e;  /* Loss / Hard difficulty / Grandmaster */
  --color-purple:   #a855f7;  /* AI Bot / Win Rate stat */
  --color-surface:  rgba(255,255,255,0.025); /* Card backgrounds */
}
```

### Typography

| Font | Usage | Load |
|------|-------|------|
| `Chakra Petch` (400, 600, 700) | Headings, tier labels, nav, badges | Google Fonts |
| `JetBrains Mono` (400, 700) | Code editor, ELO numbers, monospace data, table headers | Google Fonts |

Single `<link>` tag:
```html
<link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
```

### Page-specific Backgrounds (CSS-only, zero JS)

| Page | Background Effect | Implementation |
|------|-------------------|----------------|
| Landing | Animated particle network | Canvas (landing only) |
| Play | Diagonal scanlines | `repeating-linear-gradient` pseudo-element |
| AI Bot | Hexagonal grid | Inline SVG `<pattern>` |
| Dashboard | Dot grid | CSS `radial-gradient` background |
| Problem Library | Clean — table provides structure | None |
| Leaderboard | Radial golden spotlight from top | `radial-gradient` |

### Performance Rules

All glow effects use CSS `box-shadow` and `text-shadow` — compositor-layer only, no layout cost. No `backdrop-filter` (GPU-expensive). No canvas on inner pages. Animations via `@keyframes` only.

---

## Contributing

Contributions are very welcome! Here's how to get started:

1. **Fork** the repository and clone your fork.
2. Create a new branch: `git checkout -b feat/your-feature-name`
3. Make your changes. Keep commits focused and descriptive.
4. Run the type-checker: `pnpm typecheck`
5. Run the linter: `pnpm lint`
6. Push to your fork and open a **Pull Request** against `main`.

### Contribution Ideas

- New problems added to the problem library
- Additional language support in the judge engine (Python, Java, C++)
- Spectator mode for watching live battles
- Post-match solution comparison / code diff view
- Achievements and badge system
- Time-based rating decay for inactive accounts
- Mobile-responsive battle editor

### Code Style

- TypeScript strict mode throughout — no `any` without justification.
- Prisma models for all database interactions — no raw SQL.
- Socket events follow the pattern: `noun_verb` (e.g. `battle_start`, `match_found`).
- CSS-only animations preferred over JS wherever feasible.

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built by [rajkumar0932](https://github.com/rajkumar0932)

⚔️ *Code. Battle. Conquer.*

</div>
