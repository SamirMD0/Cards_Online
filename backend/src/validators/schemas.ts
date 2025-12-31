import { ValidationError } from '../utils/errors.js';
import { CreateRoomInput, JoinRoomInput, PlayCardInput } from '../types/room.types.js';

// Simple validation functions (we'll use a library like Zod later)

function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML chars
    .substring(0, 100); // Max length
}

export function validateCreateRoom(data: any): CreateRoomInput {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Invalid input data');
  }

  const { roomName, maxPlayers } = data;

  // Validate room name
  if (!roomName || typeof roomName !== 'string') {
    throw new ValidationError('Room name is required');
  }
  if (roomName.length < 1 || roomName.length > 50) {
    throw new ValidationError('Room name must be 1-50 characters');
  }
  if (!/^[a-zA-Z0-9\s-_]+$/.test(roomName)) {
    throw new ValidationError('Room name contains invalid characters');
  }

  // Validate max players
  if (typeof maxPlayers !== 'number') {
    throw new ValidationError('Max players must be a number');
  }
  if (maxPlayers < 2 || maxPlayers > 4) {
    throw new ValidationError('Max players must be between 2 and 4');
  }

  return {
    roomName: sanitizeString(roomName),
    maxPlayers
  };
}

export function validateJoinRoom(data: any): JoinRoomInput {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Invalid input data');
  }

  const { roomId, playerName } = data;

  // Validate room ID
  if (!roomId || typeof roomId !== 'string') {
    throw new ValidationError('Room ID is required');
  }
  if (roomId.length > 100) {
    throw new ValidationError('Invalid room ID');
  }

  // Validate player name
  if (!playerName || typeof playerName !== 'string') {
    throw new ValidationError('Player name is required');
  }
  if (playerName.length < 1 || playerName.length > 30) {
    throw new ValidationError('Player name must be 1-30 characters');
  }
  if (!/^[a-zA-Z0-9\s-_]+$/.test(playerName)) {
    throw new ValidationError('Player name contains invalid characters');
  }

  return {
    roomId: roomId.trim(),
    playerName: sanitizeString(playerName)
  };
}

export function validatePlayCard(data: any): PlayCardInput {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Invalid input data');
  }

  const { cardId, chosenColor } = data;

  if (!cardId || typeof cardId !== 'string') {
    throw new ValidationError('Card ID is required');
  }

  if (chosenColor !== undefined) {
    const validColors = ['red', 'blue', 'green', 'yellow'];
    if (!validColors.includes(chosenColor)) {
      throw new ValidationError('Invalid color choice');
    }
  }

  return {
    cardId: cardId.trim(),
    chosenColor
  };
}