# TODO: Replace console.log with Structured Logging

## Overview
Replace all `console.log` calls in backend TypeScript files with structured logging using the Winston logger from `backend/src/lib/logger.ts`. Transform messages to include metadata objects for better log management.

## Files to Update
- [x] backend/src/utils/validateEnv.ts
- [x] backend/src/socket/socketSetup.ts
- [ ] backend/src/socket/handlers/roomHandlers.ts
- [ ] backend/src/socket/handlers/reconnectionHandler.ts
- [ ] backend/src/socket/handlers/game/startGameHandler.ts
- [ ] backend/src/socket/handlers/game/requestHandHandler.ts
- [ ] backend/src/socket/handlers/game/playCardHandler.ts
- [ ] backend/src/socket/handlers/game/index.ts
- [ ] backend/src/socket/handlers/game/gameCleanup.ts
- [ ] backend/src/socket/handlers/game/drawCardHandler.ts
- [ ] backend/src/socket/handlers/game/botTurnProcessor.ts
- [ ] backend/src/socket/handlers/game/addBotHandler.ts
- [ ] backend/src/services/RoomService.ts
- [ ] backend/src/services/RedisGameStore.ts
- [ ] backend/src/services/GameHistoryService.ts
- [ ] backend/src/services/FriendService.ts
- [ ] backend/src/services/AuthService.ts
- [ ] backend/src/server.ts
- [ ] backend/src/middleware/socketAuth.ts

## Transformation Rules
- Import logger: `import { logger } from '../lib/logger';` (adjust path as needed)
- Replace `console.log('[Tag] Message:', var)` with `logger.info('Message', { tag: 'Tag', var: var })`
- Use appropriate log levels (info for general logs, warn for warnings, error for errors)
- Structure metadata objects with relevant context

## Progress Tracking
- Total console.log instances: 91
- Completed: 0
- Remaining: 91

## Next Steps
1. Start with backend/src/utils/validateEnv.ts
2. Read file, add logger import if needed
3. Replace console.log calls one by one
4. Test logging functionality after changes
5. Move to next file
