import { createDeck, drawCards, shuffleDeck } from './deck.js';
import { getNextPlayer } from './rules.js';

export class GameState {
  constructor(roomId) {
    this.roomId = roomId;
    this.players = [];
    this.deck = [];
    this.discardPile = [];
    this.currentPlayer = null;
    this.direction = 1; // 1 = clockwise, -1 = counterclockwise
    this.currentColor = null; // For wild cards
    this.pendingDraw = 0; // For stacking draw cards
    this.gameStarted = false;
    this.winner = null;
  }

  addPlayer(playerId, playerName, isBot = false) {
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

  removePlayer(playerId) {
    this.players = this.players.filter(p => p.id !== playerId);
    if (this.currentPlayer === playerId && this.players.length > 0) {
      this.currentPlayer = this.players[0].id;
    }
  }

  startGame() {
    if (this.players.length < 2) return false;
    
    this.deck = createDeck();
    
    // Deal 7 cards to each player
    this.players.forEach(player => {
      player.hand = drawCards(this.deck, 7);
    });
    
    // Draw first card (can't be wild or action card for fair start)
    let firstCard;
    do {
      firstCard = drawCards(this.deck, 1)[0];
    } while (firstCard.color === 'wild' || ['skip', 'reverse', 'draw2'].includes(firstCard.value));
    
    this.discardPile = [firstCard];
    this.currentColor = firstCard.color;
    this.currentPlayer = this.players[0].id;
    this.gameStarted = true;
    this.winner = null;
    
    return true;
  }

  // FIXED: Better deck exhaustion handling
  drawCard(playerId) {
    // If deck is empty, reshuffle discard pile
    if (this.deck.length === 0) {
      // Need at least 2 cards in discard pile to reshuffle
      if (this.discardPile.length < 2) {
        console.warn('Not enough cards to continue game');
        return []; // Return empty array instead of null
      }
      
      // Keep top card, reshuffle the rest
      const topCard = this.discardPile.pop();
      this.deck = shuffleDeck([...this.discardPile]);
      this.discardPile = [topCard];
      
      console.log(`Reshuffled ${this.deck.length} cards back into deck`);
    }
    
    const player = this.players.find(p => p.id === playerId);
    if (!player) return [];
    
    const cards = drawCards(this.deck, 1);
    if (cards.length > 0) {
      player.hand.push(...cards);
    }
    return cards;
  }

  getPlayerHand(playerId) {
    const player = this.players.find(p => p.id === playerId);
    return player ? player.hand : [];
  }

  getPublicState() {
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
      topCard: this.discardPile[this.discardPile.length - 1],
      currentColor: this.currentColor,
      deckCount: this.deck.length,
      pendingDraw: this.pendingDraw,
      gameStarted: this.gameStarted,
      winner: this.winner
    };
  }

  // NEW: Reset game for rematch
  reset() {
    this.deck = [];
    this.discardPile = [];
    this.currentPlayer = null;
    this.direction = 1;
    this.currentColor = null;
    this.pendingDraw = 0;
    this.gameStarted = false;
    this.winner = null;
    
    // Clear all player hands
    this.players.forEach(player => {
      player.hand = [];
    });
  }
}