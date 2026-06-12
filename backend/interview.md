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
