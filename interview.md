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

### Q: Since you are already using Redis for the matchmaking queue, why not use it for the active battle states too?
> "Using Redis Hashes (`HSET`, `HGET`) for active battle states is the industry standard for distributed systems. However, for this single-server MVP, I chose JavaScript Maps for two main reasons: 
> 1. **Timer Serialization:** We use Node.js `setInterval` to manage the countdown clock and broadcast ticks every second. You cannot serialize a running JavaScript `NodeJS.Timeout` object into a Redis database; the timer execution *must* live in Node.js memory.
> 2. **Overhead:** Reading/writing to a Map in RAM is synchronous and instantaneous. Redis requires async network calls (`await redisClient...`) for every single state update or timer tick, which adds unnecessary latency and complexity for a single-server deployment."

### Q: Why did you split your WebSocket logic into separate files (`matchmaking.ts` and `battle.ts`) instead of keeping everything in `index.ts`?
> "I followed the **Separation of Concerns** principle. Multiplayer games have distinct lifecycle phases. `matchmaking.ts` is solely responsible for queue management and pairing algorithms (finding an opponent). Once a match is found, control is handed over to `battle.ts`, which manages the actual gameplay loop: tracking the 15-minute countdown clock, handling real-time code submissions, calculating Elo rating changes, and declaring winners. Splitting them makes the code highly modular, easier to unit test, and prevents `index.ts` from becoming a monolithic, unmaintainable file."

### Q: Walk me through what happens exactly when two users match, and why do you need to store the `BattleState` in the server's memory?
> **1. The Match:** Player A and Player B are paired in the queue. The backend generates a unique `battleId` and sends the `lobby:matched` event to both clients.
> **2. The Redirection:** Both React frontends immediately redirect the users to `/battle/[battleId]`.
> **3. The Initialization:** When the battle page loads, the frontend emits a `battle:rejoin` event. The backend intercepts this, and initializes a new `BattleState` object, storing it in the `activeBattles` Map. It also starts a `setInterval` timer to countdown from 15 minutes.
> **4. Why store the state?** The `activeBattles` Map is the single source of truth. If a user's WiFi disconnects for 5 seconds and their browser reconnects, the backend looks up their `battleId` in the Map and instantly restores their UI to the exact current second of the match. It's also required for security: when a player submits code, the backend checks the state to ensure the battle is still `ACTIVE` and hasn't already been won by the opponent.

### Q: Since Node.js is single-threaded, how can it possibly execute hundreds of battles at the same time without freezing?
> "Node.js relies on its **Event Loop** and **Asynchronous non-blocking architecture (libuv)**. Even though JavaScript executes on a single thread, background tasks like `setInterval` timers, Database Queries, and WebSocket network I/O are handed off to the operating system. 
> If there are 500 active battles, there are 500 `setInterval` timers running. The single thread doesn't pause to wait for them. When a 1-second interval finishes, libuv simply places the callback function into the Event Queue. The Event Loop picks it up, instantly executes the tiny logic (`remainingSec--` and `io.emit`), and moves on. Because subtracting a number and emitting a message takes microseconds, the single thread can blaze through thousands of concurrent battles effortlessly!"

### Q: Explain the logic behind your real-time countdown timer when a battle starts.
> "When the first player joins the battle room, I check the `battleTimers` Map to ensure a clock hasn't already started. If not, I initialize a `setInterval` that triggers every 1,000 milliseconds (1 second). 
> Inside this interval:
> 1. It fetches the current battle state from memory.
> 2. It decrements `remainingSec` by 1.
> 3. It instantly broadcasts a `battle:tick` socket event so both frontends can update their UI clocks synchronously.
> 4. If `remainingSec` hits 0, it calls `clearInterval()` to stop the timer permanently, marks the phase as `COMPLETED`, and emits a `battle:end` event with a `TIME_UP` reason, resulting in a Draw where neither player loses Elo."

### Q: In your timer logic, you fetch the state using `activeBattles.get(battleId)` every single second. If there are 10,000 concurrent battles, won't fetching that data cause massive lag?
> "No, it will not lag at all due to **Time Complexity**. `activeBattles` is a JavaScript `Map`, which is implemented as a **Hash Table** under the hood. Fetching a value by its key from a Map is an **O(1) (Constant Time)** operation. Whether there is 1 battle or 100,000 battles in the Map, `get(battleId)` takes the exact same fraction of a microsecond. 
> Even with 10,000 timers firing every second, Node.js is just doing 10,000 O(1) memory lookups. Since Node can handle millions of O(1) operations per second, managing 10,000 battle countdowns would consume only a few milliseconds of CPU time per second."

### Q: How do you prevent memory leaks with your Node.js `setInterval` timers?
> "In Node.js, `setInterval` will run forever until explicitly stopped, which can easily cause 'zombie timers' and memory leaks. To prevent this, every time the timer ticks, it first checks if the battle still exists in the `activeBattles` Map (`if (!b)`). If a battle finishes early (e.g., someone wins) and is removed from the Map to free up RAM, the timer will wake up, see that the battle is missing, and instantly call `clearInterval()` on itself. This fail-safe guarantees that orphaned timers are automatically destroyed and never consume excess CPU."

### Q: How does your platform safely execute user code without getting hacked, and how would you scale it?
> "Allowing users to execute arbitrary code is highly dangerous. Giants like LeetCode and Codeforces use highly customized Linux sandboxes (using `cgroups`, `namespaces`, and `seccomp`) to strictly limit memory, ban network access, and isolate the file system. 
> For our platform, we utilize an execution engine like **Judge0** or **Piston**. These engines run inside isolated Docker containers to automatically compile code, run it against hidden test cases, and return exact Time and Memory metrics safely.
> **Scaling:** Code execution is entirely decoupled from the main backend. If 10,000 users submit code, the Node.js WebSocket server simply pushes the code into a **Redis Message Queue** and never executes it directly. A separate fleet of 'Worker Servers' listens to this queue, safely runs the Docker sandboxes, and pushes the Pass/Fail result back to Redis, which the Node server then relays to the frontend. To scale during peak traffic, we simply spin up more Worker Servers to process the queue faster without ever slowing down the main WebSockets."

### Q: Why would you host your own Code Execution Engine using Docker instead of relying on a public API?
> "Public APIs (like the free Piston API) are great for prototyping but have strict rate limits (e.g., 5 requests per second). At scale, this causes massive bottlenecks. 
> 'Hosting on Docker' means we rent our own cloud server (e.g., AWS EC2) and run the open-source Piston/Judge0 engine inside a **Docker Container** on our own hardware. Docker acts like a lightweight, isolated Virtual Machine. By running our own private Docker instance, we completely remove rate limits, gain full control over execution times, and ensure that if a malicious user submits a virus, it is trapped inside the disposable Docker container and cannot harm our actual Node.js backend server."

### Q: Walk me through exactly how your platform evaluates a user's code submission step-by-step.
> My Judge Service is effectively a **mini online judge**. The complete execution flow looks like this:
> 
> ```text
> User writes code
>       ↓
> Wrap user code with test cases
>       ↓
> Send to Piston API
>       ↓
> Run code in sandbox
>       ↓
> Check output
>       ↓
> Return ACCEPTED / WRONG_ANSWER
> ```
> 
> **1. Generating Test Cases & Wrappers**
> When a user submits code (e.g. `function twoSum(nums, target) { ... }`), my Node backend dynamically fetches the hidden test cases for that specific problem. It then injects a Javascript "wrapper" at the bottom of the user's code. This wrapper calls their function with the test inputs and strictly asserts the output using `JSON.stringify()` (since `[0,1] === [0,1]` is false in JS, but their stringified versions match).
> 
> The final generated file looks like this:
> ```js
> // 1. User's Code
> function twoSum(nums, target) { return [0,1]; }
> 
> // 2. Our Hidden Wrapper
> try {
>   const result1 = twoSum([2,7,11,15], 9);
>   if (JSON.stringify(result1) !== JSON.stringify([0,1])) throw Error("Failed");
>   
>   console.log("ALL_CASES_PASSED");
> } catch(err) {
>   console.log("ASSERTION_ERROR:" + err.message);
> }
> ```
> 
> **2. Execution via Piston API**
> Instead of executing this JS file directly on our backend (which is highly dangerous), we send this entire payload to the **Piston Code Execution Sandbox** via a REST API call. Piston spins up an isolated container, executes the Javascript safely, and returns the resulting `stdout` and `stderr` to our Node backend.
> 
> **3. Parsing the Output**
> Once the Piston API responds, our backend checks the standard output.
> - If `stderr` contains text (like a `ReferenceError`), the Judge returns `RUNTIME_ERROR`.
> - If `stdout` includes `"ALL_CASES_PASSED"`, the Judge returns `ACCEPTED`.
> - If `stdout` includes `"ASSERTION_ERROR"`, the Judge returns `WRONG_ANSWER`.
> 
> **Important Note for Production:** While this is a great MVP, it has security flaws if deployed as-is. Users could write an infinite `while(true)` loop to consume memory, and the hidden test cases could theoretically be logged by the user since they exist in the execution environment. A production-grade platform like LeetCode mitigates this by passing test inputs dynamically via `stdin` rather than hardcoding them into the executed file.

### Q: What kind of Data Structure is your `problemDatabase` object?
> It is a **Hash Map** (specifically, a nested JavaScript Object acting as a Dictionary). 
> - **The Key:** A unique string (the `problemSlug`, like `"two-sum"`).
> - **The Value:** A nested Object containing the `funcName` (string) and an Array of `TestCase` Objects.
> 
> **Why use this?** Because finding a problem by its slug (e.g., `problemDatabase["two-sum"]`) in a Hash Map is an **O(1) (Constant Time)** operation. If we stored problems in an Array, we would have to loop through the entire Array (`O(N)` linear time) every time a user submitted code just to find the right test cases. 

### Q: Why did you type your Hash Map as `Record<string, { funcName: string; testCases: TestCase[] }>`?
> In TypeScript, `Record<K, V>` is a built-in utility type that is the cleanest way to enforce the shape of a Dictionary or Hash Map. 
> - `K` is the type of the Keys (in this case, `string` for the problem slugs).
> - `V` is the type of the Values (in this case, the object containing `funcName` and `testCases`).
> 
> By strictly typing it this way, TypeScript guarantees that I can't accidentally add a problem to the database that is missing a `funcName`, and it guarantees I can't try to look up a problem using a Number instead of a String. It provides strict compile-time safety and perfect autocomplete!

### Q: In `const problem = problemDatabase[problemSlug];`, how does `problemSlug` map to `"two-sum"` if it is never defined outside the function?
> This comes down to how function arguments are passed down the chain in JavaScript! 
> When a user clicks submit in `battle.ts`, we call the main judge function and explicitly pass the string `"two-sum"` as the third argument: 
> `evaluateSubmission(code, "javascript", "two-sum");`
> 
> Inside `evaluateSubmission`, that third argument is received as the local variable `problemSlug`. 
> Then, `evaluateSubmission` calls `buildJavascriptWrapper(code, problemSlug);`, passing that exact same string down another level.
> 
> Finally, inside `buildJavascriptWrapper`, the local variable `problemSlug` holds the value `"two-sum"`. When we do `problemDatabase[problemSlug]`, JavaScript evaluates it exactly as if we typed `problemDatabase["two-sum"]`, which perfectly matches the Key in our Hash Map!

### Q: Why does the fetch call to `emkc.org/api/v2/piston/execute` not require an API Key? Is it secure?
> The team behind Piston (EMKC) generously hosts a **completely free, public, unauthenticated API endpoint**. You do not need an API key to use it!
> 
> Instead of using API keys, they protect their servers from abuse using **IP-based Rate Limiting**. If the same IP address (your Node.js backend) sends more than 5 code execution requests per second, Piston will temporarily ban your IP address and return HTTP 429 (Too Many Requests). 
> 
> This is perfectly fine for our MVP, but as soon as the platform scales to hundreds of concurrent users, we will exceed that 5 req/sec limit. At that point, we must stop using their public URL and spin up our own Piston Docker container.

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

## 14. Essential Docker Commands (Cheat Sheet)

If an interviewer asks how you deployed or containerized your application, or asks you to debug a container, these are the essential commands you should know:

### **Building & Running**
* `docker build -t algobattlebackend .` — Builds a Docker image from the `Dockerfile` in the current directory and tags it with the name `algobattlebackend`.
* `docker run -d -p 4000:4000 --env-file .env --name BattleContainer algobattlebackend` — Runs the container in detached mode (`-d`), maps port 4000 of your host to port 4000 of the container, injects your `.env` variables, and names the running container `BattleContainer`.

### **Managing Containers**
* `docker ps` — Lists all *currently running* containers.
* `docker ps -a` — Lists *all* containers (including stopped ones).
* `docker stop <container_name_or_id>` — Gracefully stops a running container.
* `docker rm -f <container_name_or_id>` — Forcefully removes a container.

### **Debugging & Inspection**
* `docker logs <container_name_or_id>` — Prints the console logs (like `console.log` or crash errors) generated by the application inside the container.
* `docker logs -f <container_name_or_id>` — "Follows" the logs in real-time (like tailing a log file).
* `docker exec -it <container_name_or_id> sh` — Opens an interactive shell terminal *inside* the running container (useful for inspecting files or running commands directly in the Linux environment). Type `exit` to get out.
* `docker images` — Lists all Docker images downloaded or built on your machine.

## 15. Docker Layers & Docker Hub

If an interviewer asks you what Docker Layers are or how pushing to Docker Hub works, use these concepts:

### **What is a Docker Layer?**
A Docker image is not built as one giant block. It is built step-by-step, like a stack of transparent sheets or pancakes. Every command in your `Dockerfile` creates a new "Layer" stacked on top of the previous one:
1. `FROM node:18-alpine` ➡️ **(Layer 1 - The Base OS)**
2. `WORKDIR /app` ➡️ **(Layer 2 - The Directory)**
3. `COPY package.json .` ➡️ **(Layer 3 - The Dependencies)**
4. `RUN npm install` ➡️ **(Layer 4 - The Installation)**
5. `COPY . .` ➡️ **(Layer 5 - Your Source Code)**

### **Why are Layers Significant?**
They make Docker incredibly fast and storage-efficient because of **Caching**. 
If you only change one line of code in `index.ts` and rebuild the image, Docker realizes the base OS and `npm install` layers haven't changed. It uses the cached versions of Layers 1-4 from memory, and *only* rebuilds Layer 5. This drops your build time from 3 minutes down to 1 second.

### **Docker vs Git Comparison**
The concept of pushing to Docker Hub is extremely similar to pushing to GitHub:

| Concept | In Git / GitHub | In Docker / Docker Hub |
| :--- | :--- | :--- |
| **The Hub** | **GitHub** (Stores your source code) | **Docker Hub** (Stores your compiled images) |
| **The Action** | `git push` (Uploads only new commits) | `docker push` (Uploads only new layers) |
| **The Tracking** | **Commits** (Git tracks text changes) | **Layers** (Docker tracks filesystem changes) |
| **The Baseline** | `git clone` (Downloads the repo) | `docker pull` (Downloads the image) |

Just like Git is smart enough not to re-upload your entire codebase every time you change one typo, Docker is smart enough not to re-upload the entire operating system every time you change one line of code!

## 16. Docker Networks & Volumes

As your application grows, you will eventually need multiple containers running at the same time (e.g., a Backend Container, a Frontend Container, and a Database Container). This introduces two new challenges:

### **1. Docker Networks (Communication)**
* **The Problem:** By default, containers are completely isolated. If your Backend Container tries to connect to a Database Container using `localhost:5432`, it will fail! Why? Because inside a container, `localhost` means *the container itself*, not your computer.
* **The Solution:** A **Docker Network**. By putting both containers on the same custom Docker Network, they can talk to each other using their container names instead of IP addresses. (e.g., The backend can connect to `mongodb://database_container:27017`).
* *Note on your project:* Your containerized AlgoBattle backend works perfectly right now because your Postgres and Redis databases are hosted in the cloud (NeonDB and Upstash). Your container just reaches out to the public internet! If you ever decide to host your own local databases in Docker, you will need a Docker Network.

### **2. Docker Volumes (Data Persistence)**
* **The Problem:** Containers are **ephemeral** (temporary). If you delete a Database container or it crashes, every single piece of data inside it is instantly wiped out. 
* **The Solution:** A **Docker Volume**. A volume punches a "hole" through the container into your actual computer's hard drive. It maps a folder inside the container (like `/var/lib/postgresql/data`) to a safe folder on your Windows machine. Now, even if you completely destroy and delete the database container, your data safely survives on your host machine's hard drive. When you spin up a new database container, it simply plugs back into that volume and picks up right where it left off!

### **3. Docker Compose (The Orchestrator)**
* **The Problem:** Typing out `docker network create...`, `docker volume create...`, and multiple massive `docker run` commands with 10 different flags every time you want to start your app is a nightmare.
* **The Solution:** **Docker Compose**. It allows you to write all of those messy commands into a single, clean `docker-compose.yml` file. 
* **The Magic:** By default, Docker Compose **automatically creates a custom network** and puts all services inside it. It also automatically provisions your requested volumes. Instead of typing 5 different commands, you just type **`docker-compose up`** to start your entire infrastructure, and **`docker-compose down`** to destroy it.

## 17. Docker Privileged Mode (Security & Sandboxing)

If an interviewer asks you about Docker Security or how your Piston Code Execution engine works, this is an advanced concept you should explain:

### **The Default Straitjacket**
By default, Docker places containers in a highly restrictive "straitjacket" to ensure security. A standard container is blocked from interacting with the host machine's deep kernel features (like creating new network interfaces, mounting system disks, or using advanced `cgroups`). This prevents a hacked container from taking over the entire host computer.

### **The Piston Problem**
Your application uses the **Piston API** to execute arbitrary, untrusted user code (like C++ or Python scripts submitted by players). 
To run this malicious code safely, Piston needs to create tiny, ultra-secure "mini-jails" (sandboxes) *inside* the Piston container itself. However, creating these mini-jails requires deep Linux kernel permissions (modifying namespaces and `cgroups`), which Docker blocks by default!

### **The Solution (`privileged: true`)**
In your `docker-compose.yml`, you must set `privileged: true` for the Piston service. This flag tells Docker: *"I trust this container completely. Take off the straitjacket and give it root-level access to the host machine's kernel features."* 
Without this flag, Piston does not have the authority to build its internal jails, and any attempt to execute user code will crash with `Read-Only File System` or `Permission Denied` errors.

## 18. Custom Private Rooms & Matchmaking Architecture

### Q: How did you implement Custom Private Rooms?
> "I created a custom lobby system using **Redis** and **WebSockets**. When a host creates a room, the backend generates a random **UUID v4** code and stores the host's details in a Redis key (`room:<UUID>`) with a 1-hour expiration time using `setEx`. This prevents memory bloat for abandoned rooms.
> 
> When a guest joins by entering the UUID, the backend looks up the key in Redis. If found, it immediately deletes the key from Redis (so no one else can join), initializes the `BattleState` in the Node.js memory just like Ranked matchmaking, and broadcasts a `lobby:matched` event to both the host and the guest, seamlessly transitioning them into the battle arena."

### Q: Why use Redis for private rooms instead of a local JavaScript Map?
> "While an in-memory Map works perfectly for a single server, storing room codes in Redis provides **scalability and persistence**. If the Node.js server crashes and restarts, an in-memory Map is completely wiped out, destroying all pending private rooms. Redis runs as a separate database, meaning the pending room codes safely survive server restarts.
> 
> More importantly, if we scaled to multiple backend servers behind a load balancer, a Map would trap the room code on one specific server. By using Redis, any backend server can verify the room code and instantly connect the players, making the system horizontally scalable."

## 19. TypeScript Strict Mode & Deployment

### Q: Why did the production build initially fail with `error TS18046: 'err' is of type 'unknown'` inside a try/catch block, and how did you fix it?
> "In older versions of TypeScript, the compiler assumed that any caught variable in a `catch(err)` block was automatically an `Error` object, allowing you to freely access `err.message`.
> 
> However, because JavaScript technically allows you to throw any primitive type (like `throw 5` or `throw "string"`), modern, strict TypeScript marks the caught variable as `unknown` to prevent runtime crashes. When the CI/CD pipeline on Render compiled the backend in strict mode, it threw a type error because a number or string wouldn't have a `.message` property. 
> 
> To fix this, I refactored the error handling to simply log the raw `err` object directly instead of assuming it had a `.message` property. This satisfied the strict type checker and allowed the production build to succeed securely."
