# Gamers'G — Competitive Esports Platform

Full-stack esports platform with a React/Vite client and Express/PostgreSQL API. The repository is an active product build; follow the release checklist below before exposing a deployment to real users.

---

## 🏛️ Monorepo Architecture

```
Game-Ansh/
├── package.json                 # Monorepo root scripts (verify, dev, build, seed)
├── Backend/                     # Node.js + Express + PostgreSQL + Socket.io
│   ├── .env                     # Local environment configuration
│   ├── src/
│   │   ├── modules/             # Domain modules (auth, teams, orgs, players, recruitment, discovery, social, tournaments, admin)
│   │   ├── shared/              # Shared infrastructure (db, auth, redis, socket, ratelimit, errors, pagination)
│   │   ├── app.js               # Express application
│   │   └── server.js            # Server entry point & lifecycle
│   ├── seed.js                  # Database seeder across 6 titles
│   ├── setup-db.js              # Database creation & migration runner
│   └── verify-backend.js        # Backend verification test suite
├── frontend/                    # React 18 + Vite + Tailwind CSS (JavaScript)
│   ├── src/
│   │   ├── app/                 # App root & shell
│   │   ├── components/          # Layout (Navbar, MobileNav) and UI widgets
│   │   ├── features/            # Feature modules (landing, discovery, teams, dashboard, profile, social, recruitment, tournaments, auth, chat)
│   │   ├── hooks/               # Three.js particle galaxy & GSAP animation hooks
│   │   ├── lib/                 # API client & Socket.io client
│   │   ├── services/            # Backend API service integration layer
│   │   ├── stores/              # Context stores (gameStore, authContext, themeContext)
│   │   └── styles/              # Dual theme tokens & cyberpunk animations
│   └── vite.config.js           # Reverse proxy to :3000 & manual chunking
├── database/                    # SQL migrations and schema
│   └── migrations/              # 001_initial_schema.sql
├── docs/                        # Complete API & schema documentation
└── scripts/                     # Full-stack verification runners
```

---

## 🚀 Quick Start Commands (from Root)

### 1. Configure local services
```bash
cp Backend/.env.example Backend/.env
docker compose up -d postgres redis
npm run migrate
```
Set `DATABASE_URL` to the local database created by `docker-compose.yml`. Replace `JWT_SECRET` with a random value of at least 32 characters. Set `CORS_ORIGINS` to the exact browser origin(s), without a trailing slash.

### 2. Start Backend Server (Port 3000)
```bash
npm run dev:backend
# Or: npm run start:backend
```

### 3. Start Frontend Client (Port 5173)
```bash
npm run dev:frontend
```

### 4. Build Production Frontend Bundle
```bash
npm run build:frontend
```

### 5. Load development fixtures (optional)
```bash
ALLOW_DEMO_SEED=true npm run seed
```
Demo accounts and data are for local development only. The seed command refuses to run unless explicitly opted into and will never run in production. Create an administrator with `ADMIN_EMAIL` and `ADMIN_PASSWORD` using `npm --prefix Backend run seed:admin`; the password must be set in your local environment and is never printed.

## Before a production launch

- Use managed PostgreSQL and Redis with TLS, private networking, automated backups, and a tested restore procedure. Run `npm run migrate` as a release step using a least-privilege migration account.
- Set `NODE_ENV=production`, `JWT_SECRET` (32+ random characters), `CORS_ORIGINS`, `DATABASE_URL`, `REDIS_URL`, and `TRUST_PROXY` for the actual hosting topology. Never use the development `.env.example` values in production.
- Serve the frontend and API over HTTPS. Restrict database, Redis, and API ingress; configure monitoring, logs, alerting, and a rollback path.
- Configure durable private object storage and access controls for verification documents. The current local uploads directory is not shared or durable across instances.
- Complete email verification and password recovery, and replace the remaining demo-backed dashboard, tournament bracket, and verification flows before public launch.
- Build the frontend with `npm run build:frontend`; `/health` is a liveness check and `/ready` checks database readiness.

---

## 🎮 Supported Titles & Ecosystem
* ⚡ **VALORANT** (Riot Games — Tactical FPS)
* 🔫 **BGMI** (Krafton — Battle Royale)
* 🔥 **Free Fire** (Garena — Battle Royale)
* 🏰 **Clash of Clans** (Supercell — Strategy)
* 👑 **Clash Royale** (Supercell — Strategy / Card)
* 💀 **Call of Duty** (Activision — FPS / Warzone)

---

Demo accounts are created only by the explicitly opted-in development seeder. The seeder credentials are not valid defaults for production.

