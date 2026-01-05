import { RoomMetadata } from '../types/room.types.js';
import { ValidationError, ConflictError, NotFoundError } from '../utils/errors.js';
import { randomBytes } from 'crypto';
/**
 * RoomService: Pure business logic for room management
 * No Socket.IO, no external dependencies - just business rules
 */
export class RoomService {
  private rooms = new Map<string, RoomMetadata>();
  private static instance: RoomService;

  private constructor() { }

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
  canJoinRoom(
    roomId: string,
    gameStarted: boolean,
    currentPlayers: any[], // Pass the actual players array from your GameManager/State
    userId: string         // Pass the ID of the user trying to join
  ): void {
    const room = this.rooms.get(roomId);

    if (!room) {
      throw new NotFoundError('Room not found');
    }

    // Check if this specific user is already one of the players in the room
    const isUserAlreadyInRoom = currentPlayers.some(p => p.id === userId);

    // If the game has started, ONLY allow entry if the user is already in the player list
    if (gameStarted && !isUserAlreadyInRoom) {
      throw new ConflictError('Game already started');
    }

    // If the room is full, ONLY allow entry if the user is already in the player list
    if (currentPlayers.length >= room.maxPlayers && !isUserAlreadyInRoom) {
      throw new ConflictError('Room is full');
    }
  }

  // ===== Private Helpers =====

  private generateRoomId(): string {
    return `room-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  private generateRoomCode(): string {
    // Use crypto.randomBytes for secure randomness
    // 8 characters from base36 (2.8 trillion combinations)
    const bytes = randomBytes(6);
    let code = '';

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous chars

    for (let i = 0; i < 8; i++) {
      code += chars[bytes[i % bytes.length] % chars.length];
    }

    return code;
  }
}