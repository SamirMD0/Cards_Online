import { Server } from 'socket.io';
import { Socket } from '../../types/socket.types.js';
import { RoomService } from '../../services/RoomService.js';
import { GameStateManager } from '../../managers/GameStateManager.js';
import { validateCreateRoom, validateJoinRoom } from '../../validators/schemas.js';
import { emitError } from '../../utils/errors.js';

/**
 * Room Handlers: THIN layer between Socket.IO and business logic
 * Responsibilities:
 * 1. Validate input
 * 2. Call services
 * 3. Handle Socket.IO events
 * 
 * NO business logic here!
 */

export function setupRoomHandlers(
  io: Server,
  socket: Socket,
  roomService: RoomService,
  gameManager: GameStateManager
) {
  
  /**
   * Get all rooms (for lobby)
   */
  socket.on('get_rooms', () => {
    try {
      const roomsList = buildRoomsList(roomService, gameManager);
      socket.emit('rooms_list', roomsList);
    } catch (error) {
      emitError(socket, error);
    }
  });

  /**
   * Create a new room
   */
  socket.on('create_room', (data) => {
    try {
      // 1. Validate
      const validated = validateCreateRoom(data);

      // 2. Business logic (service)
      const metadata = roomService.createRoom(
        validated.roomName,
        validated.maxPlayers,
        socket.id
      );

      // Generate room ID (we need to store it)
      const roomId = Array.from(roomService.getAllRooms().entries())
        .find(([_, meta]) => meta.roomCode === metadata.roomCode)?.[0];

      if (!roomId) {
        throw new Error('Failed to create room');
      }

      // 3. Create game state
      gameManager.createGame(roomId);

      // 4. Socket.IO operations
      socket.emit('room_created', { 
        roomId, 
        roomCode: metadata.roomCode 
      });

      // 5. Broadcast updated room list
      broadcastRoomsList(io, roomService, gameManager);

    } catch (error) {
      emitError(socket, error);
    }
  });

  /**
   * Join an existing room
   */
  socket.on('join_room', (data) => {
    try {
      // 1. Validate
      const validated = validateJoinRoom(data);
      const { roomId, playerName } = validated;

      // 2. Get game and room
      const game = gameManager.getGameOrThrow(roomId);
      const room = roomService.getRoom(roomId);

      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      // 3. Validate can join
      roomService.canJoinRoom(roomId, game.gameStarted, game.players.length);

      // 4. Add player to game
      const added = game.addPlayer(socket.id, playerName);
      if (!added) {
        socket.emit('error', { message: 'Failed to join room' });
        return;
      }

      // 5. Socket.IO operations
      socket.join(roomId);
      socket.data.roomId = roomId;
      socket.data.playerName = playerName;
      gameManager.setPlayerRoom(socket.id, roomId);
      gameManager.resetGameTimer(roomId);

      // 6. Notify
      socket.emit('joined_room', { roomId });
      io.to(roomId).emit('game_state', game.getPublicState());
      io.to(roomId).emit('player_joined', { 
        playerId: socket.id, 
        playerName 
      });

      // 7. Broadcast updated room list
      broadcastRoomsList(io, roomService, gameManager);

      console.log(`[RoomHandlers] ${playerName} joined room ${roomId}`);

    } catch (error) {
      emitError(socket, error);
    }
  });

  /**
   * Leave current room
   */
  socket.on('leave_room', () => {
    try {
      const roomId = gameManager.getPlayerRoom(socket.id);
      if (!roomId) return;

      handlePlayerLeave(io, socket, roomId, roomService, gameManager);

    } catch (error) {
      emitError(socket, error);
    }
  });
}

// ===== Helper Functions =====

/**
 * Build rooms list for lobby
 */
function buildRoomsList(
  roomService: RoomService,
  gameManager: GameStateManager
): any[] {
  const rooms: any[] = [];

  for (const [roomId, metadata] of roomService.getAllRooms().entries()) {
    const game = gameManager.getGame(roomId);
    if (game) {
      rooms.push(gameManager.buildRoomListItem(roomId, game, metadata));
    }
  }

  return rooms;
}

/**
 * Broadcast rooms list to all connected clients
 */
function broadcastRoomsList(
  io: Server,
  roomService: RoomService,
  gameManager: GameStateManager
): void {
  const roomsList = buildRoomsList(roomService, gameManager);
  io.emit('rooms_list', roomsList);
}

/**
 * Handle player leaving a room
 */
export function handlePlayerLeave(
  io: Server,
  socket: Socket,
  roomId: string,
  roomService: RoomService,
  gameManager: GameStateManager
): void {
  const game = gameManager.getGame(roomId);
  if (!game) return;

  // Remove player from game
  game.removePlayer(socket.id);

  // If room is empty, delete everything
  if (game.players.length === 0) {
    gameManager.deleteGame(roomId);
    roomService.deleteRoom(roomId);
  } else {
    // Notify remaining players
    io.to(roomId).emit('player_left', { playerId: socket.id });
    io.to(roomId).emit('game_state', game.getPublicState());
  }

  // Cleanup
  socket.leave(roomId);
  gameManager.removePlayerMapping(socket.id);

  // Broadcast updated room list
  broadcastRoomsList(io, roomService, gameManager);
}