// backend/src/socket/handlers/game/drawCardHandler.ts
import { Server } from 'socket.io';
import { Socket } from '../../../types/socket.types.js';
import { GameStateManager } from '../../../managers/GameStateManager.js';
import { getNextPlayer } from '../../../game/rules.js';
import { emitError } from '../../../utils/errors.js';
import { requireGameContext, requireTurn, requirePlayer } from './validators.js';
import { processBotTurn } from './botTurnProcessor.js';
import { Card } from '../../../types/game.types.js';

export async function handleDrawCard(
  io: Server,
  socket: Socket,
  gameManager: GameStateManager
) {
  try {
    const { userId, roomId, game } = await requireGameContext(socket, gameManager);

    requireTurn(game, userId);
    const player = requirePlayer(game, userId);

    const drawCount = game.pendingDraw > 0 ? game.pendingDraw : 1;

    console.log(`[DrawCard] ${player.name} drawing ${drawCount} card(s)`);

    const drawnCards: Card[] = [];
    for (let i = 0; i < drawCount; i++) {
      const drawn = game.drawCard(userId);
      if (drawn.length > 0) {
        drawnCards.push(drawn[0]);
      }
    }

    game.pendingDraw = 0;

    io.to(roomId).emit('cards_drawn', {
      playerId: userId,
      count: drawnCards.length
    });

    socket.emit('hand_update', { hand: player.hand });

    game.currentPlayer = getNextPlayer(game);

    io.to(roomId).emit('game_state', game.getPublicState());

    gameManager.resetGameTimer(roomId);

 
    await gameManager.saveGame(roomId);

    const nextPlayer = game.players.find(p => p.id === game.currentPlayer);
    if (nextPlayer?.isBot) {
      setTimeout(
        () => processBotTurn(io, game, roomId, gameManager),
        1500
      );
    }

  } catch (error) {
    console.error('[DrawCard] Error:', error);
    emitError(socket, error);
  }
}
