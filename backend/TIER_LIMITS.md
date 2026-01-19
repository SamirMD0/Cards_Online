# Free Tier Limits - UNO Game Backend

This document outlines the resource limits for running the UNO game backend on free-tier services.

## 🎯 Service Limits

### Fly.io (Compute)
- **RAM**: 256 MB
- **CPU**: Shared (1x)
- **Disk**: 3 GB
- **Bandwidth**: 160 GB/month outbound
- **Machines**: Up to 3 free machines
- **Uptime**: Not guaranteed (may sleep after inactivity)

**Current Configuration**:
- Max socket connections: **50**
- Memory warning threshold: **180 MB**
- GC trigger: **180 MB heap usage**

---

### Upstash Redis (Free Tier)
- **Commands**: 10,000 per day
- **Storage**: 256 MB
- **Bandwidth**: 200 MB/day
- **Connections**: Unlimited (but use connection pooling)
- **Max request size**: 1 MB

**Current Configuration**:
- Game TTL: **24 hours**
- Connection retry limit: **3 attempts**
- Command timeout: **5 seconds**
- Max loading retry time: **5 seconds**

**Optimization Applied**:
- Delta updates for card plays (reduces commands by ~70%)
- Cleanup cron every 6 hours
- Pipeline batching for player indexing

---

### Neon PostgreSQL (Free Tier)
- **Storage**: 0.5 GB
- **Compute**: 0.25 vCPU
- **Active time**: 100 hours/month
- **Connections**: 5 max concurrent
- **Auto-suspend**: After 5 minutes of inactivity

**Current Configuration**:
- Connection pool size: **3**
- Idle timeout: **30 seconds**
- Connection timeout: **10 seconds**
- Statement timeout: **5 seconds**

**Optimization Applied**:
- Session caching (60s TTL) reduces DB queries by ~90%
- Hourly expired session cleanup
- Prisma connection pooling with PG adapter

---

## 📊 Monitoring Commands

### Check Memory Usage
```bash
flyctl logs --app uno-online-backend | grep Metrics
```
Expected output every 5 minutes:
```
[Metrics] Memory: 120MB heap / 180MB RSS | Sockets: 15
```

### Check Redis Usage
```bash
# View Redis info (if you have direct access)
redis-cli INFO memory
redis-cli INFO stats
```

### Check Active Games
```bash
flyctl logs --app uno-online-backend | grep "game:"
```

### Check Connection Count
```bash
flyctl logs --app uno-online-backend | grep "Socket] Connected"
```

### View Application Status
```bash
flyctl status --app uno-online-backend
flyctl scale show --app uno-online-backend
```

### Real-time Logs
```bash
flyctl logs --app uno-online-backend -f
```

---

## 🚨 Troubleshooting

### Memory Leak Symptoms
- Metrics show increasing heap usage over time
- RSS > 240 MB
- App crashes with "JavaScript heap out of memory"

**Solutions**:
1. Check for orphaned timers: `flyctl logs | grep TurnTimer`
2. Verify GC is triggering: `flyctl logs | grep "Forced GC"`
3. Restart app: `flyctl apps restart uno-online-backend`

---

### Redis Command Limit Exceeded
**Symptoms**: `ERR max number of requests per day exceeded`

**Solutions**:
1. Check daily command count in Upstash dashboard
2. Verify delta updates are working: `flyctl logs | grep "Delta update"`
3. Reduce game TTL if needed (currently 24h)
4. Enable Redis cleanup cron: `flyctl logs | grep "Redis Cleanup"`

---

### Database Connection Pool Exhausted
**Symptoms**: `Error: Connection pool exhausted`

**Solutions**:
1. Check active connections: `flyctl logs | grep "Prisma"`
2. Verify session cache is working: `flyctl logs | grep "FREE TIER: Check cache"`
3. Reduce pool size if needed (currently 3)
4. Check for long-running queries (should timeout at 5s)

---

### Socket Connection Limit Reached
**Symptoms**: `Server at capacity, please try again`

**Solutions**:
1. Check current socket count: `flyctl logs | grep "Socket] Connected"`
2. Verify limit is appropriate (currently 50)
3. Check for stuck connections: `flyctl logs | grep "Disconnected"`
4. Restart app if connections are stuck

---

## 🎮 Recommended Limits

Based on free-tier constraints, here are safe operational limits:

| Resource | Limit | Reason |
|----------|-------|--------|
| Concurrent games | 10-15 | 4 players × 15 games = 60 sockets (within limit) |
| Max players online | 50 | Socket connection limit |
| Game duration | 24 hours | Redis TTL |
| Redis commands/day | < 8,000 | Leave 20% buffer under 10k limit |
| DB queries/hour | < 100 | With caching, should be minimal |
| Memory usage | < 240 MB | Leave buffer for spikes |

---

## ✅ Health Checks

The backend includes automatic health monitoring:

1. **Memory Check**: Every 60 seconds
   - Triggers GC if heap > 180 MB
   
2. **Metrics Logging**: Every 5 minutes
   - Logs memory, socket count, game count
   
3. **Redis Cleanup**: Every 6 hours
   - Scans and deletes expired game keys
   
4. **Session Cleanup**: Every 1 hour
   - Removes expired auth sessions from DB

---

## 🔧 Configuration Files

Key configuration locations:

- **Fly.io**: `backend/fly.toml`
- **Redis**: `backend/src/lib/redisClient.ts`
- **Database**: `backend/src/lib/prisma.ts`
- **Socket limits**: `backend/src/socket/socketSetup.ts`
- **Environment**: `backend/.env.production.example`

---

## 📈 Scaling Beyond Free Tier

If you exceed free-tier limits, consider:

1. **Fly.io**: Upgrade to paid plan ($5-10/month)
   - 512 MB RAM
   - Dedicated CPU
   - Better uptime guarantees

2. **Upstash**: Upgrade to Pro ($10/month)
   - 1M commands/day
   - 1 GB storage
   - Better performance

3. **Neon**: Upgrade to Launch ($19/month)
   - 10 GB storage
   - Autoscaling compute
   - No active time limits

---

## 📝 Notes

- All limits are enforced via code (not just documentation)
- Metrics are logged for monitoring
- Rate limiting prevents abuse
- Cleanup jobs prevent resource leaks
- Session caching reduces DB load
- Delta updates reduce Redis commands
