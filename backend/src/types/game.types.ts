// Card types
export type CardColor = 'red' | 'blue' | 'green' | 'yellow' | 'wild';
export type CardValue = string | number;

export interface Card {
  id: string;
  color: CardColor;
  value: CardValue;
}

// Player types
export interface Player {
  id: string;
  name: string;
  hand: Card[];
  isBot: boolean;
}

// Game state
export interface GameStateData {
  roomId: string;
  players: Player[];
  deck: Card[];
  discardPile: Card[];
  currentPlayer: string | null;
  direction: 1 | -1;
  currentColor: CardColor | null;
  pendingDraw: number;
  gameStarted: boolean;
  winner: string | null;
}

// Public game state (sent to clients)
export interface PublicGameState {
  roomId: string;
  players: Array<{
    id: string;
    name: string;
    handCount: number;
    isBot: boolean;
  }>;
  currentPlayer: string | null;
  direction: 1 | -1;
  topCard: Card | null;
  currentColor: CardColor | null;
  deckCount: number;
  pendingDraw: number;
  gameStarted: boolean;
  winner: string | null;
}