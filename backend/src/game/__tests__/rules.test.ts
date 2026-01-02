// backend/src/game/__tests__/rules.test.ts
import { describe, it, expect, beforeEach} from '@jest/globals';
import { canPlayCard, applyCardEffect, getNextPlayer } from '../rules.js';
import { GameState } from '../gameState.js';
import type { Card } from '../../types/game.types.js';
// import type { Card, CardColor } from '../../types/game.types.js';

describe('Game Rules', () => {
  describe('canPlayCard', () => {
    const redFive: Card = { id: 'r5', color: 'red', value: '5' };
    const blueSkip: Card = { id: 'bs', color: 'blue', value: 'skip' };
    const wildCard: Card = { id: 'w1', color: 'wild', value: 'wild' };

    it('should allow matching color', () => {
      const topCard: Card = { id: 'r7', color: 'red', value: '7' };
      expect(canPlayCard(redFive, topCard, null)).toBe(true);
    });

    it('should allow matching value', () => {
      const topCard: Card = { id: 'b5', color: 'blue', value: '5' };
      expect(canPlayCard(redFive, topCard, null)).toBe(true);
    });

    it('should reject non-matching card', () => {
      const topCard: Card = { id: 'g3', color: 'green', value: '3' };
      expect(canPlayCard(redFive, topCard, null)).toBe(false);
    });

    it('should always allow wild cards', () => {
      const topCard: Card = { id: 'y9', color: 'yellow', value: '9' };
      expect(canPlayCard(wildCard, topCard, null)).toBe(true);
    });

    it('should respect chosen color after wild', () => {
      const topCard: Card = { id: 'w1', color: 'wild', value: 'wild' };
      expect(canPlayCard(blueSkip, topCard, 'blue')).toBe(true);
      expect(canPlayCard(blueSkip, topCard, 'red')).toBe(false);
    });
  });

  describe('applyCardEffect - Draw Cards', () => {
    let gameState: GameState;

    beforeEach(() => {
      gameState = new GameState('test-room');
      gameState.addPlayer('p1', 'Player 1');
      gameState.addPlayer('p2', 'Player 2');
      gameState.currentPlayer = 'p1';
    });

    it('should set pendingDraw to 2 for draw2 cards', () => {
      const draw2: Card = { id: 'd2', color: 'red', value: 'draw2' };
      applyCardEffect(draw2, gameState);
      expect(gameState.pendingDraw).toBe(2);
    });

    it('should set pendingDraw to 4 for wild_draw4', () => {
      const draw4: Card = { id: 'wd4', color: 'wild', value: 'wild_draw4' };
      applyCardEffect(draw4, gameState);
      expect(gameState.pendingDraw).toBe(4);
    });

    it('should NOT set pendingDraw for regular wild', () => {
      const wild: Card = { id: 'w', color: 'wild', value: 'wild' };
      gameState.pendingDraw = 0;
      applyCardEffect(wild, gameState);
      expect(gameState.pendingDraw).toBe(0);
    });

    it('should NOT stack draw cards', () => {
      const draw2: Card = { id: 'd2', color: 'red', value: 'draw2' };
      gameState.pendingDraw = 2; // Already pending
      applyCardEffect(draw2, gameState);
      expect(gameState.pendingDraw).toBe(2); // Should be 2, not 4
    });
  });

  describe('getNextPlayer', () => {
    let gameState: GameState;

    beforeEach(() => {
      gameState = new GameState('test-room');
      gameState.addPlayer('p1', 'Player 1');
      gameState.addPlayer('p2', 'Player 2');
      gameState.addPlayer('p3', 'Player 3');
      gameState.currentPlayer = 'p1';
      gameState.direction = 1;
    });

    it('should advance clockwise', () => {
      const next = getNextPlayer(gameState);
      expect(next).toBe('p2');
    });

    it('should wrap around at end', () => {
      gameState.currentPlayer = 'p3';
      const next = getNextPlayer(gameState);
      expect(next).toBe('p1');
    });

    it('should advance counter-clockwise', () => {
      gameState.direction = -1;
      const next = getNextPlayer(gameState);
      expect(next).toBe('p3');
    });

    it('should skip a player', () => {
      const next = getNextPlayer(gameState, 1); // Skip 1
      expect(next).toBe('p3');
    });
  });
});