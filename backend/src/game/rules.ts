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

export function applyCardEffect(card: Card, gameState: any) {
  const { value } = card;
  const valueStr = value.toString();

  switch (valueStr) {
    case 'skip':
      gameState.currentPlayer = getNextPlayer(gameState, 1);
      break;

    case 'reverse':
      gameState.direction *= -1;
      if (gameState.players.length === 2) {
        // In 2-player, reverse acts as skip
        gameState.currentPlayer = getNextPlayer(gameState, 1);
      }
      break;

    case 'draw2':
      gameState.pendingDraw = (gameState.pendingDraw || 0) + 2;
      break;

    case 'wild_draw4':
      gameState.pendingDraw = (gameState.pendingDraw || 0) + 4;
      break;
  }

  return gameState;
}

export function getNextPlayer(gameState: any, skip = 0): string {
  const { players, currentPlayer, direction } = gameState;
  const currentIndex = players.findIndex((p: any) => p.id === currentPlayer);
  const nextIndex = (currentIndex + direction * (1 + skip) + players.length) % players.length;
  return players[nextIndex].id;
}

export function checkWinner(player: any): boolean {
  return player.hand.length === 0;
}