// backend/src/__tests__/room.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { io as ioClient, Socket } from 'socket.io-client';
// import { server } from '../../server.js';  // Export your http server
import { prisma } from '../../lib/prisma.js';
import { redis } from '../../lib/redisClient.js';
import { server as httpServer, io as ioServer } from '../../server.js';

const API_URL = 'http://localhost:3001';

describe('Room Join Integration', () => {
  let authToken: string;
  let userId: string;
  let socket: Socket;

  beforeAll(async () => {
    // Create test user
    const res = await request(API_URL)
      .post('/api/auth/register')
      .send({
        username: 'roomtester',
        email: 'roomtest@test.unittest',
        password: 'RoomTest123!'
      });

    authToken = res.body.token;
    userId = res.body.user.id;
  });

  afterAll(async () => {
    socket?.disconnect();
    await prisma.user.deleteMany({
      where: { email: 'roomtest@test.unittest' }
    });
    await redis.flushdb();
    await ioServer.close();
    await httpServer.close();
  });

  it('should allow joining a room as new player', (done) => {
    socket = ioClient(API_URL, {
      auth: { token: authToken }
    });

    socket.on('connect', () => {
      socket.emit('create_room', { roomName: 'Test Room', maxPlayers: 4 });
    });

    socket.on('room_created', (data) => {
      expect(data.roomId).toBeTruthy();
      expect(data.roomCode).toHaveLength(8);
      done();
    });

    socket.on('error', (err) => {
      done(err);
    });
  });

  it('should allow reconnecting to active game', (done) => {
    let roomId: string;

    const socket1 = ioClient(API_URL, { auth: { token: authToken } });

    socket1.on('connect', () => {
      socket1.emit('create_room', { roomName: 'Reconnect Test', maxPlayers: 2 });
    });

    socket1.on('room_created', (data) => {
      roomId = data.roomId;
      socket1.disconnect(); // Simulate disconnect

      // Reconnect with same user
      setTimeout(() => {
        const socket2 = ioClient(API_URL, { auth: { token: authToken } });

        socket2.on('connect', () => {
          socket2.emit('reconnect_to_game', { roomId });
        });

        socket2.on('game_restored', (data) => {
          expect(data.roomId).toBe(roomId);
          expect(data.message).toContain('Reconnected');
          socket2.disconnect();
          done();
        });

        socket2.on('error', (err) => {
          socket2.disconnect();
          done(err);
        });
      }, 500);
    });
  });

  it('should reject joining started game as new player', (done) => {
    let roomId: string;
    const socket1 = ioClient(API_URL, { auth: { token: authToken } });

    socket1.on('room_created', (data) => {
      roomId = data.roomId;
      socket1.emit('add_bot');
      socket1.emit('start_game');
    });

    socket1.on('game_started', () => {
      // Try to join with different user
      const socket2 = ioClient(API_URL, {
        auth: { token: 'different-token' }
      });

      socket2.emit('join_room', { roomId, playerName: 'Intruder' });

      socket2.on('error', (err) => {
        expect(err.message).toContain('Game already started');
        socket1.disconnect();
        socket2.disconnect();
        done();
      });
    });

    socket1.emit('create_room', { roomName: 'Started Game', maxPlayers: 2 });
  });
});