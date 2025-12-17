import { useState, useEffect } from 'react';
import { socket, connectSocket } from './socket';
import Lobby from './components/Lobby';
import Game from './components/Game';

export default function App() {
  const [gameState, setGameState] = useState(null);
  const [playerHand, setPlayerHand] = useState([]);
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    connectSocket();

    // Connection status
    socket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError('Failed to connect to server. Please check if the server is running.');
    });

    // Game events
    socket.on('game_state', (state) => {
      console.log('Game state updated:', state);
      setGameState(state);
    });

    socket.on('game_started', (state) => {
      console.log('Game started:', state);
      setGameState(state);
    });

    socket.on('game_reset', (state) => {
      console.log('Game reset:', state);
      setGameState(state);
      setPlayerHand([]);
    });

    socket.on('hand_update', ({ hand }) => {
      console.log('Hand updated:', hand.length, 'cards');
      setPlayerHand(hand);
    });

    socket.on('card_played', ({ playerId, card, chosenColor }) => {
      console.log('Card played:', { playerId, card, chosenColor });
    });

    socket.on('card_drawn', ({ playerId }) => {
      console.log('Card drawn by:', playerId);
    });

    socket.on('cards_drawn', ({ playerId, count }) => {
      console.log(`${count} cards drawn by:`, playerId);
    });

    socket.on('game_over', ({ winner, winnerId }) => {
      console.log('Game over! Winner:', winner);
    });

    socket.on('error', ({ message }) => {
      console.error('Server error:', message);
      showError(message);
    });

    socket.on('player_joined', ({ playerName }) => {
      console.log(`${playerName} joined`);
    });

    socket.on('player_left', ({ playerId }) => {
      console.log(`Player ${playerId} left`);
    });

    // Cleanup
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('game_state');
      socket.off('game_started');
      socket.off('game_reset');
      socket.off('hand_update');
      socket.off('card_played');
      socket.off('card_drawn');
      socket.off('cards_drawn');
      socket.off('game_over');
      socket.off('error');
      socket.off('player_joined');
      socket.off('player_left');
    };
  }, []);

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(''), 4000);
  };

  const handleJoinRoom = (room, name) => {
    if (!isConnected) {
      showError('Not connected to server. Please wait...');
      return;
    }
    
    setRoomId(room);
    socket.emit('join_room', { roomId: room, playerName: name });
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Connection Status Indicator */}
      <div style={{
        position: 'fixed',
        top: 10,
        left: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: isConnected 
          ? 'rgba(72, 187, 120, 0.9)' 
          : 'rgba(229, 62, 62, 0.9)',
        color: 'white',
        padding: '8px 16px',
        borderRadius: 20,
        fontSize: 14,
        fontWeight: 600,
        zIndex: 1000,
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: 'white',
          animation: isConnected ? 'none' : 'blink 1s infinite'
        }} />
        {isConnected ? 'Connected' : 'Connecting...'}
      </div>

      {/* Error Notification */}
      {error && (
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20,
          background: '#e53e3e',
          color: 'white',
          padding: '16px 24px',
          borderRadius: 12,
          zIndex: 2000,
          maxWidth: 400,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          animation: 'slideIn 0.3s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: 10 }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <div>
              <strong style={{ display: 'block', marginBottom: 4 }}>Error</strong>
              {error}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{ 
        padding: 20,
        maxWidth: 1400,
        margin: '0 auto'
      }}>
        {!gameState ? (
          <Lobby onJoinRoom={handleJoinRoom} />
        ) : (
          <Game 
            gameState={gameState} 
            playerHand={playerHand}
            socket={socket}
          />
        )}
      </div>

      {/* Global Styles */}
      <style>{`
        @keyframes slideIn {
          from { 
            transform: translateX(100%);
            opacity: 0;
          }
          to { 
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}