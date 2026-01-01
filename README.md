# Production Deployment

## 🌐 Live Demo

**Frontend**: https://uno-online.vercel.app  
**Backend**: https://uno-backend.up.railway.app  
**Status**: https://uno-backend.up.railway.app/health/ready

---

## 🚀 Quick Deploy

### Prerequisites
- Node.js >= 18
- Railway account (backend)
- Vercel account (frontend)

### Backend Deployment (Railway)

```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Login and initialize
railway login
railway init

# 3. Add databases
railway add --database postgresql
railway add --database redis

# 4. Set environment variables
railway variables set JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
railway variables set NODE_ENV=production
railway variables set CLIENT_URL=<your-vercel-url>

# 5. Deploy
railway up

# 6. Run migrations
railway run npx prisma migrate deploy
```

### Frontend Deployment (Vercel)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy from frontend directory
cd frontend
vercel --prod

# 3. Set environment variable
vercel env add VITE_SERVER_URL production
# Enter: https://your-railway-url.up.railway.app
```

### Update CORS

After deployment, update `backend/src/server.ts`:
```typescript
const ALLOWED_ORIGINS = [
  'https://your-project.vercel.app',  // Your Vercel URL
  'http://localhost:5173',
];
```

Redeploy backend: `railway up`

---

## 📊 Production Monitoring

### Health Checks

```bash
# Overall health
curl https://your-backend.up.railway.app/health

# Database health
curl https://your-backend.up.railway.app/health/db

# Redis health
curl https://your-backend.up.railway.app/health/redis

# Readiness check (all systems)
curl https://your-backend.up.railway.app/health/ready
```

### View Logs

```bash
# Railway logs (last 100 lines)
railway logs --tail 100

# Vercel logs
vercel logs
```

### Database Management

```bash
# Prisma Studio (GUI)
railway run npx prisma studio

# Database schema
railway run npx prisma db pull
```

---

## 🔧 Production Environment Variables

### Backend (.env.production)
```bash
DATABASE_URL=<railway-postgresql-url>
REDIS_URL=<railway-redis-url>
JWT_SECRET=<32-char-random-string>
CLIENT_URL=<vercel-frontend-url>
NODE_ENV=production
PORT=3001
```

### Frontend (.env.production)
```bash
VITE_SERVER_URL=<railway-backend-url>
```

---

## 🐳 Docker Deployment

### Build Production Image

```bash
# Build
docker build -f Dockerfile -t uno-backend:prod .

# Run locally
docker run -p 3001:3001 \
  -e DATABASE_URL=<url> \
  -e REDIS_URL=<url> \
  -e JWT_SECRET=<secret> \
  uno-backend:prod
```

### Docker Compose (Local Testing)

```bash
docker-compose -f docker-compose.prod.yml up
```

---

## 📈 Performance Optimization

### Backend
- ✅ Connection pooling (Prisma)
- ✅ Redis caching for game state
- ✅ Rate limiting (100 req/15min)
- ✅ Graceful shutdown
- ✅ Gzip compression

### Frontend
- ✅ Code splitting
- ✅ Lazy loading routes
- ✅ Optimized bundle size
- ✅ CDN delivery (Vercel)

---

## 🔒 Security Checklist

- ✅ Environment variables validated on startup
- ✅ CORS whitelist (no wildcards)
- ✅ Rate limiting (API + WebSocket)
- ✅ HttpOnly cookies
- ✅ Helmet security headers
- ✅ Input sanitization
- ✅ SQL injection protection (Prisma)
- ✅ XSS prevention
- ✅ HTTPS enforced (production)

---

## 🛠️ Troubleshooting

### CORS Errors
**Symptom**: "CORS policy" error in browser console

**Fix**:
1. Check `CLIENT_URL` in Railway variables
2. Ensure it matches your Vercel URL exactly
3. Update `ALLOWED_ORIGINS` in `server.ts`
4. Redeploy backend

### Database Connection Failed
**Symptom**: "Can't reach database server" error

**Fix**:
```bash
# Check DATABASE_URL format
railway variables

# Test connection
railway run npx prisma db pull
```

### Cold Start (Render Only)
**Symptom**: First request takes 30+ seconds

**Expected**: Free tier sleeps after 15 min inactivity

**Workaround**:
- Upgrade to paid tier ($7/mo)
- Use cron job to ping `/health` every 10 minutes

### Redis Connection Failed
**Symptom**: "Redis connection failed" in logs

**Fix**:
```bash
# Verify REDIS_URL
railway variables

# Test connection
railway run node -e "require('ioredis').default(process.env.REDIS_URL).ping().then(console.log)"
```

---

## 💰 Cost Breakdown

### Free Tier (Hobby Projects)

| Service | Provider | Cost | Limits |
|---------|----------|------|--------|
| Backend | Railway | $0 | $5 credit/mo (~500 hours) |
| Frontend | Vercel | $0 | 100GB bandwidth/mo |
| PostgreSQL | Railway | $0 | 1GB storage |
| Redis | Railway | $0 | 100MB memory |
| **Total** | | **$0/mo** | ✅ Enough for portfolio |

### Paid Tier (Production)

| Service | Provider | Cost | Benefits |
|---------|----------|------|----------|
| Backend | Railway | $5/mo | No sleep, better resources |
| Frontend | Vercel | $0 | Still free |
| PostgreSQL | Railway | Included | 8GB storage |
| Redis | Railway | Included | 512MB memory |
| **Total** | | **$5/mo** | Always-on, faster |

---

## 📞 Support

### Deployment Issues
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs

### Application Bugs
- GitHub Issues: [Your Repo]/issues
- Email: your-email@example.com

---

## 🎓 Architecture Diagram

```
┌─────────────┐
│   Vercel    │  React Frontend
│  (CDN Edge) │  Global Distribution
└──────┬──────┘
       │ HTTPS
       │
┌──────▼──────────┐
│    Railway      │  Node.js Backend
│   (Container)   │  Socket.IO + Express
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼──────┐
│ Redis │ │ Postgres│
│ Cache │ │ Database│
└───────┘ └─────────┘
```

---

## 🔄 Continuous Deployment

### Automatic Deploys

**Railway**: Pushes to `main` branch auto-deploy backend  
**Vercel**: Pushes to `main` branch auto-deploy frontend

### Manual Deploys

```bash
# Backend
railway up

# Frontend
vercel --prod
```

### Rollback

```bash
# Railway: Dashboard → Deployments → Previous version → Redeploy
# Vercel: Dashboard → Deployments → Previous version → Promote
```