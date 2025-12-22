import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const SCORES_FILE = path.join(__dirname, "scores.json");

app.use(cors());
app.use(express.json());

// Serve static frontend files from 'dist' directory
const DIST_PATH = path.join(__dirname, "dist");
if (fs.existsSync(DIST_PATH)) {
  app.use(express.static(DIST_PATH));
}

// Load scores or create initial file
if (!fs.existsSync(SCORES_FILE)) {
  fs.writeFileSync(
    SCORES_FILE,
    JSON.stringify([
      { name: "Santa", score: 500 },
      { name: "Rudolph", score: 400 },
      { name: "Elf", score: 300 },
    ])
  );
}

// Safe read helper
const readScores = () => {
  if (!fs.existsSync(SCORES_FILE)) return [];
  try {
    const data = fs.readFileSync(SCORES_FILE, "utf8");
    if (!data.trim()) return [];
    return JSON.parse(data);
  } catch {
    console.warn(
      "Warning: Could not parse scores.json (empty or corrupt). Returning empty list."
    );
    return [];
  }
};

app.get("/api/scores", (req, res) => {
  console.log("GET /api/scores - Loading leaderboard");
  try {
    const scores = readScores();
    res.json(scores.sort((a, b) => b.score - a.score).slice(0, 10));
  } catch (err) {
    console.error("Error reading scores:", err);
    res.status(500).json({ error: "Error Reading Scores" });
  }
});

app.post("/api/scores", (req, res) => {
  let { name, score } = req.body;
  console.log(`POST /api/scores - Entry: ${name} (${score})`);
  try {
    if (!name || score === undefined) {
      return res.status(400).json({ error: "Name and score are required" });
    }

    // Sanitization & Validation
    // 1. Name: limit length, strip HTML, allow only safe characters
    name = String(name)
      .trim()
      .replace(/<[^>]*>?/gm, "") // Strip HTML
      .replace(/[^a-zA-Z0-9\s._-]/g, "") // Allow only alphanumeric, space, dot, underscore, hyphen
      .substring(0, 15); // Max 15 chars

    if (!name) {
      return res.status(400).json({ error: "Invalid name" });
    }

    // 2. Score: ensure number, max value, integer
    score = parseInt(score, 10);
    if (isNaN(score) || score < 0 || score > 1000000) {
      return res.status(400).json({ error: "Invalid score value" });
    }

    let scores = readScores();

    scores.push({ name, score });
    const topScores = scores.sort((a, b) => b.score - a.score).slice(0, 50);

    fs.writeFileSync(SCORES_FILE, JSON.stringify(topScores, null, 2));

    console.log(`Score saved successfully: ${name} - ${score}`);
    res.json({ success: true });
  } catch (err) {
    console.error("Error saving score:", err);
    res.status(500).json({ error: "Error Saving Score" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`\x1b[32m%s\x1b[0m`, `SANTA-SERVER active!`);
  console.log(`Top scores reachable at: http://localhost:${PORT}/api/scores`);
});
