import { canPlayCard } from '../game/rules.js';
import { Card, CardColor } from '../types/game.types.js';

interface DrawAction {
  action: 'draw';
}

interface PlayAction {
  action: 'play';
  card: Card;
  chosenColor: CardColor | null;
}

type BotMove = DrawAction | PlayAction;

export function getBotMove(hand: Card[], topCard: Card, currentColor: CardColor | null): BotMove {
  // Find all playable cards
  const playableCards = hand.filter(card =>
    canPlayCard(card, topCard, currentColor)
  );

  if (playableCards.length === 0) {
    return { action: 'draw' };
  }

  // Prioritize: non-wild > wild
  const nonWildCards = playableCards.filter(c => c.color !== 'wild');
  const cardToPlay = nonWildCards.length > 0
    ? nonWildCards[0]
    : playableCards[0];

  // If playing wild, choose most common color in hand
  let chosenColor: CardColor | null = null;
  if (cardToPlay.color === 'wild') {
    const colorCounts: Record<Exclude<CardColor, 'wild'>, number> = { red: 0, blue: 0, green: 0, yellow: 0 };
    hand.forEach(card => {
      if (card.color !== 'wild') colorCounts[card.color]++;
    });
    chosenColor = Object.entries(colorCounts)
      .sort((a, b) => b[1] - a[1])[0][0] as CardColor;
  }

  return {
    action: 'play',
    card: cardToPlay,
    chosenColor
  };
}