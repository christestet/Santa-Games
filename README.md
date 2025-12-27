# Santa Games 🎅

> A festive arcade game collection featuring bilingual support, dual themes, and competitive leaderboards

![Version](https://img.shields.io/badge/version-3.0.2-blue.svg)
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
- [Docker Deployment](#docker-deployment)
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
- RESTful API with rate limiting (100 req/min general, 5 req/min submission)
- Intelligent caching with ETag and Last-Modified headers
- Top 10 or full leaderboard views
- Input sanitization and suspicious pattern detection

### ⚙️ Game Settings
- Adjustable timer (30s/45s/60s)
- Sound effects toggle
- Settings persistence via GameContext

### 🔊 Audio
- Background music (Suno AI generated Christmas carol)
- Mute/unmute controls
- JetBrains Mono font for retro aesthetic

## Tech Stack

### Frontend
- **React 19.2.0** - Latest React with concurrent features
- **TypeScript 5.9.3** - Type-safe development
- **Vite 7.2.4** - Lightning-fast build tool with HMR
- **Tailwind CSS 4.1.18** - Utility-first CSS with Vite plugin

### Backend
- **Express 5.2.1** - Modern Node.js server framework
- **express-rate-limit** - Request throttling and abuse prevention
- **CORS** - Configurable cross-origin resource sharing
- **File-based persistence** - JSON storage for scores

### DevOps
- **Docker** - Multi-stage containerization with Node 24-slim
- **ESLint 9.x** - Code quality and consistency
- **Concurrently** - Parallel dev server execution

### Architecture Patterns
- Context API for state management (4 nested providers)
- Custom hooks (`useHighScores`, `useLanguage`, etc.)
- Path aliases for clean imports
- Environment-aware configuration

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
- **Integration**: useHighScores hook for API communication

**Design pattern**: Game components receive state and callbacks as props from GameContext rather than managing local state, ensuring single source of truth.

### Backend Architecture

```
┌──────────────────────────────────────────────┐
│           Express Server (Port 3001)         │
├──────────────────────────────────────────────┤
│  Static File Serving (/dist)                 │
│  - Hashed assets: 1 year cache               │
│  - index.html: no-cache                      │
├──────────────────────────────────────────────┤
│  API Endpoints                                │
│  - GET  /api/scores (ETag, Last-Modified)    │
│  - POST /api/scores (Rate limited: 5/min)    │
│  - GET  /api/health (Healthcheck)            │
├──────────────────────────────────────────────┤
│  Middleware                                   │
│  - CORS (configurable origin)                │
│  - Rate limiting (100/min general)           │
│  - Input sanitization                        │
│  - Suspicious pattern detection              │
├──────────────────────────────────────────────┤
│  Persistence Layer                            │
│  - scores.json (top 50 scores)               │
│  - In-memory cache with invalidation         │
│  - Adaptive cache duration                   │
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
- Backend API: `http://localhost:3001`
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

## Docker Deployment

### Multi-Stage Build Process

The project uses a two-stage Dockerfile optimized for production:

1. **Builder stage**: Installs all dependencies and builds the Vite production bundle
2. **Runner stage**: Minimal production image with only runtime dependencies

### Build and Run

```bash
# Build image
docker build -t santa-games:3.0.2 .

# Run container
docker run -d \
  -p 3001:2412 \
  -v $(pwd)/data:/app/data \
  --name santa-games \
  santa-games:3.0.2
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `2412` | Server port inside container |
| `NODE_ENV` | `production` | Node environment |
| `TZ` | `Europe/Berlin` | Timezone for timestamps |
| `MAX_SCORES` | `50` | Maximum scores to persist |
| `FRONTEND_URL` | `true` | CORS allowed origin |

### Docker Features

- **Non-root user**: Runs as `santa` user for security
- **Health checks**: Native Node.js healthcheck (no curl dependency)
- **Graceful shutdown**: SIGTERM/SIGINT handlers with 10s timeout
- **Volume support**: Mount `/app/data` for score persistence
- **Cache optimization**: Granular static asset caching (hashed assets: 1 year, index.html: no-cache)

### Health Check

```bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' santa-games

# Manual health check
curl http://localhost:3001/api/health
```

## API Documentation

Base URL: `http://localhost:3001/api` (development) or `/api` (production)

### Endpoints

#### GET /api/scores
Fetch high scores from the leaderboard.

**Query Parameters:**
- `all` (optional): Set to `true` to fetch all scores (default: top 10)

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

**Rate Limit:** 5 requests per minute per IP

**Request Body:**
```json
{
  "name": "Player",
  "score": 450,
  "time": 55
}
```

**Validation:**
- `name`: Required, max 15 characters, alphanumeric + spaces/dots/dashes/underscores only
- `score`: Required, integer 0-1,000,000
- `time`: Optional, integer >= 0

**Input Sanitization:**
- HTML tags stripped
- SQL injection patterns blocked
- Suspicious keywords flagged (`SELECT`, `SCRIPT`, etc.)
- Duplicate submission detection (5-second window)

**Response:**
```json
{
  "success": true,
  "message": "Score saved to Santa's list! 🎄"
}
```

**Status Codes:**
- `200 OK`: Score saved successfully
- `400 Bad Request`: Validation error or suspicious input
- `429 Too Many Requests`: Rate limit exceeded or duplicate submission
- `500 Internal Server Error`: Server error

---

#### GET /api/health
Health check endpoint for monitoring and Docker healthcheck.

**Response:**
```json
{
  "status": "healthy",
  "message": "🎅 Santa's workshop is running smoothly!",
  "timestamp": "2025-12-27T12:00:00.000Z",
  "uptime": 3600.5
}
```

**Status Codes:**
- `200 OK`: Service is healthy
- `500 Internal Server Error`: Service is unhealthy

### Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/*` (general) | 100 requests | 1 minute |
| `POST /api/scores` | 5 requests | 1 minute |

### Caching Strategy

1. **In-memory cache**: Scores cached in server memory with ETag generation
2. **Cache invalidation**: Automatic on new score submission or file modification
3. **Conditional requests**: Supports `If-None-Match` (ETag) and `If-Modified-Since`
4. **Adaptive duration**: 30s during active gameplay, 1 hour after game deadline (Jan 1, 2026)

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
│   │   ├── GameContext.tsx       # Central game state manager
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
│   │   └── gameTexts.ts          # Translation strings
│   ├── hooks/
│   │   └── useHighScores.ts      # API integration hook
│   ├── types/                    # TypeScript type definitions
│   ├── config.ts                 # Environment configuration
│   ├── main.tsx                  # App entry point with providers
│   └── App.tsx                   # Main application component
├── server.js                     # Express API server
├── Dockerfile                    # Multi-stage container build
├── vite.config.js                # Vite configuration with aliases
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies and scripts
├── CLAUDE.md                     # AI assistant project guide
├── LICENSE                       # MIT License + asset attribution
└── README.md                     # This file
```

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
