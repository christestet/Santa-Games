import express from "express";
import cors from "cors";
import fs from "node:fs";
import { promises as fsPromises } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import rateLimit from "express-rate-limit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 2412;
const MAX_SCORES = parseInt(process.env.MAX_SCORES) || 50;
const SCORES_DIR = path.join(__dirname, "data");
const SCORES_FILE = path.join(SCORES_DIR, "scores.json");
const GAME_DEADLINE = new Date('2026-01-01T00:00:00+01:00');

let isHealthy = true;

// Check if games are still playable
const isGamePlayable = () => {
  return new Date().getTime() < GAME_DEADLINE.getTime();
};

// In-memory cache for optimized performance
const cache = {
  scores: null,
  scoresTop10: null,
  etag: null,
  etagTop10: null,
  lastModified: null,
  lastModifiedTop10: null,
  lastFileModified: null,
};

// Helper to invalidate cache
const invalidateCache = () => {
  cache.scores = null;
  cache.scoresTop10 = null;
  cache.etag = null;
  cache.etagTop10 = null;
  cache.lastModified = null;
  cache.lastModifiedTop10 = null;
  console.log("🗑️  Cache invalidated");
};

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || true,
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json({ limit: "10kb" }));

// Rate limiters
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: { error: "🎅 Whoa there! Even Santa's elves need a break!" },
});

const scoreLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: {
    error: "🎅 Slow down! You're submitting faster than Rudolph can fly!",
  },
});

app.use("/api/", generalLimiter);

// Serve static frontend files from 'dist' directory
const DIST_PATH = path.join(__dirname, "dist");
if (fs.existsSync(DIST_PATH)) {
  app.use(
    express.static(DIST_PATH, {
      setHeaders: (res, filePath) => {
        if (filePath.includes("/assets/")) {
          // Cache hashed assets (JS, CSS, Images, Fonts) for 1 year
          res.setHeader(
            "Cache-Control",
            "public, max-age=31536000, immutable"
          );
        } else {
          // Don't cache index.html so users always get the latest version
          res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
        }
      },
    })
  );
}

// Initialize scores file
const initializeScores = async () => {
  if (!fs.existsSync(SCORES_DIR)) {
    await fsPromises.mkdir(SCORES_DIR, { recursive: true });
  }

  if (!fs.existsSync(SCORES_FILE)) {
    await fsPromises.writeFile(
      SCORES_FILE,
      JSON.stringify(
        [
          { name: "Santa", score: 500, time: 60, timestamp: Date.now() },
          { name: "Rudolph", score: 400, time: 60, timestamp: Date.now() },
          { name: "Elf", score: 300, time: 60, timestamp: Date.now() },
        ],
        null,
        2
      )
    );
    console.log("🎁 Santa's initial leaderboard created!");
  }
};

// Safe async read helper
const readScores = async () => {
  try {
    if (!fs.existsSync(SCORES_FILE)) return [];
    const data = await fsPromises.readFile(SCORES_FILE, "utf8");
    if (!data.trim()) return [];
    return JSON.parse(data);
  } catch (err) {
    console.warn(
      "⚠️  Santa's list got scrambled! scores.json is corrupt. Starting with empty sleigh.",
      err
    );
    return [];
  }
};

// Safe async write helper
const writeScores = async (scores) => {
  await fsPromises.writeFile(SCORES_FILE, JSON.stringify(scores, null, 2));
};

// Helper to generate ETag from data
const generateETag = (data) => {
  const hash = createHash("md5").update(JSON.stringify(data)).digest("hex");
  return `"${hash}"`;
};

// Input validation helpers
const hasSuspiciousPatterns = (str) => {
  const patterns =
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|SCRIPT)\b|--|;|\/\*|\*\/|<script|javascript:)/i;
  return patterns.test(str);
};

const sanitizeName = (name) => {
  return String(name)
    .trim()
    .replace(/<[^>]*>?/gm, "") // Strip HTML
    .replace(/[^a-zA-Z0-9\s._-]/g, "") // Allow only safe characters
    .substring(0, 15); // Max 15 chars
};

// Routes
app.get("/api/", (req, res) => {
  res.send(
    "Hey you naughty dev! Wrong route - now you're on Santa's root blacklist!"
  );
});

app.get("/api/health", (req, res) => {
  if (!isHealthy) {
    return res.status(500).json({
      status: "unhealthy",
      message: "🎅 Santa's workshop is closed for repairs!",
      timestamp: new Date().toISOString(),
    });
  }

  res.json({
    status: "healthy",
    message: "🎅 Santa's workshop is running smoothly!",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    hint: "Looking for the root of all presents? Try /api/",
  });
});

app.post("/api/toggle-health", (req, res) => {
  isHealthy = !isHealthy;
  console.log(`🔧 Health status toggled to: ${isHealthy ? "HEALTHY" : "UNHEALTHY"}`);
  res.json({ success: true, isHealthy });
});

app.get("/api/scores", async (req, res) => {
  const showAll = req.query.all === 'true';
  console.log(`🎄 Checking Santa's nice list... (all=${showAll})`);

  try {
    // Check file modification time for cache invalidation
    const stats = fs.existsSync(SCORES_FILE)
      ? await fsPromises.stat(SCORES_FILE)
      : null;
    const fileMtime = stats ? stats.mtime.getTime() : 0;

    // Invalidate cache if file was modified
    if (cache.lastFileModified !== fileMtime) {
      invalidateCache();
      cache.lastFileModified = fileMtime;
    }

    // Use appropriate cache based on request type
    const cacheKey = showAll ? 'scores' : 'scoresTop10';
    const etagKey = showAll ? 'etag' : 'etagTop10';
    const modifiedKey = showAll ? 'lastModified' : 'lastModifiedTop10';

    // Build cache if needed
    if (!cache[cacheKey]) {
      const scores = await readScores();
      const sortedScores = scores.sort((a, b) => b.score - a.score);

      const resultScores = showAll
        ? sortedScores.map(({ name, score, time, timestamp }) => ({ name, score, time, timestamp }))
        : sortedScores
            .slice(0, 10)
            .map(({ name, score, time, timestamp }) => ({ name, score, time, timestamp }));

      cache[cacheKey] = resultScores;
      cache[etagKey] = generateETag(resultScores);
      cache[modifiedKey] = resultScores.length > 0
        ? new Date(Math.max(...resultScores.map(s => s.timestamp || 0)))
        : new Date();

      console.log(`💾 Cache built for ${cacheKey} (${resultScores.length} scores)`);
    }

    const resultScores = cache[cacheKey];
    const etag = cache[etagKey];
    const lastModified = cache[modifiedKey];

    // Adaptive cache duration based on game state
    const cacheMaxAge = isGamePlayable() ? 30 : 3600; // 30s during game, 1h after

    // Set cache headers
    res.setHeader("Cache-Control", `public, max-age=${cacheMaxAge}, must-revalidate`);
    res.setHeader("ETag", etag);
    res.setHeader("Last-Modified", lastModified.toUTCString());

    // Check if client has cached version
    const clientETag = req.headers["if-none-match"];
    const clientModified = req.headers["if-modified-since"];

    if (clientETag === etag || (clientModified && new Date(clientModified) >= lastModified)) {
      console.log("✨ 304 Not Modified (client cache hit)");
      return res.status(304).end();
    }

    console.log(`📊 200 OK - returning ${resultScores.length} scores from memory cache`);
    res.json(resultScores);
  } catch (err) {
    console.error("❌ The elves dropped the leaderboard!", err);
    res
      .status(500)
      .json({ error: "Santa's workshop is having technical difficulties!" });
  }
});

app.post("/api/scores", scoreLimiter, async (req, res) => {
  let { name, score, time } = req.body;
  console.log(`🎁 New score delivery attempt: ${name} with ${score} points (Time: ${time}s)`);

  try {
    // Validation
    if (!name || score === undefined) {
      return res
        .status(400)
        .json({
          error: "No name tag on this present! Name and score required.",
        });
    }

    // Sanitize name
    name = sanitizeName(name);

    if (!name) {
      return res
        .status(400)
        .json({ error: "That name won't fit on Santa's list!" });
    }

    // Check for suspicious patterns
    if (hasSuspiciousPatterns(name)) {
      console.warn(`🚨 Suspicious input detected: ${req.body.name}`);
      return res
        .status(400)
        .json({
          error: "🚫 Nice try, but Santa's security elves caught that!",
        });
    }

    // Validate score
    score = parseInt(score, 10);
    if (isNaN(score) || score < 0 || score > 1000000) {
      return res
        .status(400)
        .json({ error: "That score is faker than Rudolph's nose!" });
    }

    // Validate time (optional but suggested to be a number if present)
    if (time !== undefined) {
      time = parseInt(time, 10);
      if (isNaN(time) || time < 0) {
         // We can treat invalid time as undefined or default, or error out. 
         // Let's just ignore it if invalid or treat as undefined.
         time = undefined;
      }
    }

    // Read existing scores
    let scores = await readScores();

    // Check for duplicate recent submission
    const now = Date.now();
    const isDuplicateRecent = scores.some(
      (s) =>
        s.name === name &&
        s.score === score &&
        now - (s.timestamp || 0) < 5000 // within 5 seconds
    );

    if (isDuplicateRecent) {
      return res
        .status(429)
        .json({
          error: "🎅 You just submitted that! Give the elves a moment!",
        });
    }

    // Add new score with timestamp
    scores.push({ name, score, time, timestamp: now });

    // Keep only top scores
    const topScores = scores
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_SCORES);

    // Save to file
    await writeScores(topScores);

    // Invalidate cache after new score
    invalidateCache();

    console.log(
      `✨ ${name} made it onto Santa's nice list with ${score} points!`
    );
    res.json({ success: true, message: "Score saved to Santa's list! 🎄" });
  } catch (err) {
    console.error("❌ The elves couldn't wrap this score:", err);
    res
      .status(500)
      .json({ error: "Santa's workshop is backed up! Try again later." });
  }
});

// 404 Handler
app.use((req, res) => {
  res
    .status(404)
    .json({
      error: "🎄 This route doesn't exist! Did you get lost in the snow?",
    });
});

// Error handling middleware
app.use((err, req, res, _next) => {
  console.error("🔥 Santa's workshop caught fire:", err);
  res
    .status(500)
    .json({ error: "Something went wrong at the North Pole! 🎅❌" });
});

// Start server
const startServer = async () => {
  await initializeScores();

  let version = "unknown";
  try {
    const packageJson = JSON.parse(
      await fsPromises.readFile(path.join(__dirname, "package.json"), "utf8")
    );
    version = packageJson.version;
  } catch (_err) {
    console.warn("⚠️ Could not read package.json version");
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `\x1b[32m%s\x1b[0m`,
      `🎅 Ho ho ho! Santa's Score Server is up and running!`
    );
    console.log(`📦 Version: ${version}`);
    console.log(
      `🎄 Leaderboard available at: http://localhost:${PORT}/api/scores`
    );
    console.log(`🔔 Jingle all the way to victory!`);
    console.log(`⚡ Environment: ${process.env.NODE_ENV || "development"}`);
  });

  // Graceful shutdown
  const gracefulShutdown = (signal) => {
    console.log(
      `\n🎄 ${signal} received. Santa is closing the workshop for the night...`
    );
    server.close(async () => {
      console.log("✨ All connections closed. Workshop is shut down!");
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error(
        "⚠️  Forced shutdown - some elves didn't finish in time!"
      );
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
};

startServer().catch((err) => {
  console.error("❌ Failed to start Santa's workshop:", err);
  process.exit(1);
});