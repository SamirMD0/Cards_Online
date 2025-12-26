// backend/src/socket/handlers/game/requestHandHandler.ts
import { Socket } from '../../../types/socket.types.js';
import { GameStateManager } from '../../../managers/GameStateManager.js';
import { emitError } from '../../../utils/errors.js';
import { requireGameContext, requirePlayer } from './validators.js';

/**
 * Handles manual hand sync requests (used for debugging/reconnection)
 */
export async function handleRequestHand(
  socket: Socket,
  gameManager: GameStateManager
) {
  try {
    const { userId, roomId, game } = await requireGameContext(socket, gameManager);
    
    console.log(`[RequestHand] User ${userId} requesting hand in room ${roomId}`);
    
    const player = requirePlayer(game, userId);
    
    if (player.isBot) {
      throw new Error('Bots cannot request hands');
    }
    
    console.log(`[RequestHand] Sending ${player.hand.length} cards to ${player.name}`);
    
    socket.emit('hand_update', { hand: player.hand });
    
  } catch (error) {
    console.error('[RequestHand] Error:', error);
    emitError(socket, error);
  }
}