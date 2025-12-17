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
    
    // Draw first card (can't be wild)
    let firstCard;
    do {
      firstCard = drawCards(this.deck, 1)[0];
    } while (firstCard.color === 'wild');
    
    this.discardPile = [firstCard];
    this.currentColor = firstCard.color;
    this.currentPlayer = this.players[0].id;
    this.gameStarted = true;
    
    return true;
  }

  drawCard(playerId) {
    if (this.deck.length === 0) {
      // Reshuffle discard pile (keep top card)
      const topCard = this.discardPile.pop();
      this.deck = shuffleDeck(this.discardPile);
      this.discardPile = [topCard];
    }
    
    const player = this.players.find(p => p.id === playerId);
    if (!player) return null;
    
    const cards = drawCards(this.deck, 1);
    player.hand.push(...cards);
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
      gameStarted: this.gameStarted,
      winner: this.winner
    };
  }
}