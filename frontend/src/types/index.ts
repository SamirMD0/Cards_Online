// Card Types
export type CardColor = 'red' | 'blue' | 'green' | 'yellow' | 'wild';
export type CardValue = string | number;

export interface Card {
  id: string;
  color: CardColor;
  value: CardValue;
}

// Player Types
export interface Player {
  id: string;
  name: string;
  hand: Card[];
  isBot: boolean;
  isHost?: boolean;
  isReady?: boolean;
}

// Room Types
export interface Room {
  id: string;
  roomName: string;
  roomCode: string;
  players: Player[];
  maxPlayers: number;
  gameStarted: boolean;
  hostId: string;
}

// Game State Types
export interface GameState {
  roomId: string;
  players: Player[];
  currentPlayer: string | null;
  direction: 1 | -1;
  topCard: Card | null;
  currentColor: CardColor | null;
  deckCount: number;
  pendingDraw: number;
  gameStarted: boolean;
  winner: string | null;
}

// Socket Event Types
export interface JoinRoomData {
  roomId: string;
  playerName: string;
}

export interface PlayCardData {
  cardId: string;
  chosenColor?: CardColor;
}

export interface CreateRoomData {
  roomName: string;
  maxPlayers: number;
}