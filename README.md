# ⚔️ AlgoBattle Arena

AlgoBattle Arena is a real-time multiplayer coding competition platform where developers battle head-to-head to solve algorithmic challenges as fast as possible. 

> ⚡ **Built via Vibecoding:** This entire full-stack platform was rapidly prototyped and built using advanced AI agentic coding ("vibecoding").

## 🔗 Live Links
- **Frontend App (Play Now!):** [https://algo-battle-arena-frontend.vercel.app](https://algo-battle-arena-frontend.vercel.app)
- **Backend API:** [https://algo-battle-arena.onrender.com](https://algo-battle-arena.onrender.com)
- **Execution Engine:** AWS EC2 Instance (Port 2000)

## 🚀 Features
- **Real-Time Matchmaking:** Queue up and instantly connect with opponents globally via WebSockets.
- **Live Code Execution:** Write code in the browser and safely execute it against hidden test cases.
- **ELO Rating System:** Gain rating points for winning battles and climb the global leaderboard.
- **Bot Battles:** Practice your skills by battling against intelligent automated bots with varying difficulty levels.
- **Modern UI/UX:** Sleek, dark-mode focused aesthetic with glassmorphism and real-time animations.

## 🏗️ Architecture & Tech Stack

This platform is powered by a robust, highly scalable microservices-inspired architecture.

### Frontend (Client)
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS + Vanilla CSS for dynamic animations
- **State Management:** React Hooks
- **Hosting:** Vercel

### Backend (Server)
- **Runtime:** Node.js + Express
- **Real-Time Communication:** Socket.io (with secure cookie-based handshakes)
- **Database:** PostgreSQL (Hosted on Neon DB) for users, problems, and battle history.
- **Caching & Pub/Sub:** Redis (Hosted on Upstash) for ultra-fast matchmaking queues and leaderboard caching.
- **Authentication:** JWT (Access & Refresh tokens) with HttpOnly cookies.
- **Hosting:** Render

### Execution Engine (Sandboxed Environment)
- **Engine:** Piston (Dockerized Sandbox)
- **Hosting:** Dedicated AWS EC2 Instance (Ubuntu)
- **Features:** Safely isolates and executes untrusted user code in milliseconds, supporting multiple languages.

## 📚 Interview Guide
A comprehensive technical deep-dive and system design interview guide has been created for this project. 

It covers architectural decisions, scaling strategies, database schemas, and how complex problems (like strict TypeScript errors and CORS) were solved during deployment.

👉 **[Read the System Design Interview Guide (interview.md)](./interview.md)**

## 💻 Running Locally

1. Clone the repository.
2. Set up a PostgreSQL database and a Redis instance.
3. Configure the `.env` files in both `/frontend` and `/backend`.
4. Run `npm install` and `npm run dev` in both directories.
5. Spin up a local Piston docker container mapping to port 2000.
