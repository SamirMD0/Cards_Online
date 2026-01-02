// backend/src/services/__tests__/AuthService.test.ts
import { describe, it, expect, afterAll } from '@jest/globals';
import { AuthService } from '../../services/AuthService.js';
import { prisma } from '../../lib/prisma.js';
import jwt from 'jsonwebtoken';
import { server as httpServer, io as ioServer } from '../../server.js';

// import { ValidationError } from '../../utils/errors.js';

describe('AuthService', () => {
  // Clean up test users
  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { contains: '@test.unittest' } }
    });

     await ioServer.close();
     await httpServer.close();
    
  });

  describe('Password Validation', () => {
    it('should reject passwords under 12 characters', async () => {
      await expect(
        AuthService.register('testuser', 'test@test.unittest', 'Short1!')
      ).rejects.toThrow('Password must be at least 12 characters');
    });

    it('should reject passwords without complexity', async () => {
      await expect(
        AuthService.register('testuser', 'test@test.unittest', 'alllowercase123')
      ).rejects.toThrow('Password must contain at least 3 of');
    });

    it('should accept strong passwords', async () => {
      const result = await AuthService.register(
        'testuser1',
        'test1@test.unittest',
        'StrongPass123!'
      );
      expect(result.user.username).toBe('testuser1');
      expect(result.token).toBeTruthy();
    });
  });

  describe('Username Validation', () => {
    it('should reject usernames with special characters', async () => {
      await expect(
        AuthService.register('test<script>', 'test@test.unittest', 'StrongPass123!')
      ).rejects.toThrow('Username can only contain letters, numbers, - and _');
    });

    it('should reject duplicate usernames', async () => {
      await AuthService.register('dupuser', 'dup1@test.unittest', 'StrongPass123!');
      
      await expect(
        AuthService.register('dupuser', 'dup2@test.unittest', 'StrongPass123!')
      ).rejects.toThrow('Username or email already taken');
    });
  });

  describe('Token Generation', () => {
    it('should generate valid JWT tokens', async () => {
      const { user, token } = await AuthService.register(
        'tokenuser',
        'token@test.unittest',
        'StrongPass123!'
      );

      const verified = await AuthService.verifyToken(token);
      expect(verified.id).toBe(user.id);
      expect(verified.username).toBe('tokenuser');
    });

    it('should reject expired tokens', async () => {
      // Create a token that expired 1 day ago
      const expiredToken = jwt.sign(
        { userId: 'fake-id' },
        process.env.JWT_SECRET!,
        { expiresIn: '-1d' }
      );

      await expect(
        AuthService.verifyToken(expiredToken)
      ).rejects.toThrow('Invalid token');
    });
  });
});