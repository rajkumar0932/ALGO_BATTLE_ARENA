# AlgoBattle Arena

AlgoBattle Arena is a real-time, 1v1 competitive coding platform where developers battle head-to-head to solve algorithmic challenges. The platform features instantaneous matchmaking, sandboxed code execution, and an ELO-based ranking system.

This repository structure is divided into two main environments:
- `/Backend` — Node.js + Express + Socket.IO server (TypeScript)
- `/frontend` — React + Vite client application

*Note: This documentation covers the **Backend** architecture and systems exclusively.*

## 🏗️ Architecture Flow

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

## 🛠️ Tech Stack

| Component | Technology | Purpose |
| --- | --- | --- |
| **Runtime** | Node.js + TypeScript | Strongly-typed, scalable server environment |
| **Framework** | Express.js | REST API and HTTP server routing |
| **Real-time** | Socket.IO | Stateful bi-directional communication for battles |
| **Database** | PostgreSQL (`pg` pool) | Hosted on Neon DB. Uses raw SQL with parameterized queries |
| **Matchmaking** | Redis (Upstash) | High-speed matchmaking queue using List operations |
| **Code Execution**| Piston API (Docker) | Secure, sandboxed multi-language execution hosted on an AWS EC2 instance |
| **Authentication**| JWT + bcrypt | Secure, httpOnly revocable refresh token rotation |
| **File Uploads** | Multer + Cloudinary | Two-stage profile avatar uploads (Disk to Cloud CDN) |

## 🔌 API & Socket Contract

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

## 🗄️ Database Schema & Connection Pooling

Powered by serverless PostgreSQL (Neon DB). 

**Connection Pooling:** Instead of opening and closing expensive, single connections for every API request, the backend implements a `pg.Pool`. This pool manages reusable connections to the database, massively increasing concurrent throughput. A 4-minute keep-alive ping prevents Neon DB from dropping idle connections.

**Tables:**
- **users:** `id`, `name`, `email`, `password` (bcrypt), `refresh_token`, `created_at`
- **user_profiles:** `user_id`, `bio`, `elo_rating`, `battle_played`, `match_won`, `avatar_url`
- **problems:** `id`, `title`, `description`, `difficulty`, `test_cases`, `starter_code`
- **matches:** `id`, `player1_id`, `player2_id`, `winner_id`, `problem_id`, `played_at`
- **submissions:** `id`, `match_id`, `user_id`, `code`, `language`, `result`

## 🔐 Authentication & Security Flow

**1. JWT Token Rotation**
Verifies bcrypt-hashed password and generates short-lived `access_token` (15m) and long-lived `refresh_token` (7d). Both are sent as secure `httpOnly` cookies.

**2. Hashed Database Tokens**
The `refresh_token` itself is bcrypt-hashed before being saved to the database. Even in the event of a full database leak, attackers cannot impersonate users.

**3. Timing Attack Protection**
During login, if a user's email does not exist, the backend still executes a dummy `bcrypt.compare()` operation. This guarantees that all login requests take the exact same amount of time, completely preventing attackers from enumerating valid emails by measuring response times.

## 🏗️ Key Design Patterns

### 1. The `asyncHandler` Wrapper
Rather than cluttering every controller with redundant `try/catch` blocks, a higher-order function `asyncHandler` wraps every route. Any rejected promise or thrown error is automatically caught and forwarded to the global error handler via `next(error)`.

### 2. Custom `ApiError` & Global Error Handler
The native `Error` class is extended into `ApiError` to include HTTP `statusCode` and consistent payload formatting. The Express global error handler acts as a single source of truth at the end of the middleware chain, intercepting `next(error)` and returning a perfectly formatted `{ success, statusCode, message, errors }` JSON response.

### 3. Explicit Database Transactions
Operations that insert into multiple tables simultaneously (like User Registration, which touches `users` and `user_profiles`) are wrapped in explicit database transactions (`BEGIN` and `COMMIT`). If any step fails, an automatic `ROLLBACK` guarantees atomic consistency, preventing orphaned profiles or corrupted records.

## 🚀 Local Setup

**1. Install dependencies**
```bash
cd Backend
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

**3. Start the Development Server**
```bash
npm run dev
```

## 📁 Folder Structure

```text
Backend/
├── src/
│   ├── config/         # Database pooling & keep-alive logic
│   ├── controller/     # Route handlers for REST endpoints
│   ├── middleware/     # Auth and Multer file upload handling
│   ├── routes/         # Express router definitions
│   ├── dbmodel/        # TypeScript interfaces for DB tables
│   ├── util/           # Custom error handlers, Cloudinary SDK, async wrappers
│   ├── socket/         # Socket.IO handlers, Timers, and Matchmaking Logic
│   └── app.ts          # Server entry point
```
