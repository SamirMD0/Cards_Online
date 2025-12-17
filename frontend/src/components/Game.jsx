import { useState, useEffect } from 'react';
import Card from './Card';

export default function Game({ gameState, playerHand, socket }) {
  const [selectedColor, setSelectedColor] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pendingCard, setPendingCard] = useState(null);
  const [showGameOver, setShowGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [notification, setNotification] = useState('');

  const isMyTurn = gameState.currentPlayer === socket.id;
  const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayer);
  const myPlayer = gameState.players.find(p => p.id === socket.id);

  useEffect(() => {
    const handleGameOver = ({ winner, winnerId }) => {
      setWinner(winner);
      setShowGameOver(true);
    };

    const handleCanPlayDrawn = ({ card }) => {
      showNotification('You drew a playable card! Click to play or pass turn.');
    };

    socket.on('game_over', handleGameOver);
    socket.on('can_play_drawn_card', handleCanPlayDrawn);

    return () => {
      socket.off('game_over', handleGameOver);
      socket.off('can_play_drawn_card', handleCanPlayDrawn);
    };
  }, [socket]);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleCardClick = (card) => {
    if (!isMyTurn) {
      showNotification("It's not your turn!");
      return;
    }

    // Check if must draw due to pending Draw 2/4
    if (gameState.pendingDraw > 0 && !['draw2', 'wild_draw4'].includes(card.value)) {
      showNotification(`You must draw ${gameState.pendingDraw} cards first!`);
      return;
    }

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
    if (!isMyTurn) {
      showNotification("It's not your turn!");
      return;
    }
    socket.emit('draw_card');
  };

  const handleStartGame = () => {
    socket.emit('start_game');
  };

  const handleAddBot = () => {
    socket.emit('add_bot');
  };

  const handleRestartGame = () => {
    setShowGameOver(false);
    setWinner(null);
    socket.emit('restart_game');
  };

  // Waiting room before game starts
  if (!gameState.gameStarted) {
    return (
      <div style={{
        background: 'white',
        borderRadius: 16,
        padding: 40,
        textAlign: 'center',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
      }}>
        <h2 style={{ marginBottom: 10, color: '#333' }}>🎮 Waiting Room</h2>
        <p style={{ marginBottom: 30, color: '#666', fontSize: 18 }}>
          Room Code: <strong style={{ color: '#667eea' }}>{gameState.roomId}</strong>
        </p>
        
        <div style={{ 
          marginBottom: 30,
          background: '#f7fafc',
          padding: 20,
          borderRadius: 12
        }}>
          <h3 style={{ marginBottom: 15, color: '#333' }}>
            Players ({gameState.players.length}/4)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {gameState.players.map(p => (
              <div key={p.id} style={{ 
                padding: 12,
                background: 'white',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                {p.isBot ? '🤖' : '👤'}
                <span style={{ fontWeight: 600, color: '#333' }}>{p.name}</span>
                {p.id === socket.id && (
                  <span style={{ 
                    background: '#48bb78',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontSize: 12
                  }}>YOU</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={handleAddBot}
            disabled={gameState.players.length >= 4}
            style={{ 
              background: '#4299e1', 
              color: 'white',
              padding: '12px 24px',
              fontSize: 16
            }}
          >
            ➕ Add Bot
          </button>
          <button 
            onClick={handleStartGame}
            disabled={gameState.players.length < 2}
            style={{ 
              background: '#48bb78', 
              color: 'white',
              padding: '12px 24px',
              fontSize: 16,
              fontWeight: 'bold'
            }}
          >
            🚀 Start Game
          </button>
        </div>

        <p style={{ marginTop: 20, color: '#718096', fontSize: 14 }}>
          Need at least 2 players to start
        </p>
      </div>
    );
  }

  return (
    <div style={{ color: 'white', position: 'relative' }}>
      {/* Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#4299e1',
          color: 'white',
          padding: '12px 24px',
          borderRadius: 8,
          zIndex: 2000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          animation: 'slideDown 0.3s ease'
        }}>
          {notification}
        </div>
      )}

      {/* Game Info Header */}
      <div style={{
        background: 'rgba(255,255,255,0.15)',
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 15,
        backdropFilter: 'blur(10px)'
      }}>
        <div>
          <h3 style={{ marginBottom: 5, fontSize: 20 }}>
            {isMyTurn ? '🎯 YOUR TURN!' : `${currentPlayer?.name}'s Turn`}
          </h3>
          <p style={{ fontSize: 14, opacity: 0.9 }}>
            Direction: {gameState.direction === 1 ? '→ Clockwise' : '← Counter-clockwise'}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 16 }}>🎴 Deck: {gameState.deckCount} cards</p>
          {gameState.pendingDraw > 0 && (
            <p style={{ 
              fontSize: 16, 
              color: '#fbbf24',
              fontWeight: 'bold'
            }}>
              ⚠️ Must draw {gameState.pendingDraw} cards!
            </p>
          )}
        </div>
      </div>

      {/* Other Players */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 15,
        marginBottom: 30
      }}>
        {gameState.players
          .filter(p => p.id !== socket.id)
          .map(p => (
            <div key={p.id} style={{
              background: p.id === gameState.currentPlayer 
                ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' 
                : 'rgba(255,255,255,0.1)',
              padding: 15,
              borderRadius: 12,
              textAlign: 'center',
              border: p.id === gameState.currentPlayer ? '3px solid white' : 'none',
              transition: 'all 0.3s',
              backdropFilter: 'blur(10px)'
            }}>
              <p style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 5 }}>
                {p.isBot && '🤖 '}
                {p.name}
              </p>
              <p style={{ fontSize: 24, fontWeight: 'bold' }}>
                {p.handCount} 🎴
              </p>
            </div>
          ))}
      </div>

      {/* Center - Discard Pile & Draw Pile */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 60,
        marginBottom: 40,
        flexWrap: 'wrap'
      }}>
        {/* Draw Pile */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: 10, fontSize: 16, fontWeight: 600 }}>
            Draw Pile
          </p>
          <div style={{
            width: 90,
            height: 130,
            background: 'linear-gradient(135deg, #1a202c, #2d3748)',
            borderRadius: 12,
            border: '3px solid white',
            cursor: isMyTurn ? 'pointer' : 'not-allowed',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: 40,
            boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
            transition: 'transform 0.2s',
            opacity: isMyTurn ? 1 : 0.6
          }}
          onClick={isMyTurn ? handleDraw : undefined}
          onMouseEnter={(e) => isMyTurn && (e.currentTarget.style.transform = 'translateY(-5px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            🎴
            <div style={{ fontSize: 14, marginTop: 5 }}>
              {gameState.deckCount}
            </div>
          </div>
        </div>

        {/* Discard Pile */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ 
            marginBottom: 10, 
            fontSize: 16, 
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8
          }}>
            Current Color:
            <span style={{
              display: 'inline-block',
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: gameState.currentColor || 'white',
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }} />
          </p>
          {gameState.topCard && (
            <Card card={gameState.topCard} disabled />
          )}
        </div>
      </div>

      {/* Player Hand */}
      <div style={{
        background: 'rgba(255,255,255,0.15)',
        padding: 20,
        borderRadius: 12,
        backdropFilter: 'blur(10px)'
      }}>
        <p style={{ 
          marginBottom: 15, 
          fontWeight: 'bold', 
          fontSize: 18,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>Your Hand ({playerHand.length} cards)</span>
          {isMyTurn && (
            <span style={{ 
              background: '#48bb78',
              padding: '4px 12px',
              borderRadius: 6,
              fontSize: 14,
              animation: 'pulse 2s infinite'
            }}>
              ⏰ YOUR TURN
            </span>
          )}
        </p>
        <div style={{
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          justifyContent: 'center',
          minHeight: 140
        }}>
          {playerHand.length === 0 ? (
            <p style={{ opacity: 0.7, padding: 40 }}>No cards in hand</p>
          ) : (
            playerHand.map(card => (
              <Card 
                key={card.id} 
                card={card} 
                onClick={() => handleCardClick(card)}
                disabled={!isMyTurn}
              />
            ))
          )}
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
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.2s'
        }}
        onClick={() => setShowColorPicker(false)}
        >
          <div style={{
            background: 'white',
            padding: 40,
            borderRadius: 16,
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: '#333', marginBottom: 25, fontSize: 24 }}>
              Choose a Color
            </h3>
            <div style={{ display: 'flex', gap: 20 }}>
              {['red', 'blue', 'green', 'yellow'].map(color => (
                <button
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: '50%',
                    background: color,
                    border: '4px solid white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  title={color.toUpperCase()}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {showGameOver && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1500,
          animation: 'fadeIn 0.3s'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            padding: 50,
            borderRadius: 20,
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            maxWidth: 400
          }}>
            <h1 style={{ fontSize: 48, marginBottom: 20 }}>🎉</h1>
            <h2 style={{ fontSize: 32, marginBottom: 10 }}>Game Over!</h2>
            <p style={{ fontSize: 24, marginBottom: 30 }}>
              <strong>{winner}</strong> wins!
            </p>
            <div style={{ display: 'flex', gap: 15, justifyContent: 'center' }}>
              <button
                onClick={handleRestartGame}
                style={{
                  background: '#48bb78',
                  color: 'white',
                  padding: '15px 30px',
                  fontSize: 18,
                  fontWeight: 'bold'
                }}
              >
                🔄 Play Again
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  background: '#e53e3e',
                  color: 'white',
                  padding: '15px 30px',
                  fontSize: 18
                }}
              >
                🚪 Leave
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from { transform: translate(-50%, -20px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}