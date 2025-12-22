# Build Stage
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production Stage
FROM node:20-slim
WORKDIR /app

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Create a non-root user for security
RUN groupadd -r santa && useradd -r -g santa santa

# Copy only necessary files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./
COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev

# Ensure scores.json exists and has correct permissions
RUN touch scores.json && chown santa:santa scores.json

# Use non-root user
USER santa

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/api/health || exit 1

CMD ["node", "server.js"]
