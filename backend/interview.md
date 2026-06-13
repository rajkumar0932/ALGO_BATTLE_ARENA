# Backend Interview Prep — AlgoBattle Project

---

## Q1: Why TypeScript over JavaScript?

### Key Points

| | JavaScript | TypeScript |
|---|---|---|
| Typing | Dynamic (runtime) | Static (compile-time) |
| Errors caught | At runtime | At compile time |
| IDE Support | Basic | Full IntelliSense, autocomplete |
| Refactoring | Risky | Safe — type system finds all affected files |
| Learning curve | Low | Slightly higher, but pays off |

### 1. Static Typing
- Explicitly define the shape of data — no surprises at runtime.
- TypeScript catches `undefined is not a function` **before** you deploy.

```ts
// JS: fails silently at runtime
function greet(user) {
  return user.name.toUpperCase(); // crashes if user is null
}

// TS: caught at compile time
function greet(user: { name: string }): string {
  return user.name.toUpperCase();
}
```

### 2. Better IDE Support
- Full autocomplete on objects, function params, return types.
- Hover to see types — no need to jump to docs.
- Go-to-definition works across the whole codebase.

### 3. Catch Errors Early
- Compile-time error detection = fewer production bugs.
- Especially valuable in teams — everyone agrees on the contract.

### 4. Easier Refactoring
- Rename a field and TypeScript shows every place that breaks.
- Safe to change code without fear of missing usages.

### 5. Self-Documenting Code
```ts
// Types ARE the documentation
async function createUser(data: {
  email: string;
  password: string;
  username: string;
}): Promise<User> { ... }
```

### Interview One-Liner
> *"TypeScript adds static typing on top of JavaScript, catching bugs at compile time instead of runtime — making large codebases safer and easier to maintain."*

---

## Q2: How did you connect your backend to PostgreSQL?

### What I used
- **`pg`** — official Node.js PostgreSQL client
- **`dotenv`** — load `DATABASE_URL` from `.env`
- **Connection Pool** — reuse connections instead of opening a new one per query

### Code

```ts
// src/config/db.ts
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
```

```ts
// src/index.ts
import { pool } from "./config/db";

async function start() {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("Database connected:", result.rows[0]);
    app.listen(3000, () => console.log("Server on port 3000"));
  } catch (err) {
    console.error("DB connection failed:", err);
    process.exit(1); // don't start server if DB is down
  }
}
```

### Why a Pool and not a single Client?
- A single `Client` holds one connection — can only run one query at a time.
- A `Pool` manages multiple connections — handles concurrent requests efficiently.
- PostgreSQL default limit is 100 connections; pool reuses them.

### Interview One-Liner
> *"I used the `pg` library with a connection pool so the server can handle multiple concurrent queries efficiently. The database URL is stored in `.env` and never hardcoded."*

---

## Q3: Why Express?

- Minimal, unopinionated Node.js web framework.
- Huge ecosystem — middleware for auth, cors, logging, etc.
- Easy to structure with routers for large apps.
- Alternatives: Fastify (faster), NestJS (structured/opinionated).

---

## Q4: What is `dotenv` and why use it?

- Loads environment variables from a `.env` file into `process.env`.
- Keeps secrets (DB passwords, API keys) out of source code.
- Never commit `.env` — add it to `.gitignore`.

```bash
# .env
DATABASE_URL=postgresql://user:password@localhost:5432/algobattle
PORT=4000
```

---

## Common Follow-up Questions

| Question | Short Answer |
|---|---|
| What's the difference between `any` and `unknown` in TypeScript? | `any` disables type checking. `unknown` is safe — you must narrow the type before using it. |
| What is `async/await`? | Syntactic sugar over Promises — makes async code read like sync code. |
| What happens if the DB connection fails? | Call `process.exit(1)` — don't run the server without a database. |
| How do you prevent SQL injection? | Use parameterized queries: `pool.query("SELECT * FROM users WHERE id = $1", [id])` |
| What is CORS? | Cross-Origin Resource Sharing — browser security that blocks frontend (port 3000) from calling backend (port 4000) unless explicitly allowed. Use the `cors` npm package. |

---

## Q5: Why PostgreSQL over MongoDB?

### The Core Difference

| | PostgreSQL | MongoDB |
|---|---|---|
| Type | Relational (SQL) | Document (NoSQL) |
| Data shape | Tables with fixed schema | JSON-like documents, flexible schema |
| Relationships | JOINs — foreign keys enforced | Embed or reference manually |
| Transactions | Full ACID support | ACID since v4.0 (limited) |
| Query language | SQL (standardised) | MongoDB Query Language |
| Best for | Structured, relational data | Unstructured, rapidly changing data |

### Why PostgreSQL made sense for AlgoBattle

AlgoBattle has **highly relational data**:

```
User ──< Battle >── User
          │
          └──< Submission >── Problem
```

- A **User** has many **Battles**
- A **Battle** has two **Users** and one **Problem**
- A **Battle** has many **Submissions**

These relationships are natural in SQL — enforced with foreign keys and queried with JOINs. In MongoDB you'd have to manage these references manually with no enforcement.

### 1. Data Integrity
- PostgreSQL enforces **foreign keys** — you can't create a Battle with a non-existent User ID.
- MongoDB has no built-in referential integrity — you can have orphaned documents silently.

```sql
-- PostgreSQL: this will throw an error if user_id doesn't exist
INSERT INTO battles (player1_id, player2_id) VALUES (999, 888);
-- ERROR: insert or update on table "battles" violates foreign key constraint
```

### 2. ACID Transactions
- When a battle ends, you need to update the winner's rating, loser's rating, and the battle record **atomically** — either all succeed or none do.
- PostgreSQL guarantees this. MongoDB's multi-document transactions exist but are slower and less mature.

```ts
// PostgreSQL atomic transaction
await pool.query("BEGIN");
await pool.query("UPDATE users SET rating = $1 WHERE id = $2", [newRating, winnerId]);
await pool.query("UPDATE battles SET status = 'completed' WHERE id = $1", [battleId]);
await pool.query("COMMIT");
```

### 3. Complex Queries
- Leaderboard = rank users by rating with filters. Easy with SQL `ORDER BY`, `WHERE`, `LIMIT`.
- In MongoDB the same query requires the aggregation pipeline — more verbose and harder to optimise.

```sql
-- Clean SQL leaderboard
SELECT username, rating, wins, losses
FROM users
ORDER BY rating DESC
LIMIT 50;
```

### 4. Schema as Documentation
- A strict schema means every developer knows exactly what columns exist and their types.
- MongoDB's flexible schema sounds nice but leads to inconsistent documents in production.

### When MongoDB wins
- You don't know your data shape yet (prototyping fast).
- Data is truly document-like with no relationships (e.g. logs, CMS content).
- You need horizontal sharding at massive scale from day one.

### Interview One-Liner
> *"PostgreSQL was the right choice because AlgoBattle has strongly relational data — users, battles, and submissions are all connected. SQL gives us enforced foreign keys, ACID transactions for rating updates, and clean JOINs for the leaderboard. MongoDB would have required managing those relationships manually with no safety net."*

---

## Q6: Why do we store the Refresh Token in the database, but not the Access Token?

### The Core Difference

- **Access Token:** Short-lived (e.g., 15 minutes), stateless, and self-verifiable (via JWT signature).
- **Refresh Token:** Long-lived (e.g., 7 days), stateful, and used to get new Access Tokens.

### Why store the Refresh Token in the database?
1. **Validation & Tracking:** We need to know if a specific refresh token is still valid, who it belongs to, and from which device they logged in.
2. **Revocation (Logging out):** If a user logs out, or if their account is compromised, we can simply delete or invalidate the refresh token in the database. Without this, the token would remain valid until it expires.
3. **Rotation (Security):** When a refresh token is used to get a new access token, we can issue a *new* refresh token and invalidate the old one (Refresh Token Rotation). This prevents replay attacks if a token is stolen.

### Why NOT store the Access Token?
1. **Performance:** Access tokens are checked on *every single request* to protected routes. If we checked the database every time, it would bottleneck the server.
2. **Self-Verifiable:** Because it is a signed JWT, the server can verify it mathematically (using the `ACCESS_TOKEN_SECRET`) without needing a database lookup. By keeping it short-lived, the security risk of it being stolen is minimized.

### Interview One-Liner
> *"We store the refresh token in the database because we need to be able to revoke it, track it, and rotate it for security. We don't store the access token because it's designed to be stateless and self-verifiable to ensure high performance on every API request."*

---

## Q7: What is a Timing Attack and how did you prevent it?

### What is a Timing Attack?

A timing attack is a type of **side-channel attack** where an attacker measures how long the server takes to respond to a request, and uses that information to extract sensitive data.

### The Vulnerability in Login

Consider a naive login flow:

```ts
// ❌ VULNERABLE — different response times reveal information
const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

if (!user.rows[0]) {
    throw new ApiError(400, "User not found");  // ⚡ Fast: ~50ms (no bcrypt)
}

const valid = await bcrypt.compare(password, user.rows[0].password);

if (!valid) {
    throw new ApiError(400, "Invalid credentials"); // 🐢 Slow: ~250ms (bcrypt ran)
}
```

The problem:
| Scenario | Time | What attacker learns |
|---|---|---|
| Email doesn't exist | ~50ms (fast) | ✅ "This email is NOT registered" |
| Email exists, wrong password | ~250ms (slow) | ✅ "This email IS registered!" |

An attacker sends thousands of requests with different emails and measures response times. The slow ones reveal **valid accounts** — which can then be targeted with brute-force password attacks.

### The Fix: Always Run bcrypt

```ts
// ✅ SAFE — constant time regardless of user existence
const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

const DUMMY_HASH = "$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345";
const valid = await bcrypt.compare(
    password,
    user.rows[0]?.password || DUMMY_HASH  // Always runs bcrypt!
);

if (!user.rows[0] || !valid) {
    throw new ApiError(400, "Invalid credentials"); // Same message for both cases
}
```

Now both paths take the same ~250ms because `bcrypt.compare()` runs regardless.

### Three Rules for Timing-Safe Authentication

1. **Always run the expensive operation** — compare against a dummy hash if the user doesn't exist.
2. **Use the same error message** — `"Invalid credentials"` for both wrong email AND wrong password, so the attacker can't distinguish.
3. **Use constant-time comparison** — `bcrypt.compare()` is already constant-time internally, but for raw string comparisons use `crypto.timingSafeEqual()`.

### Where Else Timing Attacks Apply
- **API key validation** — don't short-circuit on the first wrong character.
- **Token comparison** — comparing refresh tokens should use `crypto.timingSafeEqual()`.
- **OTP verification** — same principle: always compare the full code.

### Interview One-Liner
> *"In our login flow, I always run bcrypt.compare() even when the user doesn't exist, using a dummy hash. This ensures the response time is identical whether the email is valid or not, preventing attackers from enumerating accounts through timing differences."*
