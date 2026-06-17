# AlgoBattle Arena (Backend)

AlgoBattle Arena is a real-time, 1v1 competitive coding platform where developers battle head-to-head to solve algorithmic challenges. The platform features instantaneous matchmaking, sandboxed code execution, and an ELO-based ranking system.

*Note: This documentation covers the **Backend** architecture and systems exclusively.*

## 🏗️ Architecture

```mermaid
flowchart TD
    Client1[Player 1] <-->|Socket.IO| Gateway(API / Socket Gateway)
    Client2[Player 2] <-->|Socket.IO| Gateway
    
    Gateway <-->|Enqueue / Dequeue| RedisQueue[(Redis Matchmaking Queue)]
    
    Client1 -->|Submit Code| Gateway
    Gateway -->|HTTP POST| Piston[AWS EC2: Piston Execution Engine]
    Piston -->|Result| Gateway
    
    Gateway -->|Battle End| ELO[ELO Service]
    ELO -->|Update Ratings| Postgres[(PostgreSQL DB)]
```

## 🛠️ Tech Stack

| Component | Technology | Purpose |
| --- | --- | --- |
| **Runtime** | Node.js + TypeScript | Strongly-typed, scalable server environment |
| **Framework** | Express | REST API and HTTP server |
| **Real-time** | Socket.IO | Stateful bi-directional communication |
| **Database** | PostgreSQL (`pg` package) | Persistent storage for users, problems, matches |
| **Matchmaking** | Redis (Upstash) | High-speed matchmaking queue |
| **Code Execution**| Piston API (Docker) | Secure, sandboxed multi-language execution on AWS |
| **Authentication**| JWT + bcrypt | Secure, httpOnly revocable refresh token rotation |

## 🔌 Socket.IO Event Contract

| Event | Direction | Payload | Description |
| --- | --- | --- | --- |
| `join_queue` | Client → Server | `{ userId, rating }` | Adds user to Redis matchmaking queue |
| `match_found` | Server → Client | `{ roomId, opponent, problem }`| Emitted when two players are matched |
| `submit_code` | Client → Server | `{ roomId, code, language }`| Sends code to be evaluated by Piston |
| `judge_result` | Server → Client | `{ verdict, executionTime }`| Streams execution results back to client |
| `match_end` | Server → Client | `{ winnerId, newRating }` | Broadcasts final match result and rating changes |

## 🗄️ Database Schema

Powered by PostgreSQL (Neon DB):
- **users:** `id`, `username`, `email`, `password_hash`, `userrating`, `record`, `created_at`
- **problems:** `id`, `title`, `description`, `difficulty`, `test_cases`, `starter_code`
- **matches:** `id`, `player1_id`, `player2_id`, `winner_id`, `problem_id`, `duration_ms`
- **bots:** `id`, `name`, `difficulty`, `rating`

## 🔐 Authentication Flow

Secure authentication using strict JWT rotation:
1. **Login:** Verifies bcrypt-hashed password and generates short-lived `access_token` and long-lived `refresh_token`.
2. **Delivery:** `refresh_token` is sent as a secure, `httpOnly` cookie. `access_token` is returned in JSON.
3. **Rotation:** When `access_token` expires, the client sends the `refresh_token`. If valid, a new access/refresh pair is generated.

## 📈 ELO Rating System

Ratings use a standard ELO formula to adjust player ranks dynamically after a match. Both players' ratings and win/loss records are immediately updated in PostgreSQL upon match completion.

## 🚀 Local Setup

**1. Install dependencies**
```bash
npm install
```

**2. Set Environment Variables**
Configure your `.env` file in `/backend`:
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/algobattle"
REDIS_URL="redis://localhost:6379"
PISTON_URL="http://localhost:2000"
ACCESS_TOKEN_SECRET="your_jwt_secret"
REFRESH_TOKEN_SECRET="your_refresh_secret"
PORT=4000
```

**3. Start the Development Server**
```bash
npm run dev
```
