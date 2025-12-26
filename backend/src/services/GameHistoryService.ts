import { prisma } from '../lib/prisma.js';
import { GameState } from '../game/gameState.js';

/**
 * GameHistoryService: Save completed games to PostgreSQL
 * 
 * This enables:
 * - Leaderboards
 * - Match history
 * - Player statistics
 * - Game replays (future)
 */
export class GameHistoryService {
  
  /**
   * Save a completed game to the database
   * Call this when game.winner is set
   */
  static async saveCompletedGame(game: GameState, roomCode: string): Promise<void> {
    try {
      // Only save if game actually started and finished
      if (!game.gameStarted || !game.winner) {
        console.log('[GameHistory] Game not completed, skipping save');
        return;
      }

      console.log(`[GameHistory] Saving completed game ${game.roomId}`);

      // Calculate final rankings
      const rankings = this.calculateRankings(game);

      // Create game record with players
      const gameRecord = await prisma.game.create({
        data: {
          roomCode,
          status: 'COMPLETED',
          winnerId: game.winner,
          startedAt: new Date(Date.now() - 10 * 60 * 1000), // Estimate (10 min ago)
          endedAt: new Date(),
          players: {
            create: game.players.map((player, index) => ({
              userId: player.id,
              position: index,
              finalRank: rankings[player.id] || null,
              isBot: player.isBot
            }))
          }
        },
        include: {
          players: true
        }
      });

      console.log(`[GameHistory] Saved game ${gameRecord.id} to database`);

    } catch (error) {
      console.error('[GameHistory] Failed to save game:', error);
      // Don't throw - this shouldn't break the game flow
    }
  }

  /**
   * Calculate player rankings based on hand size
   * Winner = 1, second place = 2, etc.
   */
  private static calculateRankings(game: GameState): Record<string, number> {
    const rankings: Record<string, number> = {};

    // Winner gets rank 1
    if (game.winner) {
      rankings[game.winner] = 1;
    }

    // Sort remaining players by hand size (fewer cards = better rank)
    const remainingPlayers = game.players
      .filter(p => p.id !== game.winner)
      .sort((a, b) => a.hand.length - b.hand.length);

    // Assign ranks
    remainingPlayers.forEach((player, index) => {
      rankings[player.id] = index + 2; // Start from rank 2
    });

    return rankings;
  }

  /**
   * Get player's game history
   */
  static async getPlayerHistory(userId: string, limit: number = 10) {
    return await prisma.gamePlayer.findMany({
      where: { userId },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        game: {
          include: {
            players: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    avatar: true
                  }
                }
              }
            }
          }
        }
      }
    });
  }

  /**
   * Get player statistics
   */
  static async getPlayerStats(userId: string) {
    const games = await prisma.gamePlayer.findMany({
      where: { userId, isBot: false },
      include: {
        game: {
          select: {
            status: true,
            winnerId: true
          }
        }
      }
    });

    const totalGames = games.length;
    const wins = games.filter(g => g.game.winnerId === userId).length;
    const losses = games.filter(g => 
      g.game.status === 'COMPLETED' && g.game.winnerId !== userId
    ).length;

    return {
      totalGames,
      wins,
      losses,
      winRate: totalGames > 0 ? (wins / totalGames) * 100 : 0
    };
  }
}