const COLORS = ['red', 'blue', 'green', 'yellow'];
const VALUES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'skip', 'reverse', 'draw2'];
const WILD_CARDS = ['wild', 'wild_draw4'];

export function createDeck() {
  const deck = [];
  
  // Number and action cards (2 of each except 0)
  COLORS.forEach(color => {
    deck.push({ color, value: '0', id: `${color}-0` });
    VALUES.slice(1).forEach(value => {
      deck.push({ color, value, id: `${color}-${value}-1` });
      deck.push({ color, value, id: `${color}-${value}-2` });
    });
  });
  
  // Wild cards (4 of each)
  for (let i = 0; i < 4; i++) {
    deck.push({ color: 'wild', value: 'wild', id: `wild-${i}` });
    deck.push({ color: 'wild', value: 'wild_draw4', id: `wild_draw4-${i}` });
  }
  
  return shuffleDeck(deck);
}

export function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function drawCards(deck, count) {
  return deck.splice(0, count);
}