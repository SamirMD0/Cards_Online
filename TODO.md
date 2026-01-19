# PHASE 2 - Reliability Fixes for Fly.io Free Tier
# Priority: CRITICAL → HIGH → MEDIUM
# Estimated time: 6-8 hours total

## 🔴 CRITICAL (DO FIRST - WILL CRASH WITHOUT THESE)

[ ] 1. Add socket connection limit (socketSetup.ts)
    - Location: backend/src/socket/socketSetup.ts:20
    - Add: MAX_CONNECTIONS = 50, activeConnections counter
    - Test: Connect 51 clients, verify 51st is rejected
    - Time: 15 minutes

[ ] 2. Fix timer cleanup in game end (gameCleanup.ts + TurnTimerManager.ts)
    - Location: backend/src/socket/handlers/game/gameCleanup.ts:34
    - Add: timerManager.clearTimer(roomId) BEFORE deleteGame()
    - Location: backend/src/managers/TurnTimerManager.ts:75
    - Add: Safety check in handleTimeout() to verify game exists
    - Test: End game abruptly, verify no orphaned timer fires
    - Time: 20 minutes

[ ] 3. Add Redis connection pool limits (redisClient.ts)
    - Location: backend/src/lib/redisClient.ts:40
    - Add: maxConnections: 10, minConnections: 2
    - Test: Monitor Redis connections with `redis.info('clients')`
    - Time: 10 minutes

[ ] 4. Add Redis cleanup cron job (server.ts)
    - Location: backend/src/server.ts (after setupSocketIO)
    - Add: setInterval() to scan and delete expired game keys
    - Test: Create game, wait 25 hours, verify key deleted
    - Time: 25 minutes

[ ] 5. Add DB query timeout (prisma.ts + DATABASE_URL)
    - Location: backend/src/lib/prisma.ts:17
    - Modify: Add ?statement_timeout=5000 to connection string
    - Test: Run slow query, verify it times out at 5s
    - Time: 10 minutes

## 🟠 HIGH (DO SECOND - PREVENTS TIER EXHAUSTION)

[ ] 6. Implement Redis delta updates (RedisGameStore.ts + handlers)
    - Location: backend/src/services/RedisGameStore.ts (new method)
    - Add: updateGameDelta() method using HSET
    - Location: backend/src/socket/handlers/game/playCardHandler.ts:70
    - Replace: saveGame() → updateGameDelta()
    - Test: Play 10 cards, verify only 10 HSET commands (not 10 SET)
    - Time: 45 minutes

[ ] 7. Add memory monitoring and GC (server.ts)
    - Location: backend/src/server.ts (after setupSocketIO)
    - Add: setInterval() to check heapUsed, force GC at 180MB
    - Test: Simulate high load, verify GC triggers
    - Time: 20 minutes

[ ] 8. Add reconnection rate limiting (reconnectionHandler.ts + socket.ts)
    - Location: backend/src/socket/handlers/reconnectionHandler.ts:18
    - Add: Rate limiter Map to limit checks to 1 per 10s per user
    - Location: frontend/src/socket.ts:30
    - Change: reconnectionAttempts: Infinity → 3
    - Test: Disconnect/reconnect rapidly, verify rate limit blocks
    - Time: 30 minutes

[ ] 9. Add session caching (AuthService.ts)
    - Location: backend/src/services/AuthService.ts
    - Install: node-cache (npm install node-cache)
    - Add: sessionCache with 60s TTL
    - Modify: verifyToken() to check cache first
    - Test: Verify token 10 times, only 1 DB query
    - Time: 25 minutes

## 🟡 MEDIUM (DO THIRD - OPERATIONAL VISIBILITY)

[ ] 10. Add metrics logging (server.ts)
    - Location: backend/src/server.ts (after setupSocketIO)
    - Add: setInterval() to log memory, sockets, games every 5min
    - Test: View logs with `flyctl logs | grep Metrics`
    - Time: 15 minutes

[ ] 11. Document free tier limits (README.md or new TIER_LIMITS.md)
    - Create: TIER_LIMITS.md
    - Document: Upstash 10k cmds/day, Neon 5 connections, 256MB RAM
    - Add: Monitoring commands (flyctl logs, flyctl status)
    - Time: 20 minutes

## 🧪 TESTING CHECKLIST

After implementing all fixes, run these tests:

[ ] Load test: 50 concurrent users for 30 minutes
    - Check: Memory stays < 240MB
    - Check: Redis connections < 10
    - Check: No errors in logs

[ ] Reconnection storm: Restart server with 20 active games
    - Check: All 20 games reconnect successfully
    - Check: Redis commands < 200 in first 10s
    - Check: DB connections don't exceed 3

[ ] 24-hour soak test: Leave server running with 10 active games
    - Check: Memory doesn't grow > 10MB over 24h
    - Check: No orphaned timers (check process.uptime())
    - Check: Redis usage stays < 50MB

[ ] Metrics validation: View logs after 6 hours
    - Check: Metrics logged every 5 minutes
    - Check: Memory trend is flat or decreasing
    - Check: Socket count never exceeds 50

## 📦 DEPLOYMENT

After all fixes:

[ ] Update fly.toml with health check tweaks
[ ] Deploy: flyctl deploy
[ ] Monitor: flyctl logs --app uno-online-backend -f
[ ] Test: Play 5 complete games, verify no crashes
[ ] Document: Update PRODUCTION_STATUS.md with new limits

## ⏱️ TOTAL TIME ESTIMATE

Critical: 1h 20min
High: 2h
Medium: 35min
Testing: 2h
-------
Total: ~6h (one focused work session)

## ✅ SUCCESS CRITERIA

- [ ] Server runs 48 hours without crash
- [ ] Memory usage < 240MB at all times
- [ ] Redis stays within 10k commands/day limit
- [ ] No connection pool exhaustion errors
- [ ] Metrics show flat memory trend over 24h