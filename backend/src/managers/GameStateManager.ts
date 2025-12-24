import { GameState } from '../game/gameState.js';
import { NotFoundError } from '../utils/errors.js';

/**
 * GameStateManager: Centralized game state management
 * Wraps existing GameState class with better encapsulation
 */
export class GameStateManager {
  private games = new Map<string, GameState>();
  private gameTimers = new Map<string, NodeJS.Timeout>();
  
  /**
   * FIX: Renamed from playerToRoom to socketToRoom to be explicit.
   * This tracks the transport-layer connection to a specific room.
   */
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
  createGame(roomId: string): GameState {
    if (this.games.has(roomId)) {
      console.warn(`[GameStateManager] Game already exists for room: ${roomId}`);
      return this.games.get(roomId)!;
    }

    const game = new GameState(roomId);
    this.games.set(roomId, game);
    this.resetGameTimer(roomId);

    console.log(`[GameStateManager] Game created for room: ${roomId}`);

    return game;
  }

  /**
   * Get game by room ID
   */
  getGame(roomId: string): GameState | undefined {
    return this.games.get(roomId);
  }

  /**
   * Get game or throw error
   */
  getGameOrThrow(roomId: string): GameState {
    const game = this.games.get(roomId);
    if (!game) {
      throw new NotFoundError(`Game not found for room: ${roomId}`);
    }
    return game;
  }

  /**
   * Delete game and clean up related transport mappings
   */
  deleteGame(roomId: string): boolean {
    this.clearGameTimer(roomId);
    
    // Clean up socket mappings associated with this room
    for (const [socketId, mappedRoomId] of this.socketToRoom.entries()) {
      if (mappedRoomId === roomId) {
        this.socketToRoom.delete(socketId);
      }
    }

    const deleted = this.games.delete(roomId);
    if (deleted) {
      console.log(`[GameStateManager] Game deleted for room: ${roomId}`);
    }
    return deleted;
  }

  /**
   * --- Socket-to-Room Mapping Logic ---
   * Used for transport-layer lookups (e.g., on disconnect or broadcast)
   */

  setSocketRoom(socketId: string, roomId: string): void {
    this.socketToRoom.set(socketId, roomId);
  }

  getSocketRoom(socketId: string): string | undefined {
    return this.socketToRoom.get(socketId);
  }

  removeSocketMapping(socketId: string): void {
    this.socketToRoom.delete(socketId);
  }

  /**
   * Maintenance & Utilities
   */

  getAllGames(): Map<string, GameState> {
    return new Map(this.games);
  }

  getGameCount(): number {
    return this.games.size;
  }

  resetGameTimer(roomId: string): void {
    this.clearGameTimer(roomId);

    const timer = setTimeout(() => {
      const game = this.games.get(roomId);
      if (game) {
        console.log(`[GameStateManager] Game ${roomId} timed out due to inactivity`);
        this.deleteGame(roomId);
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
        id: p.id, // This should be the persistent userId
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