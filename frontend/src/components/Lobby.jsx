import { useState } from 'react';

export default function Lobby({ onJoinRoom }) {
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (playerName.trim() && roomId.trim()) {
      onJoinRoom(roomId.trim(), playerName.trim());
    }
  };

  const handleQuickPlay = () => {
    const randomRoom = `room-${Math.random().toString(36).substr(2, 9)}`;
    if (playerName.trim()) {
      onJoinRoom(randomRoom, playerName.trim());
    }
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: 16,
      padding: 40,
      maxWidth: 400,
      margin: '0 auto',
      boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: 30, color: '#333' }}>
        🎮 UNO Online
      </h1>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <input
          type="text"
          placeholder="Your Name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          required
        />
        
        <input
          type="text"
          placeholder="Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        
        <button 
          type="submit"
          style={{ background: '#667eea', color: 'white' }}
        >
          Join Room
        </button>
        
        <button
          type="button"
          onClick={handleQuickPlay}
          style={{ background: '#48bb78', color: 'white' }}
        >
          Quick Play (Random Room)
        </button>
      </form>
      
      <p style={{ textAlign: 'center', marginTop: 20, color: '#666', fontSize: 14 }}>
        Share the Room ID with friends to play together
      </p>
    </div>
  );
}