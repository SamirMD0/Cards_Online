import { Card, CardColor, Player, PublicGameState } from '../types/game.types.js';
import { createDeck, drawCards, shuffleDeck } from './deck.js';
import { getNextPlayer } from './rules.js';


/* ===== Types ===== */

export type Direction = 1 | -1;

/* ===== GameState ===== */

export class GameState {
   roomId: string;
  players: Player[];
  deck: Card[];
  discardPile: Card[];
  currentPlayer: string | null;
  direction: Direction;
  currentColor: CardColor | null;
  pendingDraw: number;
  gameStarted: boolean;
  winner: string | null;
  
  // ✅ NEW: Turn timer fields
  turnStartTime: number | null; // Timestamp when turn started
  turnDuration: number; // Milliseconds (30 seconds = 30000)

  constructor(roomId: string) {
    this.roomId = roomId;
    this.players = [];
    this.deck = [];
    this.discardPile = [];
    this.currentPlayer = null;
    this.direction = 1;
    this.currentColor = null;
    this.pendingDraw = 0;
    this.gameStarted = false;
    this.winner = null;
    
    // ✅ NEW: Initialize timer
    this.turnStartTime = null;
    this.turnDuration = 30000; // 30 seconds
  }
  
   // ✅ NEW: Helper to start turn timer
  startTurnTimer(): void {
    this.turnStartTime = Date.now();
  }
  
  // ✅ NEW: Helper to check if turn expired
  isTurnExpired(): boolean {
    if (!this.turnStartTime) return false;
    return Date.now() - this.turnStartTime > this.turnDuration;
  }
  
  // ✅ NEW: Get remaining time
  getTurnTimeRemaining(): number {
    if (!this.turnStartTime) return this.turnDuration;
    const elapsed = Date.now() - this.turnStartTime;
    return Math.max(0, this.turnDuration - elapsed);
  }
  

  addPlayer(playerId: string, playerName: string, isBot: boolean = false): boolean {
    if (this.players.length >= 4) return false;
    if (this.players.some(p => p.id === playerId)) return false;

    this.players.push({
      id: playerId,
      name: playerName,
      hand: [],
      isBot
    });

    return true;
  }

  removePlayer(playerId: string): void {
    this.players = this.players.filter(p => p.id !== playerId);

    if (this.currentPlayer === playerId && this.players.length > 0) {
      this.currentPlayer = this.players[0].id;
    }
  }

  startGame(): boolean {
    if (this.players.length < 2) return false;

    this.deck = createDeck();

    // Deal 7 cards to each player
    this.players.forEach(player => {
      player.hand = drawCards(this.deck, 7);
    });

    // Draw first card (no wild or action)
    let firstCard: Card;
    do {
      firstCard = drawCards(this.deck, 1)[0];
    } while (
      firstCard.color === 'wild' ||
      ['skip', 'reverse', 'draw2'].includes(firstCard.value.toString())
    );

    this.discardPile = [firstCard];
    this.currentColor = firstCard.color;
    this.currentPlayer = this.players[0].id;
    this.gameStarted = true;
    this.winner = null;

    return true;
  }

  drawCard(playerId: string): Card[] {
    if (this.deck.length === 0) {
      if (this.discardPile.length < 2) {
        console.warn('Not enough cards to continue game');
        return [];
      }

      const topCard = this.discardPile.pop() as Card;
      this.deck = shuffleDeck([...this.discardPile]);
      this.discardPile = [topCard];
    }

    const player = this.players.find(p => p.id === playerId);
    if (!player) return [];

    const cards = drawCards(this.deck, 1);
    if (cards.length > 0) {
      player.hand.push(...cards);
    }

    return cards;
  }

  getPlayerHand(playerId: string): Card[] {
    const player = this.players.find(p => p.id === playerId);
    return player ? player.hand : [];
  }

  getPublicState(): PublicGameState {
    return {
      roomId: this.roomId,
      players: this.players.map(p => ({
        id: p.id,
        name: p.name,
        handCount: p.hand.length,
        isBot: p.isBot
      })),
      currentPlayer: this.currentPlayer,
      direction: this.direction,
      topCard: this.discardPile.length > 0 ? this.discardPile[this.discardPile.length - 1] : null,
      currentColor: this.currentColor,
      deckCount: this.deck.length,
      pendingDraw: this.pendingDraw,
      gameStarted: this.gameStarted,
      winner: this.winner
    };
  }

  reset(): void {
    this.deck = [];
    this.discardPile = [];
    this.currentPlayer = null;
    this.direction = 1;
    this.currentColor = null;
    this.pendingDraw = 0;
    this.gameStarted = false;
    this.winner = null;

    this.players.forEach(player => {
      player.hand = [];
    });
  }
}