# Build Stage
FROM node:24-slim AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
# Use npm ci to pin packages exactly as specified in lockfile
RUN npm ci

# Build application
COPY . .
RUN npm run build

# Production Stage
FROM node:24-slim AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=2412 \
    TZ=Europe/Berlin

# Create non-root user (Debian syntax for slim image)
RUN groupadd -r santa && useradd -r -g santa santa

# Copy dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy build artifacts and server script
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./

# Setup data file
RUN touch scores.json && chown santa:santa scores.json

# Switch to non-root user
USER santa

EXPOSE $PORT

# Native Node.js Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:$PORT/api/health', (res) => { \
    if (res.statusCode !== 200) { console.error('Health check failed: ' + res.statusCode); process.exit(1); } \
    process.exit(0); \
    }).on('error', (err) => { console.error(err); process.exit(1); })"

CMD ["node", "server.js"]
