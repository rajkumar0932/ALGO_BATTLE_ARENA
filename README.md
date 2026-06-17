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
[![React](https://img.shields.io/badge/React-Vite-black?style=flat-square&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=nodedotjs)](https://nodejs.org/)
[![Turborepo](https://img.shields.io/badge/Turborepo-monorepo-EF4444?style=flat-square&logo=turborepo)](https://turbo.build/)
[![License: MIT](https://img.shields.io/badge/License-MIT-00e5ff?style=flat-square)](LICENSE)

*Get matched with an opponent, solve the same algorithm problem, and race to submit the best solution. Climb the ELO leaderboard and prove your skills.*

<br/>

### [🌍 Play Live Demo: algobattle.vercel.app](https://algobattle.vercel.app)

<br/>

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture Flow](#architecture-flow)
- [API & Socket Contract](#api--socket-contract)
- [Database & Connection Pooling](#database--connection-pooling)
- [Authentication & Security](#authentication--security)
- [Key Design Patterns](#key-design-patterns)
- [Local Setup](#local-setup)

---

## Overview

AlgoBattle Arena is a **real-time competitive programming platform** where developers go head-to-head in live 1v1 coding battles. Both players receive the same algorithmic challenge and race to submit a correct, efficient solution. The winner earns ELO rating points; the loser loses them. 

The platform currently features two core experiences:
1. **Ranked 1v1:** Instant matchmaking against real players with live WebSocket sync and shared timers.
2. **vs AI Bot:** Practice against offline AI bots at varying difficulty tiers.

---

## Features

### Core Gameplay
- **Live 1v1 Ranked Battles** — Real-time WebSocket matchmaking instantly pairs you with an opponent. Both see the same problem simultaneously.
- **Live Battle Status** — Socket.io ensures both players see opponent submission verdicts (e.g., Wrong Answer, Accepted) live during a match.

### Problem System
- **Curated Problem Library** — Problems categorized by difficulty (Easy / Medium / Hard).
- **Hidden Test Harness** — Each problem ships with hidden test cases. User code is dynamically wrapped and strictly asserted by the execution engine.

### Ranking & Progression
- **True ELO Rating System** — Win/loss adjusts your ELO dynamically based on opponent strength.
- **Global Leaderboard** — Filterable global leaderboard to track the top competitive programmers on the platform.
- **Personal Dashboard** — Track your match history, ELO rating, and win/loss records.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React + Vite | Fast, client-side rendered SPA |
| **Runtime** | Node.js + TypeScript | Strongly-typed, scalable backend environment |
| **Framework** | Express.js | REST API and HTTP server routing |
| **Real-time** | Socket.IO | Stateful bi-directional communication for battles |
| **Database** | PostgreSQL (`pg` pool) | Hosted on Neon DB. Uses raw SQL with parameterized queries |
| **Matchmaking** | Redis (Upstash) | High-speed matchmaking queue using List operations |
| **Code Execution**| Piston API (Docker) | Secure, sandboxed multi-language execution hosted on AWS EC2 |
| **Authentication**| Custom JWT + bcrypt | Secure, httpOnly revocable refresh token rotation |
| **File Uploads** | Multer + Cloudinary | Two-stage profile avatar uploads (Disk to Cloud CDN) |


---

## Architecture Flow

```mermaid
flowchart TD
    Client1[Player 1] <-->|Socket.IO| Gateway(API / Socket Gateway)
    Client2[Player 2] <-->|Socket.IO| Gateway
    
    Gateway <-->|LPOP / RPUSH| RedisQueue[(Redis Matchmaking Queue)]
    
    Client1 -->|Submit Code| Gateway
    Gateway -->|HTTP POST| Piston[AWS EC2: Piston Execution Engine]
    Piston -->|Result| Gateway
    
    Gateway -->|Battle End| ELO[ELO Service]
    ELO -->|Update Ratings| Postgres[(Neon PostgreSQL DB)]
```

---

## API & Socket Contract

### REST API Endpoints (User Routes)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/user/register` | ❌ | Register new user (with optional avatar upload) |
| POST | `/user/login` | ❌ | Login with email/username + password |
| POST | `/user/logout` | ✅ | Logout (clears cookies + DB refresh token) |
| POST | `/user/renewAccessToken` | ❌ | Refresh expired access token using refresh token |
| POST | `/user/forgetPassword` | ✅ | Reset password by email |
| PATCH | `/user/updateProfile` | ✅ | Update bio + avatar (file upload via multer) |
| GET | `/user/profile/:username` | ✅ | Get public profile of any user |

### Socket.IO Events
| Event | Direction | Payload | Description |
| --- | --- | --- | --- |
| `join_queue` | Client → Server | `{ userId, rating }` | Adds user to the Upstash Redis matchmaking queue |
| `match_found` | Server → Client | `{ roomId, opponent, problem }`| Emitted when two players are matched |
| `submit_code` | Client → Server | `{ roomId, code, language }`| Sends code to be dynamically wrapped and evaluated by Piston |
| `judge_result` | Server → Client | `{ verdict, executionTime }`| Streams sandboxed execution results back to the client |
| `match_end` | Server → Client | `{ winnerId, newRating }` | Broadcasts final match result, draw conditions, and rating changes |

---

## Database & Connection Pooling

Powered by serverless PostgreSQL (Neon DB). 

**Connection Pooling:** Instead of opening and closing expensive, single connections for every API request, the backend implements a `pg.Pool`. This pool manages reusable connections to the database, massively increasing concurrent throughput. A 4-minute keep-alive ping prevents Neon DB from dropping idle connections.

**Tables Overview:**
- **users:** Accounts and hashed credentials.
- **user_profiles:** Bios, ELO ratings, and Cloudinary avatar URLs.
- **problems:** Challenges, starter code, and hidden test cases.
- **matches:** Match history, outcomes, and durations.
- **submissions:** Individual code submission payloads and verdicts.

---

## Authentication & Security

**1. JWT Token Rotation**
Verifies bcrypt-hashed password and generates short-lived `access_token` (15m) and long-lived `refresh_token` (7d). Both are sent as secure `httpOnly` cookies.

**2. Hashed Database Tokens**
The `refresh_token` itself is bcrypt-hashed before being saved to the database. Even in the event of a full database leak, attackers cannot impersonate users.

**3. Timing Attack Protection**
During login, if a user's email does not exist, the backend still executes a dummy `bcrypt.compare()` operation. This guarantees that all login requests take the exact same amount of time, completely preventing attackers from enumerating valid emails by measuring response times.

---

## Key Design Patterns

### 1. The `asyncHandler` Wrapper
Rather than cluttering every controller with redundant `try/catch` blocks, a higher-order function `asyncHandler` wraps every route. Any rejected promise or thrown error is automatically caught and forwarded to the global error handler via `next(error)`.

### 2. Custom `ApiError` & Global Error Handler
The native `Error` class is extended into `ApiError` to include HTTP `statusCode` and consistent payload formatting. The Express global error handler acts as a single source of truth at the end of the middleware chain, intercepting `next(error)` and returning a perfectly formatted JSON response.

### 3. Explicit Database Transactions
Operations that insert into multiple tables simultaneously (like User Registration, which touches `users` and `user_profiles`) are wrapped in explicit database transactions (`BEGIN` and `COMMIT`). If any step fails, an automatic `ROLLBACK` guarantees atomic consistency, preventing orphaned profiles or corrupted records.

---

## Deployment Architecture

The platform is designed to be deployed across specialized cloud infrastructure for maximum performance and real-time reliability:

- **Frontend Client:** Deployed globally on **Vercel** for fast edge delivery.
- **Backend / Socket Server:** Deployed on **Render** (or Railway) as a persistent Node.js background process. Serverless platforms (like Vercel functions) drop long-lived WebSocket connections, so a dedicated runtime is required.
- **Database:** Hosted on **Neon DB** (Serverless PostgreSQL).
- **Matchmaking / PubSub:** Hosted on **Upstash** (Serverless Redis).
- **Execution Sandbox:** The Piston API runs inside isolated Docker containers on a dedicated **AWS EC2** instance to prevent arbitrary code execution attacks on the main server.

---

## Future Improvements

While this MVP is fully functional, here is the roadmap for scaling it to a production-grade system:

1. **API Rate Limiting:** Implement `express-rate-limit` to protect auth routes from brute-force dictionary attacks.
2. **Schema Validation:** Replace manual `if/else` body checks with strict `Zod` schema validation for all incoming API payloads.
3. **Cursor-based Pagination:** The problem listing currently uses `LIMIT / OFFSET` which degrades performance on massive tables. Transition to cursor-based `WHERE id > lastId` pagination.
4. **Redis Caching:** Cache the global leaderboard and static problem descriptions in Redis to significantly reduce Postgres load during peak traffic.
5. **Horizontal Scaling for Sockets:** The `activeBattles` are currently stored in a local JavaScript `Map`. To scale horizontally across multiple backend servers behind a load balancer, this state must be migrated into a Redis Hash.
6. **Integration Testing:** Implement a full test suite using `Jest` and `Supertest` to automate CI/CD pipeline validation.

---

## Local Setup

**1. Install dependencies**
```bash
npm install
```

**2. Set Environment Variables**
Configure your `.env` file in `/Backend`:
```env
DATABASE_URL="postgresql://user:pass@ep-restless-bird-1234.us-east-2.aws.neon.tech/neondb"
REDIS_URL="rediss://default:password@upstash.io:32412"
PISTON_URL="http://your-aws-ec2-ip:2000"
ACCESS_TOKEN_SECRET="your_jwt_secret"
REFRESH_TOKEN_SECRET="your_refresh_secret"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
PORT=4000
```

**3. Start the Backend Server**
```bash
cd Backend
npm run dev
```

**4. Start the Frontend Application**
```bash
cd frontend
npm run dev
```

---

<div align="center">

Built by **raj kumar gupta**

⚔️ *Code. Battle. Conquer.*

</div>
