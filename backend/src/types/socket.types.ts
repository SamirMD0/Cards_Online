import { Socket as IOSocket } from 'socket.io';

// Extend Socket.IO types with our custom data
export interface SocketData {
  roomId?: string;
  playerName?: string;
  userId?: string; // For future auth
}

export type Socket = IOSocket<
  ClientToServerEvents,
  ServerToClientEvents,
  {},
  SocketData
>;

// Client → Server events
export interface ClientToServerEvents {
  get_rooms: () => void;
  create_room: (data: { roomName: string; maxPlayers: number }) => void;
  join_room: (data: { roomId: string; playerName: string }) => void;
  leave_room: () => void;
  add_bot: () => void;
  start_game: () => void;
  play_card: (data: { cardId: string; chosenColor?: string }) => void;
  draw_card: () => void;
}

// Server → Client events
export interface ServerToClientEvents {
  rooms_list: (rooms: any[]) => void;
  room_created: (data: { roomId: string; roomCode: string }) => void;
  joined_room: (data: { roomId: string }) => void;
  game_state: (state: any) => void;
  game_started: (state: any) => void;
  hand_update: (data: { hand: any[] }) => void;
  card_played: (data: { playerId: string; card: any; chosenColor: string }) => void;
  card_drawn: (data: { playerId: string }) => void;
  cards_drawn: (data: { playerId: string; count: number }) => void;
  game_over: (data: { winner: string; winnerId: string }) => void;
  player_joined: (data: { playerId: string; playerName: string }) => void;
  player_left: (data: { playerId: string }) => void;
  error: (error: { message: string }) => void;
}