// backend/src/socket/handlers/game/validators.ts
import { Socket } from '../../../types/socket.types.js';
import { GameStateManager } from '../../../managers/GameStateManager.js';
import { GameState } from '../../../game/gameState.js';

/**
 * Validates socket has authenticated userId
 * @throws Error if userId missing
 */
export function requireAuth(socket: Socket): string {
  const userId = socket.data.userId;
  if (!userId) {
    throw new Error('Authentication required - no userId on socket');
  }
  return userId;
}

/**
 * Validates socket is in a room and returns roomId
 * @throws Error if not in room
 */
export function requireRoom(socket: Socket, gameManager: GameStateManager): string {
  const roomId = gameManager.getSocketRoom(socket.id);
  if (!roomId) {
    throw new Error('You are not in a room');
  }
  return roomId;
}

/**
 * Full validation: auth + room + game state
 * @returns { userId, roomId, game }
 */
export async function requireGameContext(socket: Socket, gameManager: GameStateManager) {
  const userId = requireAuth(socket);
  const roomId = requireRoom(socket, gameManager);
  const game = await gameManager.getGameOrThrow(roomId);

  return { userId, roomId, game };
}

/**
 * Validates it's the player's turn
 * @throws Error if not their turn
 */
export function requireTurn(game: GameState, userId: string): void {
  if (game.currentPlayer !== userId) {
    throw new Error('It is not your turn');
  }
}

/**
 * Validates player exists in game
 * @throws Error if player not found
 */
export function requirePlayer(game: GameState, userId: string) {
  const player = game.players.find(p => p.id === userId);
  if (!player) {
    throw new Error('Player not found in game');
  }
  return player;
}