# AlgoBattle Arena — Backend Interview Preparation Guide

---

## 1. Project Overview

**AlgoBattle Arena** is a 1v1 competitive coding platform where two users battle each other by solving DSA problems in real-time. Think of it as a mix between LeetCode and a multiplayer game.

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Runtime | Node.js + TypeScript |
| Framework | Express.js |
| Database | PostgreSQL (hosted on Neon — serverless) |
| ORM / Query | Raw SQL via `pg` (node-postgres) Pool |
| Auth | JWT (Access + Refresh tokens) with bcrypt password hashing |
| File Upload | Multer (local disk) → Cloudinary (cloud CDN) |
| Frontend | React + Vite (separate repo/folder) |
| Monorepo | Turborepo |

---

## 2. Folder Structure

```
Backend/
├── src/
│   ├── app.ts                    # Express app setup, middleware, route mounting
│   ├── index.ts                  # Server entry point (app.listen)
│   ├── config/
│   │   └── db.ts                 # PostgreSQL pool + keep-alive ping
│   ├── controller/
│   │   ├── user.controller.ts    # Register, Login, Logout, Token refresh, Profile CRUD
│   │   ├── problem.controller.ts # Problem listing with filters & pagination
│   │   ├── battle.controller.ts  # Battle/match history page
│   │   └── leaderboard.controller.ts # Leaderboard rankings
│   ├── middleware/
│   │   ├── Auth.middleware.ts     # JWT verification, attaches user to req
│   │   └── multer.ts             # File upload config (disk storage)
│   ├── routes/
│   │   ├── user.route.ts
│   │   ├── problem.route.ts
│   │   ├── battle.route.ts
│   │   └── leaderboard.route.ts
│   ├── dbmodel/                  # TypeScript interfaces for DB tables
│   │   ├── users.model.ts
│   │   ├── userProfiles.model.ts
│   │   ├── problems.model.ts
│   │   ├── matches.model.ts
│   │   └── submissions.model.ts
│   └── util/
│       ├── asynchronous.ts       # asyncHandler wrapper (try/catch → next(error))
│       ├── customerror.ts        # Custom ApiError class (extends Error)
│       ├── customresponse.ts     # Standardized ApiResponse class
│       └── cloudinary.ts         # Cloudinary upload utility
```

---

## 3. Database Schema (PostgreSQL)

### `users` table
| Column | Type | Constraint |
|--------|------|-----------|
| id | SERIAL | PRIMARY KEY |
| name | VARCHAR | UNIQUE, NOT NULL |
| email | VARCHAR | UNIQUE, NOT NULL |
| password | VARCHAR | NOT NULL (bcrypt hashed) |
| refresh_token | TEXT | NULLABLE (bcrypt hashed) |
| created_at | TIMESTAMP | DEFAULT now() |

### `user_profiles` table
| Column | Type | Constraint |
|--------|------|-----------|
| user_id | INTEGER | FOREIGN KEY → users(id) |
| bio | TEXT | NULLABLE |
| elo_rating | INTEGER | NOT NULL (default 1200) |
| battle_played | INTEGER | NOT NULL (default 0) |
| match_won | INTEGER | NOT NULL (default 0) |
| avatar_url | TEXT | NULLABLE |
| history | JSONB | NULLABLE |

### `problems` table
| Column | Type | Constraint |
|--------|------|-----------|
| id | SERIAL | PRIMARY KEY |
| title | VARCHAR | NOT NULL |
| difficulty | VARCHAR | 'easy' / 'medium' / 'hard' |
| description | TEXT | |
| (other fields) | | |

### `matches` table
| Column | Type | Constraint |
|--------|------|-----------|
| id | SERIAL | PRIMARY KEY |
| player1_id | INTEGER | FK → users(id) |
| player2_id | INTEGER | FK → users(id) |
| winner_id | INTEGER | FK → users(id), NULLABLE |
| problem_id | INTEGER | FK → problems(id) |
| played_at | TIMESTAMP | DEFAULT now() |

### `submissions` table
| Column | Type |
|--------|------|
| id | SERIAL |
| match_id | INTEGER |
| user_id | INTEGER |
| code | TEXT |
| language | VARCHAR |
| result | VARCHAR |

---

## 4. API Endpoints — Full List

### User Routes (`/user`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/user/ping` | ❌ | Health check |
| POST | `/user/register` | ❌ | Register new user (with optional avatar upload) |
| POST | `/user/login` | ❌ | Login with email/username + password |
| POST | `/user/logout` | ✅ | Logout (clears cookies + DB refresh token) |
| POST | `/user/renewAccessToken` | ❌ | Refresh expired access token using refresh token |
| POST | `/user/forgetPassword` | ✅ | Reset password by email |
| PATCH | `/user/updateProfile` | ✅ | Update bio + avatar (file upload via multer) |
| GET | `/user/users/:username` | ✅ | Get public profile of any user |
| GET | `/user/matchHistory/:username` | ✅ | Get match history of logged-in user |

### Problem Routes (`/problems`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/problems` | ❌ | List problems with filters (difficulty, search, pagination) |

### Battle Routes (`/battle`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/battle` | ✅ | Get last played matches with player names |
| GET | `/battle/offline` | ✅ | Fetch list of available AI bots with ELO ratings |
| GET | `/battle/online` | ✅ | Placeholder for online matchmaking (501 Not Implemented) |
| GET | `/battle/custom` | ✅ | Placeholder for custom private rooms (501 Not Implemented) |

### Leaderboard Routes (`/leaderboard`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/leaderboard` | ❌ | Get top users ranked by elo_rating |

---

## 5. Authentication Flow — Deep Dive

### How it works (JWT + Refresh Token Rotation):

```
1. User registers → password is hashed with bcrypt (10 salt rounds) → stored in DB
2. User logs in → bcrypt.compare(password, hash)
     ↓ success
3. Generate Access Token (short-lived, 15m) + Refresh Token (long-lived, 7d)
4. Refresh Token is HASHED with bcrypt before storing in DB (not stored raw!)
5. Both tokens sent as httpOnly + secure cookies AND in response body
6. On each protected request → AuthMiddleware verifies Access Token via jwt.verify()
7. When Access Token expires → client sends Refresh Token to /renewAccessToken
8. Server verifies Refresh Token → bcrypt.compare(incoming, stored_hash)
9. If valid → generate NEW pair of tokens (Token Rotation) → old refresh token invalidated
10. On logout → refresh token set to NULL in DB + cookies cleared
```

### Why hash the refresh token in DB?
> **Interview Answer:** If an attacker gets read-access to the database (SQL injection, backup leak), they cannot use the stored hash to impersonate users. They would need the original token which only lives in the user's cookies. This is a defense-in-depth strategy.

### Why use Token Rotation?
> **Interview Answer:** Every time a refresh token is used, a new one is issued and the old one is invalidated. If an attacker steals a refresh token and uses it, the legitimate user's next refresh will fail (because the token was already rotated). This detects token theft.

### Timing Attack Protection in Login:
```typescript
const DUMMY_HASH = "$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345";
const isPasswordValid = await bcrypt.compare(
    password,
    foundUser?.password || DUMMY_HASH
);
```
> **Interview Answer:** If a user doesn't exist, we still run `bcrypt.compare` against a dummy hash. This ensures the response time is identical whether the user exists or not. Without this, an attacker could measure response times to enumerate valid usernames/emails (faster response = user doesn't exist because bcrypt was skipped).

---

## 6. Key Design Patterns & Concepts

### 6.1 asyncHandler (Higher-Order Function)
```typescript
const asyncHandler = (fn: Function) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await fn(req, res, next);
        } catch (error) {
            next(error); // passes to global error handler
        }
    };
};
```
> **What it does:** Wraps every controller in try/catch automatically so you never need to write try/catch in each route. Any thrown error (including `ApiError`) is caught and forwarded to the global error handler via `next(error)`.

> **Interview Answer:** "This is a higher-order function pattern. It takes a function as input and returns a new function. It follows the DRY principle by centralizing error handling. Without it, every single controller would need its own try/catch block."

### 6.2 Custom ApiError Class
```typescript
class ApiError extends Error {
    statusCode: number;
    success: boolean;
    errors: any[];
    constructor(statusCode, message, errors, stack) { ... }
}
```
> **Interview Answer:** "I extended the native Error class to include HTTP-specific fields like statusCode and a consistent structure. This way, when I `throw new ApiError(401, 'Unauthorized')`, the global error handler knows exactly what status code to send back. It follows the Single Responsibility Principle — the controller focuses on business logic, the error handler focuses on formatting the response."

### 6.3 Global Error Handler
```typescript
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false, statusCode, message, errors
    });
});
```
> **Interview Answer:** "Express recognizes a middleware with 4 parameters (err, req, res, next) as an error-handling middleware. It MUST be the last `app.use()` call. All `next(error)` calls from asyncHandler land here, giving us a single place to format error responses consistently."

### 6.4 Database Transaction (in Register)
```typescript
const client = await pool.connect();
try {
    await client.query("BEGIN");
    // 1. Insert into users
    // 2. Insert into user_profiles
    await client.query("COMMIT");
} catch (err) {
    await client.query("ROLLBACK");
    throw err;
} finally {
    client.release();
}
```
> **Interview Answer:** "Registration inserts into TWO tables (users + user_profiles). If the second insert fails, I don't want a user row without a profile. Using a transaction with BEGIN/COMMIT/ROLLBACK ensures atomicity — either both succeed or neither does. The `finally` block ensures the connection is always released back to the pool, preventing connection leaks."

### 6.5 Connection Pool + Keep-Alive
```typescript
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

setInterval(async () => {
    await pool.query('SELECT 1');
}, 4 * 60 * 1000);
```
> **Interview Answer:** "I'm using Neon (serverless Postgres) which aggressively closes idle connections. The keep-alive ping every 4 minutes prevents ETIMEDOUT/ECONNRESET errors. The Pool itself manages a set of reusable connections — rather than opening a new connection per query (which is expensive), we reuse connections from the pool. This is the Connection Pool pattern."

### 6.6 File Upload Pipeline (Multer → Cloudinary)
```
Client sends multipart/form-data
    → Multer saves to local /uploads/ directory
        → Cloudinary SDK uploads from disk to cloud CDN
            → Local file is deleted (fs.unlinkSync)
                → Cloud URL is stored in database
```
> **Interview Answer:** "I used a two-step upload approach: Multer saves to disk first, then I upload to Cloudinary asynchronously. This decouples file reception from cloud upload. If Cloudinary fails, we still have the file locally to retry. After successful upload, we clean up the local file to save disk space."

### 6.7 Stubbing & Iterative API Development (Placeholder Routes)
```typescript
battleRouter.route('/online').get(AuthMiddleware, (req, res) => res.status(501).json({ message: "Not implemented" }));
```
> **Interview Answer:** "When building out the `/battle` router, I created placeholder routes for upcoming features like `/online` and `/custom` using the 501 Not Implemented status. This allows the frontend to confidently start integrating the router structure without crashing the Express server (which happens if you leave trailing commas or empty middleware chains). It's a standard pattern for iterative API delivery."

---

## 7. Real-Time WebSocket Infrastructure (Socket.io)

### 7.1 WebSocket Architecture & Setup
```typescript
const io = new Server(httpServer, {
    cors: { origin: allowedOrigins, credentials: true },
});
io.use(socketAuthMiddleware);
```
> **Interview Answer:** "For real-time functionality (1v1 matchmaking and live battles), HTTP polling is too slow and resource-intensive. I integrated `Socket.io` because it provides an event-driven, full-duplex communication channel. I attached the WebSocket server directly to the same Express `httpServer` so they run on the same port, avoiding separate deployment infrastructure."

### 7.2 WebSocket Authentication Middleware
```typescript
export const socketAuthMiddleware = (socket: Socket, next: Function) => {
    try {
        const token = socket.handshake.auth.token;
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        socket.data.userId = decoded.id;
        next();
    } catch (err) {
        next(new Error("Authentication error"));
    }
};
```
> **Interview Answer:** "WebSockets need authentication just like HTTP routes. Instead of sending tokens in HTTP headers (which is tricky with native WebSockets), I pass the JWT access token in the `socket.handshake.auth` payload during the initial connection. The middleware verifies this JWT. If valid, I extract the `userId` and attach it to `socket.data.userId`. This is crucial because it ensures that for the lifetime of that socket connection, we know exactly which user is sending events, completely preventing impersonation during a live battle."

### 7.3 State Management & Typings
I designed strict TypeScript interfaces (`BattleState`, `BattlePlayer`, `BattleResult`) to maintain the single source of truth in memory during an active battle.
> **Interview Answer:** "To manage live battles, I designed an in-memory state machine using TypeScript interfaces. A `BattleState` tracks the `battleId`, current `phase` (WAITING, ACTIVE, COMPLETED), the `problemId`, the `remainingSec` timer, and the states of both players. Each `BattlePlayer` tracks their `verdict` (ACCEPTED, WRONG_ANSWER, RUNTIME_ERROR) and `passedCases`. This strongly-typed state ensures the server definitively manages the game clock and score, preventing clients from cheating or sending malicious state updates."

---

## 8. SQL Queries Explained

### Parameterized Queries (SQL Injection Prevention)
```typescript
// ❌ VULNERABLE — string concatenation
pool.query(`SELECT * FROM users WHERE email = '${email}'`);

// ✅ SAFE — parameterized query
pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
```
> **Interview Answer:** "I use parameterized queries with $1, $2 placeholders. The database driver treats these as data, not SQL code. Even if someone passes `' OR 1=1 --` as email, it's treated as a literal string, not executable SQL. This completely prevents SQL injection."

### Dynamic Query Building (Problem Listing)
```typescript
let query = `SELECT * FROM problems`;
const conditions = [];
if (difficulty) conditions.push(`difficulty = $${values.length}`);
if (search) conditions.push(`title ILIKE $${values.length}`);
if (conditions.length > 0) query += ` WHERE ` + conditions.join(" AND ");
query += ` LIMIT $${...} OFFSET $${...}`;
```
> **Interview Answer:** "For flexible filtering, I build the query dynamically. Each filter adds a condition with a parameterized placeholder. ILIKE provides case-insensitive search. LIMIT/OFFSET handles pagination. This approach is scalable — adding a new filter is just one more `if` block."

### LEFT JOIN for User Profile
```sql
SELECT u.id, u.name, u.email, p.bio, p.elo_rating, p.avatar_url
FROM users u
LEFT JOIN user_profiles p ON u.id = p.user_id
WHERE u.name = $1
```
> **Interview Answer:** "I used LEFT JOIN instead of INNER JOIN because a user might not have a profile yet (e.g., just registered). LEFT JOIN returns the user row with NULL profile fields, while INNER JOIN would return nothing. This way the client knows the user exists but just hasn't set up their profile."

---

## 9. Middleware Explained

### Auth Middleware Flow:
```
1. Extract token from: cookies → Authorization header → body (fallback chain)
2. jwt.verify(token, secret) — throws if expired/invalid
3. Query DB for user by decoded.id
4. Attach user object to req.user
5. Call next() to proceed to the controller
```

### Multer Middleware:
```typescript
const storage = multer.diskStorage({
    destination(req, file, cb) { cb(null, uploadDir) },
    filename(req, file, cb) { cb(null, Date.now() + '-' + file.originalname) }
});
```
> **Interview Answer:** "Multer parses multipart/form-data (which is how browsers send file uploads). I configured disk storage with unique filenames (timestamp prefix) to prevent name collisions. The upload directory is created automatically if it doesn't exist using `fs.mkdirSync({ recursive: true })`."

---

## 10. Security Measures Summary

| Threat | Protection |
|--------|-----------|
| SQL Injection | Parameterized queries ($1, $2...) |
| Password Theft | bcrypt hashing (10 salt rounds) |
| XSS (Cookie Theft) | httpOnly cookies (JS can't access) |
| CSRF | secure flag on cookies (HTTPS only) |
| Token Theft | Refresh token rotation + bcrypt hashing in DB |
| User Enumeration | Timing attack protection (dummy bcrypt compare) |
| Unvalidated Input | Field validation before every DB operation |
| CORS | Whitelist-based origin via `process.env.ALLOWEDSITE` |
| Connection Leak | `finally { client.release() }` after transactions |

---

## 11. Common Interview Questions & Answers

### Q: Why did you choose raw SQL over an ORM like Prisma/Sequelize?
> "Raw SQL gives me full control over query optimization, especially for complex JOINs and aggregations needed in leaderboard/match history. ORMs add abstraction overhead and sometimes generate suboptimal queries. For a competitive coding platform where performance matters, raw SQL with parameterized queries was the right trade-off. I also understand exactly what's happening at the database level."

### Q: How does your authentication work?
> "I implement a dual-token system. The Access Token (JWT, 15 min expiry) is used for authenticating API requests. The Refresh Token (JWT, 7 days expiry) is used to get a new access token when the old one expires. The refresh token is bcrypt-hashed before storage so even a database breach won't expose usable tokens. On every refresh, both tokens are rotated (old ones invalidated). On logout, the refresh token is set to NULL in DB and both cookies are cleared."

### Q: What happens if the database connection drops?
> "I use a connection pool (pg Pool) which automatically manages connections. I also added a keep-alive ping every 4 minutes because Neon (serverless Postgres) drops idle connections. If a connection fails mid-query, the pool creates a new one. For critical operations like registration, I use explicit transactions with ROLLBACK to ensure data consistency."

### Q: How do you handle file uploads?
> "Two-stage pipeline: Multer saves the file to the server's disk with a timestamped filename (prevents collisions). Then I upload it to Cloudinary (cloud CDN) using their SDK. After successful upload, I delete the local file. The Cloudinary URL is stored in the user_profiles table. If Cloudinary upload fails, the function returns null and we handle it gracefully."

### Q: Why Express over Fastify/Hono/etc?
> "Express has the largest ecosystem, most middleware support, and the best community resources. For a project of this scale, Express's performance is more than adequate. The asyncHandler pattern keeps the code clean. I'm familiar with its middleware pipeline (request → middlewares → route handler → error handler) which makes debugging straightforward."

### Q: How do you handle errors consistently across all routes?
> "Three-layer approach: (1) Custom `ApiError` class with statusCode for business logic errors, (2) `asyncHandler` higher-order function wraps every controller to catch async errors and forward them via `next(error)`, (3) Global error handler middleware at the end of the middleware chain formats all errors into a consistent JSON response `{ success, statusCode, message, errors }`."

### Q: Explain the registration flow step by step.
> "1. Validate required fields (username, email, password). 2. Check if user already exists (by email OR username). 3. Optionally upload avatar to Cloudinary. 4. Hash password with bcrypt. 5. Begin a database transaction. 6. Insert into `users` table. 7. Insert into `user_profiles` with default ELO rating (1000). 8. Commit transaction. 9. Return user data (without password). If anything fails at step 6 or 7, ROLLBACK ensures no partial data."

### Q: What is COALESCE and why do you use it in UPDATE queries?
> "COALESCE returns the first non-null argument. In my UPDATE query: `SET bio = COALESCE($1, bio)` — if the user sends a new bio ($1), it updates. If they don't send bio ($1 is null), COALESCE falls back to the existing `bio` value, leaving it unchanged. This lets users update individual fields without overwriting others."

### Q: How does pagination work in your problem listing?
> "I use LIMIT + OFFSET pattern. The client sends a `page` query parameter. I calculate `offset = (page - 1) * 10`. The query becomes `SELECT * FROM problems ... LIMIT 10 OFFSET 20` (for page 3). This returns 10 results per page. I also return difficulty counts (easy/medium/hard) for frontend filter UI."

### Q: Why use the raw TCP connection for Redis instead of a REST/HTTP endpoint?
> "For real-time multiplayer matchmaking, speed and persistent connections are critical. The raw TCP connection maintains a single, permanent open pipeline to the Redis server, allowing commands to be executed with zero handshake overhead. More importantly, TCP allows for **Pub/Sub** capabilities, where the Redis server can 'push' events to the Node.js backend. HTTP is stateless and requires opening a brand new connection for every command, which adds latency and makes real-time server-side pushing impossible."

### Q: Explain the Redis commands you used for the matchmaking queue (LPOP, RPUSH, LREM).
> "I implemented the queue using a Redis List. 
> 1. **`LPOP (List Pop)`**: When a user clicks 'Find Battle', I use `LPOP` to instantly pull the first available opponent from the left side of the queue. If it returns null, the queue is empty.
> 2. **`RPUSH (Right Push)`**: If the queue is empty, I use `RPUSH` to add the user's data to the right side (the back) of the queue so the next person can match with them.
> 3. **`LREM (List Remove)`**: If a user cancels their search or closes their browser, the `disconnect` event triggers `LREM` with a count of `0`. This scans the list and instantly deletes all occurrences of that user's exact JSON string, ensuring nobody matches with a disconnected 'ghost' player."

### Q: Your active battles and timers are stored in a JavaScript `Map`. What happens if your application scales to multiple backend servers?
> "Currently, `activeBattles` is a module-level variable that acts as an in-memory singleton for my single Node.js instance. If I scaled horizontally to multiple servers behind a load balancer, those servers would not share RAM. To solve this, I would migrate the `activeBattles` Map into a **Redis Hash** so all servers could read/write to a shared state, and I would use Redis Pub/Sub to sync timer updates across the different WebSocket server instances."

---

## 12. Things You Can Improve (Talking Points for "What would you do differently?")

1. **Rate Limiting** — Add `express-rate-limit` to prevent brute-force login attacks
2. **Input Validation** — Use `zod` or `joi` for schema validation instead of manual checks
3. **Cursor-based Pagination** — OFFSET pagination is slow for large datasets; use `WHERE id > lastId` instead
4. **Redis Caching** — Cache leaderboard and problem list (they don't change frequently)
5. **WebSocket for Real-time Battles** — Socket.io for live code submission, timer sync, matchmaking
6. **Email Verification** — Send OTP/link before activating account
7. **Password Reset via Email** — Current `/forgetPassword` requires auth; real-world would use email token
8. **Logging** — Add Winston/Pino for structured logging instead of `console.log`
9. **Testing** — Add Jest + Supertest for API integration tests
10. **Docker** — Containerize the app for consistent deployment

---

## 13. How to Demo This Project

```bash
# Terminal 1 — Start Backend
cd Backend
npm run dev
# Server runs on http://localhost:4000

# Terminal 2 — Start Frontend
cd frontend
npm run dev
# App runs on http://localhost:3002
```

### Quick Postman Test Flow:
1. `POST /user/register` — Create user with username, email, password
2. `POST /user/login` — Get accessToken + refreshToken
3. `PATCH /user/updateProfile` — Send bio + avatar file (form-data) with accessToken
4. `GET /user/users/rajkumar` — View public profile
5. `GET /problems` — List all problems
6. `GET /problems?difficulty=easy&page=2` — Filtered + paginated
7. `GET /leaderboard` — Top players by ELO
8. `POST /user/renewAccessToken` — Refresh expired access token
9. `POST /user/logout` — Clear tokens
10. `GET /battle/offline` — Get list of AI bots from database

---

*This document was prepared as an interview reference for the AlgoBattle Arena project.*
