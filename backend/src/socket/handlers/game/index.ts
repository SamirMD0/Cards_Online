// backend/src/socket/handlers/game/index.ts
import { Server } from 'socket.io';
import { Socket } from '../../../types/socket.types.js';
import { GameStateManager } from '../../../managers/GameStateManager.js';
import { RoomService } from '../../../services/RoomService.js';
import { handleStartGame } from './startGameHandler.js';
import { handlePlayCard } from './playCardHandler.js';
import { handleDrawCard } from './drawCardHandler.js';
import { handleAddBot } from './addBotHandler.js';
import { handleRequestHand } from './requestHandHandler.js';

/**
 * Sets up all game-related socket handlers
 * Called from socketSetup.ts during socket connection
 */
export function setupGameHandlers(
  io: Server,
  socket: Socket,
  roomService: RoomService,
  gameManager: GameStateManager
) {
  // Game lifecycle
  socket.on('start_game', () => {
    handleStartGame(io, socket, gameManager);
  });
  
  // Game actions
  socket.on('play_card', (data) => {
    handlePlayCard(io, socket, gameManager, data);
  });
  
  socket.on('draw_card', () => {
    handleDrawCard(io, socket, gameManager);
  });
  
  // Bot management
  socket.on('add_bot', () => {
    handleAddBot(io, socket, gameManager);
  });
  
  // Debug/sync
  socket.on('request_hand', () => {
    handleRequestHand(socket, gameManager);
  });
  
  console.log(`[GameHandlers] Registered 5 handlers for socket ${socket.id}`);
}

// Re-export handlers for direct use (if needed)
export { handleStartGame } from './startGameHandler.js';
export { handlePlayCard } from './playCardHandler.js';
export { handleDrawCard } from './drawCardHandler.js';
export { handleAddBot } from './addBotHandler.js';
export { handleRequestHand } from './requestHandHandler.js';
export { processBotTurn } from './botTurnProcessor.js';