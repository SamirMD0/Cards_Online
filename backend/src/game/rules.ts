import { Card, CardColor } from '../types/game.types.js';
import { GameState } from './gameState.js';

export function canPlayCard(card: Card, topCard: Card, chosenColor: CardColor | null = null): boolean {
  // Wild cards can always be played
  if (card.color === 'wild') return true;

  // Check if matches color (use chosenColor if top card is wild)
  const activeColor = topCard.color === 'wild' ? chosenColor : topCard.color;
  if (card.color === activeColor) return true;

  // Check if matches value
  if (card.value === topCard.value) return true;

  return false;
}

export function hasPlayableCard(hand: Card[], topCard: Card, chosenColor: CardColor | null): boolean {
  return hand.some(card => canPlayCard(card, topCard, chosenColor));
}

export function applyCardEffect(card: Card, gameState: GameState): void {
  const { value } = card;
  const valueStr = value.toString();

  switch (valueStr) {
    case 'skip':
      // Skip next player (advance by 2 positions)
      gameState.currentPlayer = getNextPlayer(gameState, 1);
      break;

    case 'reverse':
      // Reverse direction
      gameState.direction *= -1 as 1 | -1;
      
      // In 2-player game, reverse acts as skip
      if (gameState.players.length === 2) {
        gameState.currentPlayer = getNextPlayer(gameState, 1);
      }
      break;

    case 'draw2':
      // ✅ NEW: Next player must draw 2 AND loses turn
      gameState.pendingDraw = 2; // Set exactly 2 (no stacking)
      // Turn advances to victim, they'll auto-draw in botTurnProcessor or be forced in handler
      break;

    case 'wild_draw4':
      // ✅ NEW: Next player must draw 4 AND loses turn  
      gameState.pendingDraw = 4; // Set exactly 4 (no stacking)
      break;

    case 'wild':
      // ✅ Regular wild: ONLY changes color, no draw, no skip
      // Color is set in playCardHandler, nothing to do here
      break;

    default:
      // No effect for number cards
      break;
  }
}
export function getNextPlayer(gameState: GameState, skip: number = 0): string {
  const { players, currentPlayer, direction } = gameState;
  
  if (players.length === 0) {
    throw new Error('No players in game');
  }
  
  const currentIndex = players.findIndex(p => p.id === currentPlayer);
  
  if (currentIndex === -1) {
    // Current player not found, return first player
    return players[0].id;
  }
  
  const move = direction * (1 + skip);
  let nextIndex = (currentIndex + move) % players.length;
  
  // Handle negative indices
  if (nextIndex < 0) {
    nextIndex = players.length + nextIndex;
  }
  
  return players[nextIndex].id;
}

export function checkWinner(player: { hand: Card[] }): boolean {
  return player.hand.length === 0;
}