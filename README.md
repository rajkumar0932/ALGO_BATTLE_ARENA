# AlgoBattle Arena (Backend)

AlgoBattle Arena is a real-time, 1v1 competitive coding platform where developers battle head-to-head to solve algorithmic challenges. The platform features instantaneous matchmaking, sandboxed code execution, and an ELO-based ranking system.

This repository structure is part of a Turborepo monorepo (pnpm workspaces). 
- `/backend` — Node.js + Express + Socket.IO server (TypeScript)
- `/packages/types` — Shared TypeScript types between backend and frontend
- `/frontend` — Next.js client application

*Note: This documentation covers the **Backend** architecture and systems exclusively.*

## 🏗️ Architecture

```mermaid
flowchart TD
    Client1[Player 1] <-->|Socket.IO| Gateway(API / Socket Gateway)
    Client2[Player 2] <-->|Socket.IO| Gateway
    
    Gateway -->|Enqueue| RedisQueue[(Redis Matchmaking Queue)]
    RedisQueue -->|Match Found| PubSub((Redis Pub/Sub))
    PubSub -->|Emit Room| Gateway
    
    Client1 -->|Submit Code| Gateway
    Gateway -->|Publish Job| BullMQ[(BullMQ Judge Pipeline)]
    
    BullMQ -->|Evaluate| Piston[Piston Execution Engine]
    Piston -->|Result| BullMQ
    
    BullMQ -->|Battle End| ELO[ELO Service]
    ELO -->|SELECT FOR UPDATE| Postgres[(PostgreSQL DB)]
```

## 🛠️ Tech Stack

| Component | Technology | Purpose |
| --- | --- | --- |
| **Runtime** | Node.js + TypeScript | Strongly-typed, scalable server environment |
| **Framework** | Express | REST API and HTTP server |
| **Real-time** | Socket.IO | Stateful bi-directional communication |
| **Database** | PostgreSQL + Prisma ORM | Persistent storage for users, problems, matches |
| **Cache & Pub/Sub** | Redis | High-speed matchmaking queue and distributed events |
| **Job Queue** | BullMQ | Reliable, asynchronous code execution pipeline |
| **Code Execution**| Piston API | Secure, sandboxed multi-language execution |
| **Authentication**| JWT + bcrypt | Secure, httpOnly revocable refresh token rotation |

## 🔌 Socket.IO Event Contract

| Event | Direction | Payload | Description |
| --- | --- | --- | --- |
| `join_queue` | Client → Server | `{ userId, rating }` | Adds user to Redis matchmaking queue |
| `match_found` | Server → Client | `{ roomId, opponent, problem }`| Emitted when two players are matched |
| `submit_code` | Client → Server | `{ roomId, code, language }`| Sends code to BullMQ pipeline |
| `judge_result` | Server → Client | `{ verdict, executionTime }`| Streams execution results back to client |
| `match_end` | Server → Client | `{ winnerId, newRating }` | Broadcasts final match result and rating changes |

## 🗄️ Database Schema

Powered by PostgreSQL and Prisma ORM:
- **Users:** `id`, `username`, `email`, `passwordHash`, `userrating`, `record`, `createdAt`
- **Problems:** `id`, `title`, `description`, `difficulty`, `test_cases`, `starter_code`
- **Matches:** `id`, `player1Id`, `player2Id`, `winnerId`, `problemId`, `duration`, `status`
- **Bots:** `id`, `name`, `difficulty`, `rating`

## 🔐 Authentication Flow

Secure authentication using strict JWT rotation:
1. **Login:** Verifies bcrypt-hashed password and generates short-lived `access_token` and long-lived `refresh_token`.
2. **Delivery:** `refresh_token` is sent as a secure, `httpOnly` cookie. `access_token` is returned in JSON.
3. **Rotation:** When `access_token` expires, the client sends the `refresh_token`. If valid, a new access/refresh pair is generated, invalidating the old refresh token to prevent reuse attacks.

## 📈 ELO Rating System

Ratings use a standard ELO formula to adjust player ranks dynamically after a match. 
To prevent race conditions during concurrent match conclusions, updates use **`SELECT ... FOR UPDATE`** transaction locks in PostgreSQL, guaranteeing that rapid, parallel rating calculations never corrupt a user's score.

## 🚀 Local Setup

**1. Install dependencies**
```bash
pnpm install
```

**2. Start backing services (PostgreSQL & Redis)**
```bash
docker-compose up -d
```

**3. Set Environment Variables**
Configure your `.env` file in `/backend`:
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/algobattle"
REDIS_URL="redis://localhost:6379"
PISTON_URL="http://localhost:2000"
JWT_SECRET="your_jwt_secret"
REFRESH_TOKEN_SECRET="your_refresh_secret"
PORT=4000
```

**4. Run Database Migrations**
```bash
pnpm db:push
```

**5. Start the Development Server**
```bash
pnpm --filter backend dev
```

## 📁 Folder Structure

```text
/backend/src
├── config/         # Redis, Express, Socket configurations
├── controllers/    # Route handlers for REST endpoints
├── middleware/     # Auth and error-handling middleware
├── routes/         # Express router definitions
├── services/       # Core logic (Auth, ELO, Piston API)
├── socket/         # Socket.IO handlers and Matchmaking Logic
├── types/          # Backend-specific interfaces
└── app.ts          # Server entry point
```
