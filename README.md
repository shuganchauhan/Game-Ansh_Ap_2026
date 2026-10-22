# Gamers'G — Production Competitive Esports Platform

Full-stack production-ready esports competitive platform with LinkedIn-style professional networking for gamers, organization verification, multi-game squad management, and real-time tournaments.

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

### 1. Verify Full-Stack & Database Health
```bash
npm run verify
```
Runs the 6-point verification suite:
* PostgreSQL connection to `off_ground`
* `GET /health`
* `GET /discovery/teams`
* `GET /discovery/tournaments`
* `POST /auth/login` (Player JWT)
* `POST /auth/login` (Org JWT)

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

### 5. Seed / Reset Database
```bash
npm run seed
# Or: npm run setup:db
```

---

## 🎮 Supported Titles & Ecosystem
* ⚡ **VALORANT** (Riot Games — Tactical FPS)
* 🔫 **BGMI** (Krafton — Battle Royale)
* 🔥 **Free Fire** (Garena — Battle Royale)
* 🏰 **Clash of Clans** (Supercell — Strategy)
* 👑 **Clash Royale** (Supercell — Strategy / Card)
* 💀 **Call of Duty** (Activision — FPS / Warzone)

---

## 🔑 Default Seeded Test Accounts

| Role | Email | Password | Details |
|---|---|---|---|
| **Platform Admin** | `admin@gamersg.com` | `Password123!` | Platform Compliance & Verification Portal |
| **Pro Player** | `vortex@gamersg.com` | `Password123!` | Alex "Vortex" (Immortal 3 / Conqueror) |
| **Esports Org** | `management@s8ul.gg` | `Password123!` | S8UL Esports (Verified Organization) |
| **Tournament Organizer** | `admin@skyesports.in` | `Password123!` | Skyesports Hub (Verified Scrim Host) |

