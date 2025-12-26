import { Server } from 'socket.io';
import { Socket } from '../../types/socket.types.js';
import { RoomService } from '../../services/RoomService.js';
import { GameStateManager } from '../../managers/GameStateManager.js';
import { validateCreateRoom, validateJoinRoom } from '../../validators/schemas.js';
import { emitError } from '../../utils/errors.js';

/**
 * Room Handlers: THIN layer between Socket.IO and business logic
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
  socket.on('get_rooms', async () => {
    try {
      const roomsList = await buildRoomsList(roomService, gameManager);
      socket.emit('rooms_list', roomsList);
    } catch (error) {
      emitError(socket, error);
    }
  });

  /**
   * Create a new room
   */
  socket.on('create_room', async (data) => {
    try {
      const validated = validateCreateRoom(data);

      if (!socket.data.userId) {
        throw new Error('User not authenticated');
      }

      const metadata = roomService.createRoom(
        validated.roomName,
        validated.maxPlayers,
        socket.data.userId
      );

      const roomId = Array.from(roomService.getAllRooms().entries())
        .find(([_, meta]) => meta.roomCode === metadata.roomCode)?.[0];

      if (!roomId) {
        throw new Error('Failed to create room');
      }

      gameManager.createGame(roomId);

      socket.emit('room_created', {
        roomId,
        roomCode: metadata.roomCode
      });

      await broadcastRoomsList(io, roomService, gameManager);

      console.log(`[RoomHandlers] ${socket.data.username} created room ${roomId} (${metadata.roomCode})`);

    } catch (error) {
      emitError(socket, error);
    }
  });

  /**
   * Join an existing room
   */
  socket.on('join_room', async (data) => {
    try {
      const validated = validateJoinRoom(data);
      const { roomId, playerName } = validated;

      if (!socket.data.userId) {
        throw new Error('User not authenticated');
      }

      const userId = socket.data.userId;
      const game = await gameManager.getGameOrThrow(roomId);
      const room = roomService.getRoom(roomId);

      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      roomService.canJoinRoom(roomId, game.gameStarted, game.players.length);

      // Add player using userId (stored in internal game state)
      const added = game.addPlayer(userId, playerName);
      if (!added) {
        socket.emit('error', { message: 'Failed to join room' });
        return;
      }

      // ✅ FIX: Track socket-to-room mapping explicitly
      socket.join(roomId);
      gameManager.setSocketRoom(socket.id, roomId);
      gameManager.resetGameTimer(roomId);

      socket.emit('joined_room', { roomId });
      io.to(roomId).emit('game_state', game.getPublicState());
      io.to(roomId).emit('player_joined', {
        playerId: userId,
        playerName
      });

      await broadcastRoomsList(io, roomService, gameManager);

      console.log(`[RoomHandlers] ${playerName} (userId: ${userId}) joined room ${roomId}`);

    } catch (error) {
      emitError(socket, error);
    }
  });

  /**
   * Leave current room
   */
  socket.on('leave_room', async () => {
    try {
      // ✅ FIX: Use the renamed mapping method
      const roomId = gameManager.getSocketRoom(socket.id);
      if (!roomId) return;

      await handlePlayerLeave(io, socket, roomId, roomService, gameManager);

    } catch (error) {
      emitError(socket, error);
    }
  });
}

// ===== Helper Functions =====

async function buildRoomsList(
  roomService: RoomService,
  gameManager: GameStateManager
): Promise<any[]> {
  const rooms: any[] = [];
  for (const [roomId, metadata] of roomService.getAllRooms().entries()) {
    const game = await gameManager.getGame(roomId);
    if (game) {
      rooms.push(gameManager.buildRoomListItem(roomId, game, metadata));
    }
  }
  return rooms;
}

async function broadcastRoomsList(
  io: Server,
  roomService: RoomService,
  gameManager: GameStateManager
): Promise<void> {
  const roomsList = await buildRoomsList(roomService, gameManager);
  io.emit('rooms_list', roomsList);
}

/**
 * Handle player leaving a room
 */
export async function handlePlayerLeave(
  io: Server,
  socket: Socket,
  roomId: string,
  roomService: RoomService,
  gameManager: GameStateManager
): Promise<void> {
  const game = await gameManager.getGame(roomId);
  if (!game) return;

  const userId = socket.data.userId;
  if (!userId) {
    console.warn('[RoomHandlers] No userId found on socket during leave');
    return;
  }

  // Remove by persistent userId
  game.removePlayer(userId);

  // ✅ FIX: Clean up transport mapping
  socket.leave(roomId);
  gameManager.removeSocketMapping(socket.id);

  if (game.players.length === 0) {
    gameManager.deleteGame(roomId);
    roomService.deleteRoom(roomId);
  } else {
    io.to(roomId).emit('player_left', { playerId: userId });
    io.to(roomId).emit('game_state', game.getPublicState());
  }

  await broadcastRoomsList(io, roomService, gameManager);
}
