import { io, Socket } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

class SocketService {
  public socket: Socket;

  constructor() {
    this.socket = io(SERVER_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupListeners();
  }

  private setupListeners() {
    this.socket.on('connect', () => {
      console.log('✅ Connected to server:', this.socket.id);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });
  }

  connect() {
    if (!this.socket.connected) {
      this.socket.connect();
    }
  }

  disconnect() {
    if (this.socket.connected) {
      this.socket.disconnect();
    }
  }

  // Room Management
  getRooms() {
    this.socket.emit('get_rooms');
  }

  createRoom(roomName: string, maxPlayers: number) {
    this.socket.emit('create_room', { roomName, maxPlayers });
  }

  joinRoom(roomId: string, playerName: string) {
    this.socket.emit('join_room', { roomId, playerName });
  }

  leaveRoom() {
    this.socket.emit('leave_room');
  }

  // Game Actions
  startGame() {
    this.socket.emit('start_game');
  }

  playCard(cardId: string, chosenColor?: string) {
    this.socket.emit('play_card', { cardId, chosenColor });
  }

  drawCard() {
    this.socket.emit('draw_card');
  }

  addBot() {
    this.socket.emit('add_bot');
  }

  // Event Listeners
  onRoomsList(callback: (rooms: any[]) => void) {
    this.socket.on('rooms_list', callback);
  }

  onRoomCreated(callback: (data: any) => void) {
    this.socket.on('room_created', callback);
  }

  onJoinedRoom(callback: (data: any) => void) {
    this.socket.on('joined_room', callback);
  }

  onGameState(callback: (state: any) => void) {
    this.socket.on('game_state', callback);
  }

  onGameStarted(callback: (state: any) => void) {
    this.socket.on('game_started', callback);
  }

  onHandUpdate(callback: (data: any) => void) {
    this.socket.on('hand_update', callback);
  }

  onCardPlayed(callback: (data: any) => void) {
    this.socket.on('card_played', callback);
  }

  onCardDrawn(callback: (data: any) => void) {
    this.socket.on('card_drawn', callback);
  }

  onGameOver(callback: (data: any) => void) {
    this.socket.on('game_over', callback);
  }

  onPlayerJoined(callback: (data: any) => void) {
    this.socket.on('player_joined', callback);
  }

  onPlayerLeft(callback: (data: any) => void) {
    this.socket.on('player_left', callback);
  }

  onError(callback: (error: any) => void) {
    this.socket.on('error', callback);
  }

  // Remove Listeners
  off(event: string, callback?: any) {
    this.socket.off(event, callback);
  }
}

export const socketService = new SocketService();
export const socket = socketService.socket;