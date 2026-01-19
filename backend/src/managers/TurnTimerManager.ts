import { Server } from 'socket.io';
import { GameStateManager } from './GameStateManager.js';
import { getNextPlayer } from '../game/rules.js';

/**
 * TurnTimerManager: Handles automatic turn timeouts
 * 
 * - Creates timers for each player's turn
 * - Auto-draws card and skips turn on timeout
 * - Integrates with bot turn processor
 */
export class TurnTimerManager {
  private timers = new Map<string, NodeJS.Timeout>();
  private static instance: TurnTimerManager;

  private constructor() { }

  static getInstance(): TurnTimerManager {
    if (!TurnTimerManager.instance) {
      TurnTimerManager.instance = new TurnTimerManager();
    }
    return TurnTimerManager.instance;
  }

  /**
   * Start timer for current player
   */
  async startTimer(
    io: Server,
    roomId: string,
    gameManager: GameStateManager
  ): Promise<void> {
    // Clear any existing timer
    this.clearTimer(roomId);

    // Get game
    const game = await gameManager.getGame(roomId);
    if (!game || !game.gameStarted || game.winner) {
      return;
    }

    // Don't start timer for bots (they act immediately)
    const currentPlayer = game.players.find(p => p.id === game.currentPlayer);
    if (!currentPlayer || currentPlayer.isBot) {
      return;
    }

    console.log(`[TurnTimer] Starting 30s timer for ${currentPlayer.name} in ${roomId}`);

    // Start turn timer in game state
    game.startTurnTimer();
    await gameManager.saveGame(roomId);

    // Emit timer start to clients
    io.to(roomId).emit('turn_timer_started', {
      playerId: currentPlayer.id,
      duration: game.turnDuration,
      startTime: game.turnStartTime
    });

    // Set timeout
    const timer = setTimeout(async () => {
      await this.handleTimeout(io, roomId, gameManager);
    }, game.turnDuration);

    this.timers.set(roomId, timer);
  }

  /**
   * Clear timer for a room
   */
  clearTimer(roomId: string): void {
    const timer = this.timers.get(roomId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(roomId);
      console.log(`[TurnTimer] Cleared timer for ${roomId}`);
    }
  }

  /**
   * Handle timeout - auto-draw and skip turn
   */
  private async handleTimeout(
    io: Server,
    roomId: string,
    gameManager: GameStateManager
  ): Promise<void> {
    try {
      // Safety check: Verify game still exists (prevents orphaned timer callbacks)
      const game = await gameManager.getGame(roomId);
      if (!game || !game.gameStarted || game.winner) {
        console.log(`[TurnTimer] Timer fired for ${roomId} but game no longer active, ignoring`);
        return;
      }

      const currentPlayer = game.players.find(p => p.id === game.currentPlayer);
      if (!currentPlayer) {
        return;
      }

      console.log(`[TurnTimer] ⏱️ Turn timeout for ${currentPlayer.name} in ${roomId}`);

      // Auto-draw 1 card
      game.drawCard(currentPlayer.id);

      // Clear pending draws (timeout means they failed to act)
      game.pendingDraw = 0;

      // Emit timeout event
      io.to(roomId).emit('turn_timeout', {
        playerId: currentPlayer.id,
        playerName: currentPlayer.name
      });

      // Emit card drawn
      io.to(roomId).emit('cards_drawn', {
        playerId: currentPlayer.id,
        count: 1,
        wasForced: false
      });

      // Advance to next player
      game.currentPlayer = getNextPlayer(game);
      game.turnStartTime = null; // Reset timer

      // Emit updated state
      io.to(roomId).emit('game_state', game.getPublicState());

      // Persist changes
      await gameManager.saveGame(roomId);

      // Start timer for next player
      this.startTimer(io, roomId, gameManager);

      // If next player is bot, trigger bot turn
      const nextPlayer = game.players.find(p => p.id === game.currentPlayer);
      if (nextPlayer?.isBot) {
        const { processBotTurn } = await import('../socket/handlers/game/botTurnProcessor.js');
        setTimeout(() => processBotTurn(io, game, roomId, gameManager), 1500);
      }

    } catch (error) {
      console.error('[TurnTimer] Error handling timeout:', error);
    }
  }

  /**
   * Reset timer (call on valid actions)
   */
  async resetTimer(
    io: Server,
    roomId: string,
    gameManager: GameStateManager
  ): Promise<void> {
    this.clearTimer(roomId);
    this.startTimer(io, roomId, gameManager);
  }
}