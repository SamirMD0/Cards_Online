import { useState } from 'react';
import Card from './Card';

export default function Game({ gameState, playerHand, socket }) {
  const [selectedColor, setSelectedColor] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pendingCard, setPendingCard] = useState(null);

  const isMyTurn = gameState.currentPlayer === socket.id;
  const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayer);

  const handleCardClick = (card) => {
    if (!isMyTurn) return;

    if (card.color === 'wild') {
      setPendingCard(card);
      setShowColorPicker(true);
    } else {
      socket.emit('play_card', { cardId: card.id });
    }
  };

  const handleColorSelect = (color) => {
    if (pendingCard) {
      socket.emit('play_card', { 
        cardId: pendingCard.id, 
        chosenColor: color 
      });
    }
    setShowColorPicker(false);
    setPendingCard(null);
  };

  const handleDraw = () => {
    socket.emit('draw_card');
  };

  const handleStartGame = () => {
    socket.emit('start_game');
  };

  const handleAddBot = () => {
    socket.emit('add_bot');
  };

  if (!gameState.gameStarted) {
    return (
      <div style={{
        background: 'white',
        borderRadius: 16,
        padding: 40,
        textAlign: 'center'
      }}>
        <h2 style={{ marginBottom: 20 }}>Waiting Room</h2>
        <p style={{ marginBottom: 20 }}>Room: {gameState.roomId}</p>
        
        <div style={{ marginBottom: 30 }}>
          <h3>Players ({gameState.players.length}/4)</h3>
          {gameState.players.map(p => (
            <div key={p.id} style={{ padding: 8 }}>
              {p.name} {p.isBot && '🤖'}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button 
            onClick={handleAddBot}
            disabled={gameState.players.length >= 4}
            style={{ background: '#4299e1', color: 'white' }}
          >
            Add Bot
          </button>
          <button 
            onClick={handleStartGame}
            disabled={gameState.players.length < 2}
            style={{ background: '#48bb78', color: 'white' }}
          >
            Start Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ color: 'white' }}>
      {/* Game Info */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h3>Current Turn: {currentPlayer?.name}</h3>
          <p>Direction: {gameState.direction === 1 ? '→' : '←'}</p>
        </div>
        <div>
          <p>Deck: {gameState.deckCount} cards</p>
          <p>Players: {gameState.players.length}</p>
        </div>
      </div>

      {/* Other Players */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        marginBottom: 30
      }}>
        {gameState.players
          .filter(p => p.id !== socket.id)
          .map(p => (
            <div key={p.id} style={{
              background: 'rgba(255,255,255,0.1)',
              padding: 15,
              borderRadius: 8,
              border: p.id === gameState.currentPlayer ? '3px solid yellow' : 'none'
            }}>
              <p style={{ fontWeight: 'bold' }}>
                {p.name} {p.isBot && '🤖'}
              </p>
              <p>{p.handCount} cards</p>
            </div>
          ))}
      </div>

      {/* Center - Discard Pile */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 40,
        marginBottom: 40
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: 10 }}>Draw Pile</p>
          <div style={{
            width: 80,
            height: 120,
            background: '#2d3748',
            borderRadius: 12,
            border: '3px solid white',
            cursor: isMyTurn ? 'pointer' : 'not-allowed',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: 24
          }}
          onClick={isMyTurn ? handleDraw : undefined}
          >
            🎴
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: 10 }}>
            Current Color: <span style={{
              display: 'inline-block',
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: gameState.currentColor || 'white',
              verticalAlign: 'middle'
            }} />
          </p>
          {gameState.topCard && (
            <Card card={gameState.topCard} disabled />
          )}
        </div>
      </div>

      {/* Player Hand */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        padding: 20,
        borderRadius: 12
      }}>
        <p style={{ marginBottom: 15, fontWeight: 'bold' }}>
          Your Hand ({playerHand.length} cards)
          {isMyTurn && ' - YOUR TURN!'}
        </p>
        <div style={{
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {playerHand.map(card => (
            <Card 
              key={card.id} 
              card={card} 
              onClick={() => handleCardClick(card)}
              disabled={!isMyTurn}
            />
          ))}
        </div>
      </div>

      {/* Color Picker Modal */}
      {showColorPicker && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: 30,
            borderRadius: 16,
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#333', marginBottom: 20 }}>Choose a Color</h3>
            <div style={{ display: 'flex', gap: 15 }}>
              {['red', 'blue', 'green', 'yellow'].map(color => (
                <button
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: color,
                    border: '3px solid white',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}