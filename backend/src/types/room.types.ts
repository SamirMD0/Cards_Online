export interface RoomMetadata {
  roomName: string;
  roomCode: string;
  maxPlayers: number;
  createdAt: number;
  hostId: string;
}

export interface RoomListItem {
  id: string;
  roomName: string;
  roomCode: string;
  players: Array<{
    id: string;
    name: string;
    isHost: boolean;
    isReady: boolean;
    isBot: boolean;
  }>;
  maxPlayers: number;
  gameStarted: boolean;
}

// Input validation types
export interface CreateRoomInput {
  roomName: string;
  maxPlayers: number;
}

export interface JoinRoomInput {
  roomId: string;
  playerName: string;
}

export interface PlayCardInput {
  cardId: string;
  chosenColor?: string;
}