import { redis } from '../lib/redisClient.js';
import { GameState } from '../game/gameState.js';

/**
 * RedisGameStore: Persist active game state to Redis
 * 
 * Benefits:
 * - Games survive server restarts
 * - Enables horizontal scaling (multiple servers)
 * - Fast enough for real-time games
 * 
 * Key structure:
 * - game:{roomId} -> serialized GameState
 * - player:{userId} -> roomId (for reconnection lookup)
 * 
 * TTL: 24 hours (games expire after 1 day of inactivity)
 */
export class RedisGameStore {
  private static readonly GAME_PREFIX = 'game:';
  private static readonly PLAYER_PREFIX = 'player:';
  private static readonly TTL = 24 * 60 * 60; // 24 hours in seconds

  /**
   * Save game state to Redis
   * Call this after EVERY game state mutation
   */
static async saveGame(roomId: string, game: GameState): Promise<void> {
  try {
    const key = `${this.GAME_PREFIX}${roomId}`;
    
    const serialized = JSON.stringify({
      roomId: game.roomId,
      players: game.players,
      deck: game.deck,
      discardPile: game.discardPile,
      currentPlayer: game.currentPlayer,
      direction: game.direction,
      currentColor: game.currentColor,
      pendingDraw: game.pendingDraw,
      gameStarted: game.gameStarted,
      winner: game.winner,
      
      // ✅ NEW: Serialize timer fields
      turnStartTime: game.turnStartTime,
      turnDuration: game.turnDuration,
      
      updatedAt: Date.now()
    });

    await redis.setex(key, this.TTL, serialized);
    await this.indexPlayers(roomId, game.players.map(p => p.id));

  } catch (error) {
    console.error('[RedisGameStore] Save failed:', error);
  }
}

static async loadGame(roomId: string): Promise<GameState | null> {
  try {
    const key = `${this.GAME_PREFIX}${roomId}`;
    const serialized = await redis.get(key);

    if (!serialized) {
      return null;
    }

    const data = JSON.parse(serialized);

    const game = new GameState(data.roomId);
    game.players = data.players;
    game.deck = data.deck;
    game.discardPile = data.discardPile;
    game.currentPlayer = data.currentPlayer;
    game.direction = data.direction;
    game.currentColor = data.currentColor;
    game.pendingDraw = data.pendingDraw;
    game.gameStarted = data.gameStarted;
    game.winner = data.winner;
    
    // ✅ NEW: Deserialize timer fields
    game.turnStartTime = data.turnStartTime || null;
    game.turnDuration = data.turnDuration || 30000;

    console.log(`[RedisGameStore] Loaded game ${roomId}`);
    return game;
  } catch (error) {
    console.error('[RedisGameStore] Load failed:', error);
    return null;
  }
}

  /**
   * Delete game from Redis
   */
  static async deleteGame(roomId: string): Promise<void> {
    try {
      const key = `${this.GAME_PREFIX}${roomId}`;
      
      // Get player IDs before deleting
      const game = await this.loadGame(roomId);
      if (game) {
        await this.removePlayerIndexes(game.players.map(p => p.id));
      }

      await redis.del(key);
      console.log(`[RedisGameStore] Deleted game ${roomId}`);
    } catch (error) {
      console.error('[RedisGameStore] Delete failed:', error);
    }
  }

  /**
   * Find which room a user was in (for reconnection)
   */
  static async findRoomByUserId(userId: string): Promise<string | null> {
    try {
      const key = `${this.PLAYER_PREFIX}${userId}`;
      const roomId = await redis.get(key);
      return roomId;
    } catch (error) {
      console.error('[RedisGameStore] Find room failed:', error);
      return null;
    }
  }

  /**
   * Check if game exists
   */
  static async exists(roomId: string): Promise<boolean> {
    const key = `${this.GAME_PREFIX}${roomId}`;
    const exists = await redis.exists(key);
    return exists === 1;
  }

  /**
   * Get all active game room IDs
   */
  static async getAllGameIds(): Promise<string[]> {
    const pattern = `${this.GAME_PREFIX}*`;
    const keys = await redis.keys(pattern);
    return keys.map(key => key.replace(this.GAME_PREFIX, ''));
  }

  /**
   * Extend game TTL (reset expiration timer)
   */
  static async touchGame(roomId: string): Promise<void> {
    const key = `${this.GAME_PREFIX}${roomId}`;
    await redis.expire(key, this.TTL);
  }

  // ===== Private Helpers =====

  /**
   * Index players to their room (for reconnection)
   */
  private static async indexPlayers(roomId: string, userIds: string[]): Promise<void> {
    const pipeline = redis.pipeline();
    
    for (const userId of userIds) {
      const key = `${this.PLAYER_PREFIX}${userId}`;
      pipeline.setex(key, this.TTL, roomId);
    }

    await pipeline.exec();
  }

  /**
   * Remove player indexes
   */
  private static async removePlayerIndexes(userIds: string[]): Promise<void> {
    const keys = userIds.map(id => `${this.PLAYER_PREFIX}${id}`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}