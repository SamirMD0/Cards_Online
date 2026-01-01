# TODO: Update server.ts for Health Routes and Graceful Shutdown

## Tasks
- [ ] Remove inline health checks from server.ts (app.get('/health') and app.get('/health/db'))
- [ ] Add app.use(healthRoutes) before socket setup
- [ ] Replace existing SIGTERM handler with setupGracefulShutdown(httpServer, io)
