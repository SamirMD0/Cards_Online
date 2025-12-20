import { GameState } from '../game/gameState.js';
import { NotFoundError } from '../utils/errors.js';
import { PublicGameState } from '../types/game.types.js';

/**
 * GameStateManager: Centralized game state management
 * Wraps existing GameState class with better encapsulation
 */
export class GameStateManager {
  private games = new Map<string, GameState>();
  private gameTimers = new Map<string, NodeJS.Timeout>();
  private playerToRoom = new Map<string, string>();
  
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
   * Delete game
   */
  deleteGame(roomId: string): boolean {
    this.clearGameTimer(roomId);
    
    // Remove all player mappings for this room
    for (const [playerId, mappedRoomId] of this.playerToRoom.entries()) {
      if (mappedRoomId === roomId) {
        this.playerToRoom.delete(playerId);
      }
    }

    const deleted = this.games.delete(roomId);
    if (deleted) {
      console.log(`[GameStateManager] Game deleted for room: ${roomId}`);
    }
    return deleted;
  }

  /**
   * Map player to room
   */
  setPlayerRoom(playerId: string, roomId: string): void {
    this.playerToRoom.set(playerId, roomId);
  }

  /**
   * Get room ID for player
   */
  getPlayerRoom(playerId: string): string | undefined {
    return this.playerToRoom.get(playerId);
  }

  /**
   * Remove player from room mapping
   */
  removePlayerMapping(playerId: string): void {
    this.playerToRoom.delete(playerId);
  }

  /**
   * Get all active games
   */
  getAllGames(): Map<string, GameState> {
    return new Map(this.games);
  }

  /**
   * Get game count
   */
  getGameCount(): number {
    return this.games.size;
  }

  /**
   * Reset inactivity timer for a game
   */
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

  /**
   * Clear timer for a game
   */
  private clearGameTimer(roomId: string): void {
    const timer = this.gameTimers.get(roomId);
    if (timer) {
      clearTimeout(timer);
      this.gameTimers.delete(roomId);
    }
  }

  /**
   * Build public game state for a room (used for room list)
   */
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