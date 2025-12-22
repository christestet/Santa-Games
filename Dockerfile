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

# Create a non-root user for security
RUN groupadd -r santa && useradd -r -g santa santa

# Copy only necessary files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./
COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev

# Ensure scores.json exists and has correct permissions
# We'll initialize it in the volume, but here we set up the dir
RUN touch scores.json && chown santa:santa scores.json

# Use non-root user
USER santa

EXPOSE 3001
CMD ["node", "server.js"]
