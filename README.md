# UNO Online - Production Portfolio

A real-time multiplayer UNO game built with modern web technologies and deployed on free-tier infrastructure.

---

## 🌐 Live Demo

**Frontend**: [Production URL - deployed separately]
**Vercel website**:[https://cards-online-two.vercel.app/]  
**Backend**: Fly.io (free tier, single instance)

---

## Production Architecture (Actual)

This is a distributed system with clear separation of concerns:

**Frontend → Backend (Fly.io)**
- Frontend communicates with the backend via REST API and WebSocket (Socket.IO)
- Backend runs on Fly.io free tier (256MB RAM, single instance)
- CORS configured to allow frontend domain

**Backend → Upstash (Redis)**
- Active game state stored in Redis for fast reads/writes
- Game room data, player positions, card state
- Session data and real-time events
- Connected via `REDIS_URL` environment variable

**Backend → Neon (PostgreSQL)**
- Persistent user accounts, authentication
- Game history, statistics, leaderboards
- Schema managed via Prisma ORM
- Connected via `DATABASE_URL` environment variable

**Why this separation matters in production:**
- Redis handles ephemeral, high-frequency game state (sub-100ms responses)
- PostgreSQL handles durable, relational data (user accounts, history)
- Fly.io hosts the orchestration layer (game logic, WebSocket connections)
- Decoupling allows independent scaling and failure isolation

---

## Production Deployment

### Why this stack?

**Fly.io Free Tier**
- Free 256MB RAM instance (sufficient for early-stage multiplayer)
- Global edge network with automatic HTTPS
- Container-based deployment with Docker
- Single instance constraint (no horizontal scaling on free tier)

**Upstash Redis**
- Serverless Redis with REST API and native protocol support
- Free tier: 10,000 commands/day
- Automatic persistence and replication
- Low-latency data access for game state

**Neon PostgreSQL**
- Serverless Postgres with automatic scaling to zero
- Free tier: 512MB storage, shared compute
- Prisma-compatible connection pooling
- Suitable for portfolio-scale user data

### Known Constraints

**Cold Start Behavior**
- Fly.io free tier instances may sleep after inactivity
- First request after sleep: 5-15 second wake-up time
- This is normal and expected for free-tier deployments

**Resource Limits**
- 256MB RAM on Fly.io (sufficient for 10-20 concurrent game rooms)
- Single instance (no failover or load balancing)
- Upstash rate limits (10k commands/day on free tier)
- Neon database storage capped at 512MB

**Why this setup is realistic for early-stage systems:**
- Many production startups begin with similar constraints
- Forces efficient resource usage and thoughtful architecture
- Demonstrates understanding of cost/performance tradeoffs
- Allows iteration without infrastructure overhead

---

## 🚀 Quick Deploy

### Prerequisites
- Node.js >= 18
- Fly.io account
- Upstash Redis database (free tier)
- Neon PostgreSQL database (free tier)

### Backend Deployment (Fly.io)

```bash
# 1. Install Fly CLI
# macOS/Linux
curl -L https://fly.io/install.sh | sh

# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# 2. Login and initialize
flyctl auth login
cd backend
flyctl launch --no-deploy

# 3. Set environment variables
flyctl secrets set JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
flyctl secrets set NODE_ENV=production
flyctl secrets set CLIENT_URL=<your-frontend-url>
flyctl secrets set DATABASE_URL=<your-neon-connection-string>
flyctl secrets set REDIS_URL=<your-upstash-redis-url>

# 4. Deploy
flyctl deploy

# 5. Run database migrations
flyctl ssh console
npx prisma migrate deploy
exit
```

### Frontend Deployment

The frontend is deployed separately. Configure the backend URL:

```bash
# Frontend environment variable
VITE_SERVER_URL=https://your-app.fly.dev
```

### Update CORS

After deployment, ensure `backend/src/server.ts` includes your frontend URL:

```typescript
const ALLOWED_ORIGINS = [
  'https://your-frontend-domain.com',
  'http://localhost:5173',
];
```

Redeploy: `flyctl deploy`

---

## 🔧 Production Environment Variables

### Backend (.env.production)

```bash
DATABASE_URL=<neon-postgresql-connection-string>
REDIS_URL=<upstash-redis-url>
JWT_SECRET=<32-char-random-string>
CLIENT_URL=<frontend-url>
NODE_ENV=production
PORT=3001
```

**Where to find these values:**
- `DATABASE_URL`: Neon dashboard → Connection Details → Connection String
- `REDIS_URL`: Upstash console → Database → Connect → Node.js connection string
- `JWT_SECRET`: Generate with `openssl rand -hex 32`
- `CLIENT_URL`: Your deployed frontend URL

### Frontend (.env.production)

```bash
VITE_SERVER_URL=<fly-backend-url>
```

Example: `VITE_SERVER_URL=https://your-app.fly.dev`

---

## 📊 Production Monitoring

### Health Checks

```bash
# Overall health
curl https://your-app.fly.dev/health

# Database health
curl https://your-app.fly.dev/health/db

# Redis health
curl https://your-app.fly.dev/health/redis

# Readiness check (all systems)
curl https://your-app.fly.dev/health/ready
```

### View Logs

```bash
# Fly.io logs (real-time)
flyctl logs

# Fly.io logs (last 200 lines)
flyctl logs --tail 200

# SSH into instance
flyctl ssh console
```

### Database Management

```bash
# Prisma Studio (GUI)
flyctl ssh console
npx prisma studio

# View database schema
npx prisma db pull
```

---

## 🐳 Docker Deployment

The backend includes a production Dockerfile configured for Fly.io.

### Build Production Image Locally

```bash
cd backend
docker build -f Dockerfile -t uno-backend:prod .

# Run locally with env vars
docker run -p 3001:3001 \
  -e DATABASE_URL=<url> \
  -e REDIS_URL=<url> \
  -e JWT_SECRET=<secret> \
  -e CLIENT_URL=http://localhost:5173 \
  uno-backend:prod
```

Fly.io handles the Docker build automatically during deployment.

---

## 📈 Performance Optimization

### Backend
- ✅ Connection pooling (Prisma)
- ✅ Redis caching for active game state
- ✅ Rate limiting (100 req/15min per IP)
- ✅ Graceful shutdown with connection draining
- ✅ Gzip compression

### Frontend
- ✅ Code splitting
- ✅ Lazy loading routes
- ✅ Optimized bundle size
- ✅ CDN delivery

---

## 🔒 Security Checklist

- ✅ Environment variables validated on startup
- ✅ CORS whitelist (no wildcards)
- ✅ Rate limiting (API + WebSocket)
- ✅ HttpOnly cookies for auth tokens
- ✅ Helmet security headers
- ✅ Input sanitization
- ✅ SQL injection protection (Prisma parameterized queries)
- ✅ XSS prevention (React DOM escaping)
- ✅ HTTPS enforced (production only)

---

## 🛠️ Troubleshooting

### CORS Errors
**Symptom**: "CORS policy" error in browser console

**Fix**:
1. Check `CLIENT_URL` in Fly.io secrets: `flyctl secrets list`
2. Ensure it matches your frontend URL exactly (no trailing slash)
3. Update `ALLOWED_ORIGINS` in `backend/src/server.ts`
4. Redeploy: `flyctl deploy`

### Database Connection Failed
**Symptom**: "Can't reach database server" error

**Fix**:
```bash
# Verify DATABASE_URL
flyctl secrets list

# Test connection via SSH
flyctl ssh console
npx prisma db pull
```

Ensure your Neon database:
- Is not paused (auto-pause after inactivity on free tier)
- Allows connections from Fly.io IPs (should be default)

### Cold Start Delay
**Symptom**: First request takes 10+ seconds after inactivity

**Expected Behavior**: Fly.io free tier instances may sleep after 15 minutes of inactivity.

**Workarounds**:
- This is normal for free-tier deployments
- Upgrade to paid plan for always-on instances ($1.94/mo baseline)
- Use external uptime monitor to ping `/health` every 10 minutes

### Redis Connection Failed
**Symptom**: "Redis connection failed" in logs

**Fix**:
```bash
# Verify REDIS_URL format
flyctl secrets list

# Test connection
flyctl ssh console
node -e "const Redis = require('ioredis'); const redis = new Redis(process.env.REDIS_URL); redis.ping().then(console.log).catch(console.error);"
```

Ensure Upstash Redis:
- Connection string includes authentication token
- TLS is enabled (required for Upstash)

---

## 💰 Production Costs

### Actual Free Tier (Current Setup)

| Service | Provider | Cost | Limits |
|---------|----------|------|--------|
| Backend | Fly.io | $0 | 256MB RAM, shared CPU, 3 instances max |
| PostgreSQL | Neon | $0 | 512MB storage, shared compute |
| Redis | Upstash | $0 | 10k commands/day, 256MB max data |
| **Total** | | **$0/month** | ✅ Sufficient for portfolio/demo |

**Realistic constraints:**
- Fly.io: Cold starts after inactivity (5-15 seconds)
- Neon: Auto-pause after inactivity (first query may be slow)
- Upstash: 10k commands/day (roughly 400-500 game sessions/day)

### If Scaling Beyond Free Tier

| Upgrade | Provider | Cost | Benefit |
|---------|----------|------|---------|
| Always-on instance | Fly.io | ~$1.94/mo | No cold starts |
| Increased resources | Fly.io | +$0.02/GB RAM/mo | More concurrent games |
| PostgreSQL storage | Neon | $0.12/GB/mo | More user data |
| Redis commands | Upstash | $0.20/100k | More daily sessions |

These costs scale linearly with usage.

---

## 🔄 Continuous Deployment

### Automatic Deploys (Optional)

Fly.io supports GitHub Actions for CI/CD:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Fly.io
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
```

### Manual Deploys

```bash
# Backend
cd backend
flyctl deploy

# Frontend
# Depends on your frontend deployment setup
```

### Rollback

```bash
# View deployment history
flyctl releases

# Rollback to previous version
flyctl releases rollback <version-number>
```

---

## 📞 Support

### Deployment Documentation
- Fly.io Docs: https://fly.io/docs
- Upstash Docs: https://docs.upstash.com
- Neon Docs: https://neon.tech/docs
- Prisma Docs: https://www.prisma.io/docs

### Application Issues
- Open an issue in the GitHub repository
- Include logs from `flyctl logs` if backend-related

---

## Reliability & Limitations

### What Works Well
- Game state synchronization across clients
- Real-time updates via WebSocket
- Authentication and session management
- Rate limiting prevents abuse
- Graceful error handling and recovery

### Known Limitations
- **Single instance**: No horizontal scaling on free tier (failover requires paid plan)
- **Cold starts**: First request after inactivity may be slow
- **Concurrent users**: Tested up to 20 concurrent games; beyond that may require resource upgrades
- **Redis persistence**: Upstash provides automatic persistence, but active game state is ephemeral by design
- **Database connections**: Neon free tier has a connection limit; Prisma pooling mitigates this

### Future Improvements
- Implement Redis data eviction policies for memory management
- Add queuing system for game matchmaking at scale
- Metrics dashboard for monitoring active games and performance
- Horizontal scaling with shared Redis state (requires paid Fly.io tier)

---

## Architecture Considerations

This project demonstrates several production-grade patterns:

1. **State Management**: Clear separation between ephemeral (Redis) and persistent (PostgreSQL) data
2. **Real-time Communication**: WebSocket connections with fallback and reconnection logic
3. **Error Handling**: Graceful degradation when services are unavailable
4. **Security**: Defense in depth (CORS, rate limiting, input validation, secure cookies)
5. **Observability**: Health check endpoints for monitoring external systems
6. **Resource Constraints**: Designed to operate efficiently within free-tier limits

The architecture prioritizes simplicity and cost-effectiveness while maintaining production readiness.
