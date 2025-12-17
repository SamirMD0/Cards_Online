import { useState, useEffect } from 'react';
import { socket, connectSocket } from './socket';
import Lobby from './components/Lobby';
import Game from './components/Game';

export default function App() {
  const [gameState, setGameState] = useState(null);
  const [playerHand, setPlayerHand] = useState([]);
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    connectSocket();

    socket.on('game_state', (state) => {
      setGameState(state);
    });

    socket.on('game_started', (state) => {
      setGameState(state);
    });

    socket.on('hand_update', ({ hand }) => {
      setPlayerHand(hand);
    });

    socket.on('card_played', ({ playerId, card, chosenColor }) => {
      console.log('Card played:', { playerId, card, chosenColor });
    });

    socket.on('card_drawn', ({ playerId }) => {
      console.log('Card drawn by:', playerId);
    });

    socket.on('game_over', ({ winner }) => {
      alert(`Game Over! Winner: ${winner}`);
    });

    socket.on('error', ({ message }) => {
      setError(message);
      setTimeout(() => setError(''), 3000);
    });

    socket.on('player_joined', ({ playerName }) => {
      console.log(`${playerName} joined`);
    });

    socket.on('player_left', ({ playerId }) => {
      console.log(`Player ${playerId} left`);
    });

    return () => {
      socket.off('game_state');
      socket.off('game_started');
      socket.off('hand_update');
      socket.off('card_played');
      socket.off('card_drawn');
      socket.off('game_over');
      socket.off('error');
      socket.off('player_joined');
      socket.off('player_left');
    };
  }, []);

  const handleJoinRoom = (room, name) => {
    setRoomId(room);
    socket.emit('join_room', { roomId: room, playerName: name });
  };

  return (
    <div>
      {error && (
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20,
          background: '#ff4444',
          color: 'white',
          padding: '12px 24px',
          borderRadius: 8,
          zIndex: 1000
        }}>
          {error}
        </div>
      )}

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
  );
}