# 🚀 Deployment Guide (2025)

## Infrastructure Options

Your app runs behind **CF Access → CF Tunnel → Traefik → Docker**. Here's what makes sense for different scenarios:

---

## Option 1: Simple Setup (RECOMMENDED for single app)

**Stack:**
```
User → CF Access (DE Bypass) → CF Tunnel → Docker Container
```

**Why?**
- ✅ No unnecessary complexity
- ✅ Lower latency (one less proxy)
- ✅ CF Tunnel handles routing directly

**Setup:**

### 1. Dockerfile
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 2412
CMD ["node", "server.js"]
```

### 2. docker-compose.yml
```yaml
version: '3.8'

services:
  santa-app:
    build: .
    container_name: santa-app
    ports:
      - "2412:2412"
    environment:
      - NODE_ENV=production
      - PORT=2412
    restart: unless-stopped

  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: cloudflared
    command: tunnel run
    environment:
      - TUNNEL_TOKEN=${CF_TUNNEL_TOKEN}
    depends_on:
      - santa-app
    restart: unless-stopped
```

### 3. CF Tunnel Config
```yaml
# /etc/cloudflared/config.yml
tunnel: <your-tunnel-id>
credentials-file: /etc/cloudflared/credentials.json

ingress:
  - hostname: santa-games.yourdomain.com
    service: http://santa-app:2412
  - service: http_status:404
```

---

## Option 2: Multi-Service Setup (if you run multiple apps)

**Stack:**
```
User → CF Access → CF Tunnel → Traefik → Multiple Containers
```

**When to use:**
- You have multiple apps/services
- You want centralized routing
- You need load balancing

**Setup:** See `docker-compose.example.yml` in repo

**Traefik Labels Required:**
```yaml
labels:
  - "traefik.http.middlewares.cf-headers.headers.customrequestheaders.X-Forwarded-For="
  - "traefik.http.middlewares.cf-headers.headers.customrequestheaders.X-Real-IP="
  # CF-Connecting-IP is automatically forwarded
```

---

## Rate Limiting Configuration

### How it works with proxies:

**Header Priority:**
1. `CF-Connecting-IP` (Cloudflare's real client IP) ✅ **Used for rate limiting**
2. `X-Forwarded-For` (from Traefik)
3. `req.ip` (fallback for local dev)

**Code (already configured in server.js):**
```javascript
// Trust proxy headers
app.set('trust proxy', true);

// Rate limiter uses CF header
keyGenerator: (req) => req.headers['cf-connecting-ip'] || req.ip
```

### Current Limits:
- **General API:** 100 requests/min per IP
- **Score Submissions:** 10 submissions/min per IP

---

## Testing in Production

### 1. Check Headers
```bash
curl https://santa-games.yourdomain.com/api/debug/headers
```

**Expected Response:**
```json
{
  "message": "🔍 Header Debug Info",
  "rateLimitKey": "1.2.3.4",
  "headers": {
    "cf-connecting-ip": "1.2.3.4",
    "x-forwarded-for": "1.2.3.4",
    "x-real-ip": "1.2.3.4",
    "cf-access-authenticated-user-email": null,
    "req.ip": "1.2.3.4"
  },
  "hint": "This shows which IP will be used for rate limiting"
}
```

### 2. Test Rate Limiting
```bash
# Send 15 requests quickly (should rate limit after 10)
for i in {1..15}; do
  curl -X POST https://santa-games.yourdomain.com/api/scores \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Test\",\"score\":100,\"time\":60}"
done
```

**Expected:**
- Requests 1-10: ✅ Success
- Requests 11-15: ⚠️ Rate limited

---

## Environment Variables

### Required:
```bash
# Production
NODE_ENV=production
PORT=2412

# Cloudflare Tunnel (Option 1)
CF_TUNNEL_TOKEN=eyJh...

# Optional (for multi-origin CORS)
FRONTEND_URL=https://santa-games.yourdomain.com
```

### Optional:
```bash
# Maximum scores to store per category
MAX_SCORES=50

# Lock file directory (for Docker)
LOCK_DIR=/tmp
```

---

## CF Access Configuration

### Bypass Rule for Germany:
1. Go to Cloudflare Zero Trust Dashboard
2. Access → Applications → Select your app
3. Add Bypass Rule:
   ```
   Country: Germany
   Action: Bypass
   ```

### Headers Set by CF Access:
- `CF-Access-Authenticated-User-Email` (if authenticated)
- `CF-Access-JWT-Assertion` (JWT token)

**Note:** For Germany bypass, these headers won't be present.

---

## Monitoring

### Health Check:
```bash
curl https://santa-games.yourdomain.com/api/health
```

### Server Logs:
```bash
# Docker logs
docker logs -f santa-app

# Look for:
# "🎁 New score delivery attempt: ..."
# "✨ User made it onto Santa's nice list"
# "🚨 Suspicious input detected"
```

---

## Security Checklist

- ✅ `trust proxy` enabled for correct IP detection
- ✅ Rate limiting per real client IP (not proxy IP)
- ✅ Input sanitization for score submissions
- ✅ File locking prevents data corruption
- ✅ CF Access for authentication (Germany bypass)
- ✅ Suspicious pattern detection (SQL injection, XSS)

---

## Troubleshooting

### Issue: All users share same rate limit

**Cause:** Headers not forwarded correctly

**Fix:**
1. Check headers: `GET /api/debug/headers`
2. If `cf-connecting-ip` is null, check Traefik config
3. Ensure `app.set('trust proxy', true)` is enabled

### Issue: 503 errors under load

**Cause:** File lock contention

**Solution:** Auto-retry is enabled (3 attempts)
- Frontend retries automatically with exponential backoff
- Check logs for: `🔄 Retrying submission...`

### Issue: Scores not appearing immediately

**Expected behavior!** Scores use cache with 30s TTL during game period.

---

## Performance Optimization

### For 20+ concurrent users:
- ✅ In-memory cache (already enabled)
- ✅ File locking with retries (already enabled)
- ✅ Auto-retry on submission (already enabled)
- ✅ React 19 useTransition for smooth UI

### If you scale beyond ~50 users:
Consider upgrading to:
- PostgreSQL for persistent storage
- Redis for distributed cache
- Multiple app instances with load balancer

---

## Deployment Steps

### 1. Build Docker Image
```bash
docker build -t santa-games:latest .
```

### 2. Create .env file
```bash
echo "CF_TUNNEL_TOKEN=your-token" > .env
```

### 3. Start Services
```bash
docker-compose up -d
```

### 4. Verify
```bash
# Check containers are running
docker ps

# Check health
curl http://localhost:2412/api/health

# Check production (via CF Tunnel)
curl https://santa-games.yourdomain.com/api/health
```

---

## Questions?

Check the debug endpoint to see your current setup:
```bash
curl https://santa-games.yourdomain.com/api/debug/headers
```

This will show you which IP is being used for rate limiting and confirm your proxy setup works correctly.
