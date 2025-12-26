import { GameState } from '../game/gameState.js';
import { NotFoundError } from '../utils/errors.js';
import { RedisGameStore } from '../services/RedisGameStore.js';

/**
 * GameStateManager: Hybrid memory + Redis persistence
 * 
 * Architecture:
 * - Memory (Map) = source of truth for active games (fast access)
 * - Redis = persistence layer (survives restarts)
 * - On mutation: save to both memory + Redis
 * - On read: check memory first, lazy-load from Redis if missing
 */
export class GameStateManager {
  private games = new Map<string, GameState>();
  private gameTimers = new Map<string, NodeJS.Timeout>();
  private socketToRoom = new Map<string, string>();
  
  private static instance: GameStateManager;
  private readonly GAME_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  private constructor() {}

  static getInstance(): GameStateManager {
    if (!GameStateManager.instance) {
      GameStateManager.instance = new GameStateManager();
    }
    return GameStateManager.instance;
  }

  /**
   * Create a new game for a room
   */
  async createGame(roomId: string): Promise<GameState> {
    if (this.games.has(roomId)) {
      console.warn(`[GameStateManager] Game already exists for room: ${roomId}`);
      return this.games.get(roomId)!;
    }

    const game = new GameState(roomId);
    this.games.set(roomId, game);
    
    // Persist to Redis
    await RedisGameStore.saveGame(roomId, game);
    
    this.resetGameTimer(roomId);

    console.log(`[GameStateManager] Game created for room: ${roomId}`);

    return game;
  }

  /**
   * Get game by room ID (with Redis fallback)
   */
  async getGame(roomId: string): Promise<GameState | undefined> {
    // Check memory first (fast path)
    if (this.games.has(roomId)) {
      return this.games.get(roomId);
    }

    // Not in memory - try Redis (lazy load)
    console.log(`[GameStateManager] Game ${roomId} not in memory, loading from Redis...`);
    const game = await RedisGameStore.loadGame(roomId);
    
    if (game) {
      // Restore to memory
      this.games.set(roomId, game);
      this.resetGameTimer(roomId);
      console.log(`[GameStateManager] Game ${roomId} restored from Redis`);
    }

    return game || undefined;
  }

  /**
   * Get game or throw error
   */
  async getGameOrThrow(roomId: string): Promise<GameState> {
    const game = await this.getGame(roomId);
    if (!game) {
      throw new NotFoundError(`Game not found for room: ${roomId}`);
    }
    return game;
  }

  /**
   * Save game state (memory + Redis)
   * Call this after EVERY game state mutation!
   */
  async saveGame(roomId: string): Promise<void> {
    const game = this.games.get(roomId);
    if (!game) {
      console.warn(`[GameStateManager] Cannot save - game ${roomId} not in memory`);
      return;
    }

    // Persist to Redis (async, don't block)
    await RedisGameStore.saveGame(roomId, game);
    
    // Reset inactivity timer
    await RedisGameStore.touchGame(roomId);
  }

  /**
   * Delete game and clean up
   */
  async deleteGame(roomId: string): Promise<boolean> {
    this.clearGameTimer(roomId);
    
    // Clean up socket mappings
    for (const [socketId, mappedRoomId] of this.socketToRoom.entries()) {
      if (mappedRoomId === roomId) {
        this.socketToRoom.delete(socketId);
      }
    }

    // Delete from Redis
    await RedisGameStore.deleteGame(roomId);

    // Delete from memory
    const deleted = this.games.delete(roomId);
    
    if (deleted) {
      console.log(`[GameStateManager] Game deleted for room: ${roomId}`);
    }
    return deleted;
  }

  /**
   * Find room by user ID (for reconnection)
   */
  async findRoomByUserId(userId: string): Promise<string | null> {
    return await RedisGameStore.findRoomByUserId(userId);
  }

  // ===== Socket-to-Room Mapping (unchanged) =====

  setSocketRoom(socketId: string, roomId: string): void {
    this.socketToRoom.set(socketId, roomId);
  }

  getSocketRoom(socketId: string): string | undefined {
    return this.socketToRoom.get(socketId);
  }

  removeSocketMapping(socketId: string): void {
    this.socketToRoom.delete(socketId);
  }

  // ===== Maintenance & Utilities =====

  getAllGames(): Map<string, GameState> {
    return new Map(this.games);
  }

  getGameCount(): number {
    return this.games.size;
  }

  resetGameTimer(roomId: string): void {
    this.clearGameTimer(roomId);

    const timer = setTimeout(async () => {
      const game = this.games.get(roomId);
      if (game) {
        console.log(`[GameStateManager] Game ${roomId} timed out due to inactivity`);
        await this.deleteGame(roomId);
      }
    }, this.GAME_TIMEOUT);

    this.gameTimers.set(roomId, timer);
  }

  private clearGameTimer(roomId: string): void {
    const timer = this.gameTimers.get(roomId);
    if (timer) {
      clearTimeout(timer);
      this.gameTimers.delete(roomId);
    }
  }

  buildRoomListItem(roomId: string, game: GameState, roomMetadata: any): any {
    return {
      id: roomId,
      roomName: roomMetadata.roomName,
      roomCode: roomMetadata.roomCode,
      players: game.players.map(p => ({
        id: p.id,
        name: p.name,
        isHost: p.id === game.players[0]?.id,
        isReady: true,
        isBot: p.isBot
      })),
      maxPlayers: roomMetadata.maxPlayers,
      gameStarted: game.gameStarted
    };
  }
}