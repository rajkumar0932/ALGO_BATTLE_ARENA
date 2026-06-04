# ⚔️ AlgoBattle

![AlgoBattle Hero](https://via.placeholder.com/1200x600/0a0f1e/00e5ff?text=AlgoBattle+|+Competitive+Programming+Arena)

AlgoBattle is a real-time, high-octane competitive programming platform. Step into the arena, climb the global ELO ladder, and test your algorithmic skills in live 1v1 coding battles or against AI opponents.

Built with a striking dark sci-fi aesthetic, AlgoBattle is engineered for speed, real-time multiplayer synchronization, and secure code evaluation.

## ✨ Features

- **Live 1v1 Ranked Battles:** Instantly match with players of similar skill levels via WebSockets and race to solve algorithmic challenges.
- **AI Bot Battles:** Practice against intelligent AI bots powered by advanced LLMs (Groq). Challenge bots across different difficulty tiers (Bronze, Gold, Grandmaster).
- **Private Rooms:** Generate a private room code and invite friends for custom 1v1 showdowns.
- **Global Leaderboard:** Climb the ranks! The platform uses a true ELO rating system to track performance across all matches.
- **Secure Code Execution:** Custom judge engine to securely execute, test, and score untrusted code against hidden test cases.
- **Premium Dark Sci-Fi UI:** A stunning, lightweight, pure-CSS driven interface featuring glassmorphism, neon glows, and custom typography (`Chakra Petch` and `JetBrains Mono`).

---

## 🏗️ Architecture

AlgoBattle is structured as a **Turborepo** monorepo using **pnpm**, allowing for seamless code sharing between the frontend, backend, and microservices.

```text
algobattle/
├── apps/
│   ├── web/                # Next.js 14 App Router (Frontend & API)
│   └── socket-server/      # Node.js/Socket.io server (Real-time multiplayer)
├── packages/
│   ├── db/                 # Prisma ORM & PostgreSQL schema
│   ├── judge/              # Code evaluation & sandboxing engine
│   └── types/              # Shared TypeScript definitions
└── turbo.json
```

### Tech Stack
- **Frontend:** Next.js 14, React, Tailwind CSS, Framer Motion
- **Backend:** Node.js, Next.js API Routes, Socket.io
- **Database:** PostgreSQL, Prisma ORM
- **AI Integration:** Groq API (for AI Bot logic)
- **Tooling:** Turborepo, pnpm, TypeScript

---

## 🚀 Getting Started

Follow these steps to set up AlgoBattle locally on your machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/) (v8+)
- [PostgreSQL](https://www.postgresql.org/) (Local or hosted via Supabase/Neon)
- A [Groq API Key](https://console.groq.com/) (required for the AI Bot feature)

### 1. Clone the repository
```bash
git clone https://github.com/rajkumar0932/AlgoBattle.git
cd AlgoBattle
```

### 2. Install dependencies
```bash
pnpm install
```

### 3. Environment Variables
Create a `.env` file in the root directory (or inside `apps/web` and `packages/db`) and add the following keys:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/algobattle"

# NextAuth / Authentication
NEXTAUTH_SECRET="your-super-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# AI Bot Integration (Groq)
GROQ_API_KEY="gsk_your_groq_api_key_here"

# Socket Server Configuration
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
```

### 4. Database Setup
Push the Prisma schema to your database and seed it with initial algorithmic problems:
```bash
# Push schema to database
cd packages/db
npx prisma db push

# Seed the database with problems
npx prisma db seed
cd ../../
```

### 5. Run the Development Servers
Use Turborepo to spin up both the Next.js web app and the Socket server simultaneously:
```bash
pnpm dev
```
- The **Web App** will run on `http://localhost:3000`
- The **Socket Server** will run on `http://localhost:3001`

---

## ☁️ Deployment

AlgoBattle is optimized for deployment on **Vercel**.

1. Push your code to GitHub.
2. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New Project**.
3. Import the `AlgoBattle` repository.
4. **Important Configurations:**
   - Framework Preset: `Next.js`
   - Root Directory: `apps/web`
   - Build Command: `pnpm build`
   - Install Command: `pnpm install`
5. Add your Environment Variables (`DATABASE_URL`, `NEXTAUTH_SECRET`, `GROQ_API_KEY`, etc.).
6. Click **Deploy**.

*(Note: You will also need to deploy the `apps/socket-server` separately to a platform that supports persistent WebSockets, such as Render, Railway, or Fly.io, and update your `NEXT_PUBLIC_SOCKET_URL` accordingly).*

---

## 🎨 UI & Design Principles
The platform follows a strict "Dark Sci-Fi" design language:
- **Base Background:** `#0a0f1e` (Deep Navy)
- **Primary Accent:** `#00e5ff` (Cyan)
- **Typography:** `Chakra Petch` (Headings & UI) and `JetBrains Mono` (Code & Data)
- **Effects:** Heavy reliance on pure CSS `box-shadow`, `drop-shadow`, and lightweight `@keyframes` over heavy JS canvas animations for maximum performance.

---

## 📝 License
This project is licensed under the MIT License.
