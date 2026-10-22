# Gamers'G — Frontend Client

Modern React + JavaScript (ESM) + Vite + Tailwind CSS frontend for the **Gamers'G** esports competitive platform.

## Features & Implemented Production Screens

- **Dual Theme Engine**:
  - **Esports High-Performance Dark**: Obsidian canvas (`#131318`), tactile card surfaces, electric violet (`#c4c0ff`), cyber teal (`#41eec2`), and neon glow accents.
  - **Apex Esports Luxury Light**: Crystalline stadium daylight (`#faf8ff`), frosted glassmorphic panels, and crisp borders.
  - Includes a one-click header Theme Toggle with smooth state persistence (`localStorage`).
- **Hero & Landing Page** (`/`):
  - Next-gen verified protocol badge, glowing cybernetic emblem, dynamic stats strip (14.2K Players, 840+ Teams, $250K+ Prizes), and live circuit match ticker.
- **Discovery Hub** (`/discovery`):
  - Scout active teams and upcoming tournaments with real-time text search and game filters (`Valorant`, `CS2`, `Apex Legends`, `Rocket League`).
- **Tournaments & Brackets** (`/tournaments`):
  - Prize vault highlights ($50,000 pool), tournament dates, and interactive semifinal / grand final visual bracket flow.
- **Team Roster & Recruitment** (`/teams`):
  - Active roster slots, open recruitment postings, and player pitch application modal.
- **Recruitment Pipeline** (`/applications`):
  - Visual 3-stage state machine tracker (`applied` → `shortlisted` → `accepted` | `rejected`).
- **Community Feed** (`/feed`):
  - Organization announcements, post creation, follow/unfollow toggle, and interaction metrics.
- **Live 1:1 Chat Drawer** (`/messages`):
  - Real-time Socket.io direct messaging with optimistic updates and sound visual telemetry.
- **Unified Authentication** (`/auth`):
  - Modal with Player, Organization, and Tournament Organizer signup and login flows.

## Quick Start

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server will start at `http://localhost:5173`. API requests and Socket.io events are proxied to the backend at `http://localhost:3000`.

## Production Build

```bash
npm run build
npm run preview
```
