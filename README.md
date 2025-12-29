# Santa Games 🎅

> A festive arcade game collection featuring bilingual support, dual themes, and competitive leaderboards

![Version](https://img.shields.io/badge/version-4.1.1-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D22.x-brightgreen.svg)
![React](https://img.shields.io/badge/react-19.2.0-61dafb.svg?logo=react)

![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6.svg?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.2-646cff.svg?logo=vite)
![Docker](https://img.shields.io/badge/Docker-ready-2496ed.svg?logo=docker)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development](#development)
  - [Production Build](#production-build)
- [Deployment](#deployment)
  - [Docker Deployment](#docker-deployment)
  - [Cloudflare Tunnel + Proxy Setup](#cloudflare-tunnel--proxy-setup)
- [API Documentation](#api-documentation)
- [Game Configuration](#game-configuration)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Overview

Santa Games is a Christmas-themed arcade game collection built with modern web technologies. Players can enjoy multiple festive mini-games with full bilingual support (German/English), switch between classic Christmas and Grinch themes, and compete on a persistent leaderboard system.

The project demonstrates advanced React patterns with a multi-context architecture, a production-ready Express API backend with intelligent caching, and containerized deployment with Docker.

**Available Games:**
- **Snowball Hunt**: Target shooting with dynamic difficulty scaling
- **Gift Toss**: Physics-based throwing mechanics with gravity simulation
- *(Reindeer Run is currently deactivated)*

## Features

### 🎮 Games
- **Snowball Hunt**: Click-based target elimination with progressive difficulty
- **Gift Toss**: Physics-based projectile game with gravity mechanics
- Configurable game mechanics via centralized config system

### 🌍 Internationalization
- Bilingual support (German/English)
- Translation system with 100+ localized strings
- Context-based language switching with localStorage persistence
- Random Christmas jokes and sayings in both languages

### 🎨 Theming
- Dual theme system: Classic Christmas and Grinch
- Theme persistence across sessions
- Dynamic styling with Tailwind CSS 4.x

### 🏆 Leaderboard System
- Persistent high scores with timestamps and completion times
- RESTful API with rate limiting (100 req/min general, 10 req/min submission)
- Intelligent caching with ETag and Last-Modified headers
- Auto-retry mechanism for failed submissions (3 attempts with exponential backoff)
- React 19 useTransition for smooth, non-blocking updates
- POST responses include updated scores (eliminates race conditions)
- Top 10 or full leaderboard views
- Input sanitization and suspicious pattern detection
- File locking prevents data corruption under concurrent load
- Configurable reverse proxy support (Cloudflare, nginx, Traefik, Apache, etc.) with real client IP detection

### ⚙️ Game Settings
- Adjustable timer (30s/60s/90s/120s)
- Sound effects toggle
- Settings persistence via GameContext

### 🔊 Audio
- Background music (Suno AI generated Christmas carol)
- Mute/unmute controls
- JetBrains Mono font for retro aesthetic

## Tech Stack

### Frontend
- **React 19.2.0** - Latest React with concurrent rendering features
- **TypeScript 5.9.3** - Type-safe development
- **Vite 7.2.4** - Lightning-fast build tool with HMR
- **Tailwind CSS 4.1.18** - Utility-first CSS with Vite plugin
- **React 19 useTransition** - Non-blocking state updates for smooth UX

### Backend
- **Express 5.2.1** - Modern Node.js server framework
- **express-rate-limit 8.2.1** - Request throttling with Cloudflare support
- **proper-lockfile 4.1.2** - File locking for concurrent write protection
- **CORS** - Configurable cross-origin resource sharing
- **File-based persistence** - JSON storage with intelligent caching

### DevOps
- **Docker** - Multi-stage containerization with Node 22-alpine
- **Cloudflare Tunnel** - Secure zero-trust access
- **Traefik** - Optional reverse proxy for multi-service deployments
- **ESLint 9.x** - Code quality and consistency
- **Concurrently** - Parallel dev server execution

### Architecture Patterns
- Context API for state management (4 nested providers)
- Custom hooks (`useHighScores`, `useLanguage`, etc.)
- Path aliases for clean imports
- Environment-aware configuration
- Proxy-aware rate limiting with real client IP detection

## Architecture

### Context Provider Hierarchy

The application uses a multi-layered context architecture for separation of concerns:

```
┌─────────────────────────────────────────┐
│         ThemeProvider (Outer)           │  → Theme switching (classic/grinch)
│  ┌───────────────────────────────────┐  │     localStorage: 'santa-game-theme'
│  │        SoundProvider              │  │  → Audio playback & mute state
│  │  ┌─────────────────────────────┐  │  │
│  │  │    LanguageProvider         │  │  │  → Bilingual support (de/en)
│  │  │  ┌───────────────────────┐  │  │  │     t() translation function
│  │  │  │   GameProvider        │  │  │  │     localStorage: 'santa-game-lang'
│  │  │  │  ┌─────────────────┐  │  │  │  │
│  │  │  │  │      App        │  │  │  │  │  → Central game state manager
│  │  │  │  │   Components    │  │  │  │  │     Game state machine
│  │  │  │  └─────────────────┘  │  │  │  │     Score tracking
│  │  │  └───────────────────────┘  │  │  │     useHighScores integration
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**Context loading order** (outer to inner): ThemeProvider → SoundProvider → LanguageProvider → GameProvider

### GameContext: Central State Manager

GameContext consolidates all game-related state and actions:
- **State machine**: `menu` → `playing` → `name-entry` → `gameover`
- **Game selection**: `snowball` | `gift-toss` | `reindeer-run`
- **Actions**: pause, resume, restart, quit, score submission
- **Settings**: timer duration, sound preferences
- **Integration**: useHighScores hook for API communication with auto-retry

**Design pattern**: Game components receive state and callbacks as props from GameContext rather than managing local state, ensuring single source of truth.

### Backend Architecture

```
┌──────────────────────────────────────────────┐
│           Express Server (Port 2412)         │
├──────────────────────────────────────────────┤
│  Configurable Proxy Support                   │
│  - Direct connection mode (default)          │
│  - Cloudflare: cf-connecting-ip              │
│  - nginx/Apache: x-real-ip, x-forwarded-for  │
├──────────────────────────────────────────────┤
│  Static File Serving (/dist)                 │
│  - Hashed assets: 1 year cache               │
│  - index.html: no-cache                      │
├──────────────────────────────────────────────┤
│  API Endpoints                                │
│  - GET  /api/scores (ETag, Last-Modified)    │
│  - POST /api/scores (Rate limited: 10/min)   │
│  - GET  /api/health (Healthcheck)            │
├──────────────────────────────────────────────┤
│  Middleware                                   │
│  - CORS (configurable origin)                │
│  - Rate limiting (100/min general, 10/min    │
│    score submission) with real client IP     │
│  - Input sanitization                        │
│  - Suspicious pattern detection              │
│  - File locking (prevents race conditions)   │
├──────────────────────────────────────────────┤
│  Persistence Layer                            │
│  - scores.json (top 50 scores per category)  │
│  - In-memory cache with invalidation         │
│  - Adaptive cache duration (30s/1h)          │
│  - ETag-based HTTP caching                   │
└──────────────────────────────────────────────┘
```

### Configuration System

- **Game mechanics**: `/src/constants/gameConfig.ts` - All tunable values (timers, physics, spawn rates, points)
- **App config**: `/src/config.ts` - Environment-aware API URLs
- **Translations**: `/src/constants/gameTexts.ts` - All UI strings in de/en
- **Path aliases**: `@/`, `@components/`, `@assets/`, `@constants/`, `@hooks/`, `@types/`

## Getting Started

### Prerequisites

- **Node.js**: >= 22.x (tested with 22.18.0)
- **npm**: >= 10.x (tested with 10.9.3)
- **Git**: For cloning the repository

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/christestet/Santa-Games.git
   cd Santa-Games
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

### Development

#### Option 1: Frontend Only (API mocked or unavailable)
```bash
npm run dev
```
- Frontend runs on `http://localhost:5173`
- Leaderboard features may not work without backend

#### Option 2: Full Stack Development
```bash
npm run dev:full
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:2412`
- Runs both servers concurrently

#### Option 3: Separate Terminals
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
npm run server
```

### Production Build

```bash
# Build frontend
npm run build

# Preview production build
npm run preview

# Serve production build with backend
npm run server
```

The production build will be output to `/dist` directory.

## Deployment

### Docker Deployment

#### Multi-Stage Build Process

The project uses a two-stage Dockerfile optimized for production:

1. **Builder stage**: Installs all dependencies and builds the Vite production bundle
2. **Runner stage**: Minimal production image with only runtime dependencies

#### Build and Run

```bash
# Build image
docker build -t santa-games:4.1.1 .

# Run container
docker run -d \
  -p 2412:2412 \
  -v $(pwd)/data:/app/data \
  --name santa-games \
  santa-games:4.1.1
```

#### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `2412` | Server port inside container |
| `NODE_ENV` | `production` | Node environment |
| `TZ` | `Europe/Berlin` | Timezone for timestamps |
| `MAX_SCORES` | `50` | Maximum scores to persist per category |
| `FRONTEND_URL` | `http://localhost:5173` | CORS allowed origin |
| `LOCK_DIR` | `/tmp` | Directory for file lock files |
| `TRUST_PROXY` | `false` | Enable proxy support (`true`/`false`) |
| `REAL_IP_HEADER` | `none` | Header for real client IP (see [Proxy Setup](#reverse-proxy-configuration)) |

#### Docker Features

- **Non-root user**: Runs as `santa` user for security
- **Health checks**: Native Node.js healthcheck (no curl dependency)
- **Graceful shutdown**: SIGTERM/SIGINT handlers with 10s timeout
- **Volume support**: Mount `/app/data` for score persistence
- **Cache optimization**: Granular static asset caching (hashed assets: 1 year, index.html: no-cache)

#### Health Check

```bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' santa-games

# Manual health check
curl http://localhost:2412/api/health
```

---

### Reverse Proxy Configuration

**By default**, Santa Games runs in **direct connection mode** (no proxy) for maximum security. If you deploy behind a reverse proxy (Cloudflare, nginx, Traefik, Apache, etc.), you need to configure proxy support.

#### Why Configure Proxies?

Rate limiting uses client IP addresses. Without proper configuration:
- ❌ All users share the same rate limit (proxy IP is used)
- ✅ With correct setup: Each user gets their own rate limit

#### Configuration by Deployment Type

##### 1. Direct Connection (Default - No Proxy)

**No configuration needed!** The app works out-of-the-box.

```bash
# .env - leave proxy settings commented out
# TRUST_PROXY=true
# REAL_IP_HEADER=cf-connecting-ip
```

Server logs show:
```
🔒 Trust proxy disabled (direct connection mode)
```

---

##### 2. Cloudflare Tunnel / Cloudflare Access

**Infrastructure**: User → CF Access → CF Tunnel → Docker Container

**Configuration**:
```env
# .env
TRUST_PROXY=true
REAL_IP_HEADER=cf-connecting-ip
```

**Docker Compose Example**:
```yaml
services:
  santa-app:
    build: .
    environment:
      - TRUST_PROXY=true
      - REAL_IP_HEADER=cf-connecting-ip
    volumes:
      - ./data:/app/data
    restart: unless-stopped

  cloudflared:
    image: cloudflare/cloudflared:latest
    command: tunnel run
    environment:
      - TUNNEL_TOKEN=${CF_TUNNEL_TOKEN}
    depends_on:
      - santa-app
```

Server logs show:
```
🔒 Trust proxy enabled. Using header: cf-connecting-ip
```

---

##### 3. nginx or Apache Reverse Proxy

**Infrastructure**: User → nginx/Apache → Docker Container

**nginx configuration** (add to your server block):
```nginx
location / {
    proxy_pass http://santa-app:2412;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

**Application configuration**:
```env
# .env
TRUST_PROXY=true
REAL_IP_HEADER=x-real-ip
```

Alternatively, use `x-forwarded-for` if your nginx doesn't set `x-real-ip`.

---

##### 4. Traefik Reverse Proxy

**Infrastructure**: User → Traefik → Docker Container

**Docker Compose Example**:
```yaml
services:
  santa-app:
    build: .
    environment:
      - TRUST_PROXY=true
      - REAL_IP_HEADER=x-forwarded-for
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.santa.rule=Host(`santa.example.com`)"
    restart: unless-stopped
```

See `docker-compose.example.yml` for complete multi-service setup.

---

##### 5. Cloudflare + Traefik (Multi-Proxy Stack)

**Infrastructure**: User → CF → CF Tunnel → Traefik → Docker

Use Cloudflare's header as it's closest to the client:
```env
TRUST_PROXY=true
REAL_IP_HEADER=cf-connecting-ip
```

---

#### Rate Limiting Behavior

Rate limits are applied **per real client IP**, not per proxy IP:

| Scenario | Behavior |
|----------|----------|
| 20 users, different IPs | ✅ Each gets 10 submissions/min |
| 20 users, same IP (NAT) | ⚠️ Share 10 submissions/min pool |
| Auto-retry enabled | ✅ Retries up to 3x with backoff |

#### Testing Your Setup

```bash
# 1. Check service health
curl https://your-domain.com/api/health

# 2. Verify proxy configuration in logs
docker logs santa-app | grep "Trust proxy"
# Expected: "🔒 Trust proxy enabled. Using header: cf-connecting-ip"

# 3. Test rate limiting (should limit after 10 requests)
for i in {1..15}; do
  curl -X POST https://your-domain.com/api/scores \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","score":100,"time":60}'
done
```

Expected: First 10 succeed, next 5 get rate limited (`429 Too Many Requests`).

#### Troubleshooting

**Issue**: All users share same rate limit

**Solutions**:
1. **Check server startup logs**:
   ```bash
   docker logs santa-app | head -20
   ```
   Should show: `🔒 Trust proxy enabled. Using header: <your-header>`

2. **Verify environment variables**:
   ```bash
   docker exec santa-app env | grep TRUST_PROXY
   docker exec santa-app env | grep REAL_IP_HEADER
   ```

3. **Check proxy headers** (from inside container):
   ```bash
   # Add temporary logging to server.js:
   console.log('Headers:', req.headers);
   ```
   Look for your configured header (`cf-connecting-ip`, `x-real-ip`, etc.)

4. **Common mistakes**:
   - ❌ `TRUST_PROXY=false` but `REAL_IP_HEADER` is set → Won't work
   - ❌ Wrong header name → Falls back to proxy IP
   - ❌ Proxy doesn't forward headers → Configure nginx/Traefik correctly

**Debugging via logs**:
```bash
docker logs -f santa-app
# Look for: "🎁 New score delivery attempt: ..."
# Different users should show different IPs
```

---

## API Documentation

Base URL: `http://localhost:2412/api` (development) or `/api` (production)

### Endpoints

#### GET /api/scores
Fetch high scores from the leaderboard.

**Query Parameters:**
- `all` (optional): Set to `true` to fetch all scores (default: top 10 per category)

**Response Headers:**
- `Cache-Control`: Adaptive caching (30s during gameplay, 1h after game deadline)
- `ETag`: Hash of score data for conditional requests
- `Last-Modified`: Timestamp of most recent score

**Response:**
```json
[
  {
    "name": "Santa",
    "score": 500,
    "time": 60,
    "timestamp": 1735315200000
  }
]
```

**Status Codes:**
- `200 OK`: Scores returned
- `304 Not Modified`: Client cache is up-to-date
- `500 Internal Server Error`: Server error

---

#### POST /api/scores
Submit a new score to the leaderboard.

**Rate Limit:** 10 requests per minute per IP (based on real client IP)

**Request Body:**
```json
{
  "name": "Player",
  "score": 450,
  "time": 60
}
```

**Validation:**
- `name`: Required, max 15 characters, alphanumeric + spaces/dots/dashes/underscores only
- `score`: Required, integer 0-1,000,000
- `time`: Optional, integer >= 0 (game duration: 30, 60, 90, or 120)

**Input Sanitization:**
- HTML tags stripped
- SQL injection patterns blocked
- Suspicious keywords flagged (`SELECT`, `SCRIPT`, etc.)
- Duplicate submission detection (5-second window)

**Response:**
```json
{
  "success": true,
  "message": "Score saved to Santa's list! 🎄",
  "scores": [
    {
      "name": "Player",
      "score": 450,
      "time": 60,
      "timestamp": 1735315200000
    }
  ]
}
```

**New in v3.4.0**: Response includes updated top 10 scores, eliminating the need for a separate GET request.

**Status Codes:**
- `200 OK`: Score saved successfully
- `400 Bad Request`: Validation error or suspicious input
- `429 Too Many Requests`: Rate limit exceeded or duplicate submission
- `503 Service Unavailable`: File lock timeout (auto-retry enabled on client)
- `500 Internal Server Error`: Server error

**Auto-Retry**: Frontend automatically retries failed submissions up to 3 times with exponential backoff (1s, 2s, 3s).

---

#### GET /api/health
Health check endpoint for monitoring and Docker healthcheck.

**Response:**
```json
{
  "status": "healthy",
  "message": "🎅 Santa's workshop is running smoothly!",
  "timestamp": "2025-12-29T12:00:00.000Z",
  "uptime": 3600.5
}
```

**Status Codes:**
- `200 OK`: Service is healthy
- `500 Internal Server Error`: Service is unhealthy

### Rate Limiting

| Endpoint | Limit | Window | IP Detection |
|----------|-------|--------|--------------|
| `/api/*` (general) | 100 requests | 1 minute | Real client IP |
| `POST /api/scores` | 10 requests | 1 minute | Real client IP |

**Real IP Detection** (configurable via `TRUST_PROXY` and `REAL_IP_HEADER`):
- **Direct mode** (default): Uses `req.ip`
- **Proxy mode**: Uses configured header (`cf-connecting-ip`, `x-real-ip`, `x-forwarded-for`, etc.)
- See [Reverse Proxy Configuration](#reverse-proxy-configuration) for setup details

### Caching Strategy

1. **In-memory cache**: Scores cached in server memory with ETag generation
2. **Cache invalidation**: Automatic on new score submission or file modification
3. **Conditional requests**: Supports `If-None-Match` (ETag) and `If-Modified-Since`
4. **Adaptive duration**: 30s during active gameplay, 1 hour after game deadline (Jan 1, 2026)

### Concurrency & Data Integrity

1. **File Locking**: Uses `proper-lockfile` to prevent race conditions during concurrent writes
   - 5 retries with 100-500ms backoff
   - 10-second stale lock timeout
2. **Client-side Auto-Retry**: Frontend retries on 503/500 errors (3 attempts with exponential backoff)
3. **Optimized Response**: POST returns updated scores, eliminating race conditions between write and read

### Error Responses

All errors return JSON with an `error` field:
```json
{
  "error": "🚫 Nice try, but Santa's security elves caught that!"
}
```

## Game Configuration

All game mechanics are centralized in `/src/constants/gameConfig.ts` for easy tuning.

### Configuration Structure

```typescript
export const GAME_CONFIG: GameSettings = {
  TIMER: 60,  // Game duration in seconds
  POINTS: {
    REGULAR: 100,   // Points for regular targets
    BONUS: 250,     // Points for bonus targets
    COAL: -50,      // Penalty for coal
  },
  PHYSICS: {
    GRAVITY: 0.4,          // Gravity strength
    THROW_VELOCITY: 4,     // Initial throw speed
    PROJECTILE_SPEED: 0.08 // Horizontal projectile movement
  },
  SNOWBALL_HUNT: {
    FREEZE_DURATION: 3000,      // Freeze effect duration (ms)
    SPAWN_RATE_BASE: 700,       // Initial spawn rate (ms)
    SPAWN_RATE_MIN: 400,        // Minimum spawn rate (ms)
    TARGET_MAX_AGE_BASE: 3000,  // Initial target lifetime (ms)
    TARGET_MAX_AGE_MIN: 1500    // Minimum target lifetime (ms)
  },
  GIFT_TOSS: {
    COOLDOWN: 400,            // Throw cooldown (ms)
    GIFT_SIZE: 40,            // Gift hitbox size (px)
    CHIMNEY_HEIGHT: 80,       // Chimney height (px)
    SPAWN_RATE_CHIMNEY: 4000, // Chimney spawn interval (ms)
    SPAWN_RATE_OBSTACLE: 3500 // Obstacle spawn interval (ms)
  }
}
```

### Customization Example

To make Gift Toss easier:
1. Open `/src/constants/gameConfig.ts`
2. Modify values:
   ```typescript
   GIFT_TOSS: {
     COOLDOWN: 300,  // Faster throwing (was 400)
     CHIMNEY_HEIGHT: 100,  // Bigger targets (was 80)
   }
   ```
3. Restart dev server

**Important**: Avoid hardcoding values in game components. Always reference `GAME_CONFIG`.

## Project Structure

```
santa-games/
├── src/
│   ├── assets/                   # Static assets
│   │   ├── JetBrainsMono-Regular.woff2  # Font file
│   │   └── pixel-snowfall-carol.mp3     # Background music
│   ├── components/               # React components
│   │   ├── GameProvider.tsx      # Central game state manager
│   │   ├── GameContext.tsx       # Context definition
│   │   ├── SnowballHunt.tsx      # Snowball Hunt game
│   │   ├── GiftToss.tsx          # Gift Toss game
│   │   ├── ReindeerRun.tsx       # Reindeer Run (deactivated)
│   │   ├── Leaderboard.tsx       # Score display
│   │   ├── GameSettings.tsx      # Settings panel
│   │   ├── ThemeContext.tsx      # Theme provider
│   │   ├── SoundContext.tsx      # Audio provider
│   │   ├── LanguageProvider.tsx  # i18n provider
│   │   └── ui/                   # Reusable UI components
│   ├── constants/
│   │   ├── gameConfig.ts         # Game mechanics configuration
│   │   ├── gameConstants.ts      # Game deadline & constants
│   │   └── gameTexts.ts          # Translation strings
│   ├── hooks/
│   │   └── useHighScores.ts      # API integration with auto-retry
│   ├── types/                    # TypeScript type definitions
│   ├── config.ts                 # Environment configuration
│   ├── main.tsx                  # App entry point with providers
│   └── App.tsx                   # Main application component
├── server.js                     # Express API server with proxy support
├── Dockerfile                    # Multi-stage container build
├── docker-compose.example.yml    # Example Docker Compose configs
├── vite.config.js                # Vite configuration with aliases
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies and scripts
├── CLAUDE.md                     # AI assistant project guide
├── LICENSE                       # MIT License + asset attribution
└── README.md                     # This file
```

## Troubleshooting

### Audio Playback Issues

If you encounter errors related to audio playback, particularly errors mentioning:
```
Uncaught (in promise) Error: A listener indicated an asynchronous response by returning true,
but the message channel closed before a response was received
```

**Cause**: This is typically caused by browser extensions (especially ad blockers, privacy extensions, or security extensions) that intercept audio playback or media requests.

**Solution**:
1. **Disable browser extensions temporarily**: Try disabling all extensions and testing the game
2. **Use a clean browser profile**: Create a new browser profile without any extensions installed
3. **Whitelist the application**: Add the game URL to your extension's whitelist/allowlist
4. **Test in incognito/private mode**: Extensions are often disabled by default in private browsing

**Common culprits**:
- uBlock Origin, AdBlock Plus (ad blockers)
- Privacy Badger, Ghostery (privacy extensions)
- NoScript, ScriptSafe (security extensions)

**Note**: The application's error handling for audio playback is working correctly. The error originates from browser extensions interfering with the Web Audio API and HTMLAudioElement, not from the application code itself.

---

### Score Submission Failures

**Issue**: Score submissions fail with 503 errors

**Cause**: File lock contention under heavy load

**Solution**: Auto-retry is already enabled (3 attempts with exponential backoff)
- Check browser console for: `🔄 Retrying submission...`
- If retries fail, wait 60 seconds and try again (rate limit reset)

---

### All Users Share Same Rate Limit

**Issue**: Multiple users from different locations share a rate limit

**Cause**: Proxy configuration not set up correctly

**Solution**: See the comprehensive [Reverse Proxy Configuration](#reverse-proxy-configuration) section, particularly the [Troubleshooting](#troubleshooting) subsection.

**Quick checks**:
1. Verify `TRUST_PROXY=true` and `REAL_IP_HEADER` are set in your `.env` file
2. Check server startup logs: `docker logs santa-app | grep "Trust proxy"`
3. Ensure your reverse proxy (nginx, Traefik, etc.) forwards the correct headers

---

## Contributing

Contributions are welcome! This project is intended for educational and festive purposes.

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**: Follow existing code patterns
4. **Test thoroughly**: Run both frontend and backend in dev mode
5. **Lint your code**: `npm run lint`
6. **Commit your changes**: Use clear, descriptive commit messages
7. **Push to your fork**: `git push origin feature/amazing-feature`
8. **Open a Pull Request**: Describe your changes and motivation

### Code Style

- Use TypeScript for type safety
- Follow existing naming conventions
- Use path aliases (`@components/`, `@constants/`, etc.)
- Keep game logic separate from UI components
- Reference `GAME_CONFIG` for all tunable values
- Add translations for new UI strings in both German and English

### Adding a New Game

1. Create game component in `/src/components/YourGame.tsx`
2. Add game type to `GameType` union in `GameContext.tsx`
3. Game receives props: `onGameOver(score, joke)`, `settings`, `isPaused`, `onPause`
4. Add game-specific config to `GAME_CONFIG` in `/src/constants/gameConfig.ts`
5. Create game card in `App.tsx` menu
6. Add translations in `/src/constants/gameTexts.ts`

### Reporting Issues

- Use GitHub Issues
- Include browser/Node.js version
- Describe steps to reproduce
- Attach screenshots if applicable

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Third-party assets** (font and music) are subject to separate licenses. See the LICENSE file for attribution details.

---

Made with ❄️ for the holidays by [Christoph Kempe](https://github.com/christestet)
