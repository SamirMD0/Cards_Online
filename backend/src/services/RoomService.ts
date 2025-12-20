import { RoomMetadata, RoomListItem } from '../types/room.types.js';
import { ValidationError, ConflictError, NotFoundError } from '../utils/errors.js';

/**
 * RoomService: Pure business logic for room management
 * No Socket.IO, no external dependencies - just business rules
 */
export class RoomService {
  private rooms = new Map<string, RoomMetadata>();
  private static instance: RoomService;

  private constructor() {}

  static getInstance(): RoomService {
    if (!RoomService.instance) {
      RoomService.instance = new RoomService();
    }
    return RoomService.instance;
  }

  /**
   * Create a new room
   */
  createRoom(roomName: string, maxPlayers: number, hostId: string): RoomMetadata {
    // Validate inputs (defensive programming)
    if (!roomName || roomName.length > 50) {
      throw new ValidationError('Invalid room name');
    }
    if (maxPlayers < 2 || maxPlayers > 4) {
      throw new ValidationError('Max players must be 2-4');
    }

    const roomId = this.generateRoomId();
    const roomCode = this.generateRoomCode();

    const metadata: RoomMetadata = {
      roomName: roomName.trim(),
      roomCode,
      maxPlayers,
      createdAt: Date.now(),
      hostId
    };

    this.rooms.set(roomId, metadata);

    console.log(`[RoomService] Room created: ${roomId} (${roomCode}) by ${hostId}`);

    return metadata;
  }

  /**
   * Get room metadata by ID
   */
  getRoom(roomId: string): RoomMetadata | undefined {
    return this.rooms.get(roomId);
  }

  /**
   * Get room by code (for joining via code)
   */
  getRoomByCode(code: string): { roomId: string; metadata: RoomMetadata } | undefined {
    for (const [roomId, metadata] of this.rooms.entries()) {
      if (metadata.roomCode === code) {
        return { roomId, metadata };
      }
    }
    return undefined;
  }

  /**
   * Delete a room
   */
  deleteRoom(roomId: string): boolean {
    const deleted = this.rooms.delete(roomId);
    if (deleted) {
      console.log(`[RoomService] Room deleted: ${roomId}`);
    }
    return deleted;
  }

  /**
   * Get all rooms (for lobby list)
   */
  getAllRooms(): Map<string, RoomMetadata> {
    return new Map(this.rooms);
  }

  /**
   * Check if room exists
   */
  roomExists(roomId: string): boolean {
    return this.rooms.has(roomId);
  }

  /**
   * Validate room can be joined
   */
  canJoinRoom(roomId: string, gameStarted: boolean, currentPlayers: number): void {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      throw new NotFoundError('Room not found');
    }

    if (gameStarted) {
      throw new ConflictError('Game already started');
    }

    if (currentPlayers >= room.maxPlayers) {
      throw new ConflictError('Room is full');
    }
  }

  // ===== Private Helpers =====

  private generateRoomId(): string {
    return `room-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}