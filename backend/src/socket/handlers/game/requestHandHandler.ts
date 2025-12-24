// backend/src/socket/handlers/game/requestHandHandler.ts
import { Socket } from '../../../types/socket.types.js';
import { GameStateManager } from '../../../managers/GameStateManager.js';
import { emitError } from '../../../utils/errors.js';

export function handleRequestHand(
  socket: Socket,
  gameManager: GameStateManager
) {
  try {
    console.log('[Game] 📥 Hand request received from socket:', socket.id);
    
    const roomId = gameManager.getPlayerRoom(socket.id);
    console.log('[Game] Room ID:', roomId);
    
    if (!roomId) {
      throw new Error('You are not in a room');
    }
    
    const game = gameManager.getGameOrThrow(roomId);
    const userId = socket.data.userId;
    
    console.log('[Game] User ID:', userId);
    console.log('[Game] Game players:', game.players.map(p => ({ id: p.id, name: p.name, isBot: p.isBot })));
    
    const player = game.players.find(p => p.id === userId);
    
    if (!player) {
      console.log('[Game] ❌ Player not found!');
      throw new Error('Player not found in game');
    }
    
    if (player.isBot) {
      throw new Error('Bots cannot request hands');
    }
    
    console.log(`[Game] 📤 Sending hand to ${player.name}: ${player.hand.length} cards`);
    console.log('[Game] Cards:', player.hand.map(c => `${c.color} ${c.value}`));
    
    socket.emit('hand_update', { hand: player.hand });
    
  } catch (error) {
    console.error('[Game] Request hand error:', error);
    emitError(socket, error);
  }
}