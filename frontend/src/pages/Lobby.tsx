// Lobby.tsx - Modernized
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/common/Navigation';
import RoomCard from '../components/features/lobby/RoomCard';
import CreateRoomModal from '../components/features/lobby/CreateRoomModal';
import { socketService } from '../socket';
import { roomCookies } from '../utils/roomCookies';

interface Room {
  id: string;
  roomName: string;
  roomCode: string;
  players: Array<{
    id: string;
    name: string;
    isHost: boolean;
    isReady: boolean;
  }>;
  maxPlayers: number;
  gameStarted: boolean;
}

export default function Lobby() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');

  const [isCheckingRoom, setIsCheckingRoom] = useState(true);
  const [showReconnectPrompt, setShowReconnectPrompt] = useState(false);
  const [activeRoom, setActiveRoom] = useState<any>(null);

  useEffect(() => {
    if (!socketService.socket.connected) {
      console.log('[Lobby] Socket not connected, connecting...');
      socketService.connect();
    }

    const checkActiveRoom = async () => {
      const room = roomCookies.getCurrentRoom();
      
      if (room) {
        console.log('[Lobby] Found active room in cookies:', room);
        socketService.socket.emit('check_room_exists', { roomId: room.roomId });
      } else {
        console.log('[Lobby] No active room found');
        setIsCheckingRoom(false);
      }
    };

    const handleConnect = () => {
      console.log('[Lobby] ✅ Connected to server:', socketService.socket.id);
      setIsConnected(true);
      socketService.getRooms();
      checkActiveRoom();
    };

    const handleDisconnect = () => {
      console.log('[Lobby] Disconnected from server');
      setIsConnected(false);
    };

    const handleRoomsList = (roomsList: Room[]) => {
      setRooms(roomsList);
    };

    const handleRoomCreated = (data: { roomId: string; roomCode: string }) => {
      console.log('[Lobby] Room created:', data);

      if (user) {
        roomCookies.setCurrentRoom(data.roomId, data.roomCode, user.username);
      }
    };

    const handleJoinedRoom = (data: { roomId: string }) => {
      console.log('[Lobby] Joined room:', data.roomId);
      navigate(`/game/${data.roomId}`);
    };

    const handleShouldReconnect = (data: { roomId: string }) => {
      console.log('[Lobby] Server says we should reconnect to:', data.roomId);
      navigate(`/game/${data.roomId}`, { state: { reconnect: true } });
    };

    const handleRoomExists = (data: { exists: boolean; roomId: string; gameState?: any }) => {
      console.log('[Lobby] Room exists check:', data);
      setIsCheckingRoom(false);

      if (data.exists) {
        console.log('[Lobby] ✅ Room still active, prompting user...');
        setActiveRoom(roomCookies.getCurrentRoom());
        setShowReconnectPrompt(true);
      } else {
        console.log('[Lobby] ❌ Room no longer exists, clearing cookie');
        roomCookies.clearCurrentRoom();
      }
    };

    const handleError = (error: { message: string }) => {
      console.error('[Lobby] Socket error:', error);
      setError(error.message);
      setTimeout(() => setError(''), 4000);
    };

    socketService.socket.on('connect', handleConnect);
    socketService.socket.on('disconnect', handleDisconnect);
    socketService.onRoomsList(handleRoomsList);
    socketService.onRoomCreated(handleRoomCreated);
    socketService.onJoinedRoom(handleJoinedRoom);
    socketService.socket.on('should_reconnect', handleShouldReconnect);
    socketService.socket.on('room_exists', handleRoomExists);
    socketService.onError(handleError);

    if (socketService.socket.connected) {
      handleConnect();
    }

    const interval = setInterval(() => {
      if (socketService.socket.connected) {
        socketService.getRooms();
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      socketService.socket.off('connect', handleConnect);
      socketService.socket.off('disconnect', handleDisconnect);
      socketService.socket.off('should_reconnect', handleShouldReconnect);
      socketService.socket.off('room_exists', handleRoomExists);
      socketService.off('rooms_list');
      socketService.off('room_created');
      socketService.off('joined_room');
      socketService.off('error');
    };
  }, [navigate, user]);

  const handleCreateRoom = (roomName: string, maxPlayers: number) => {
    if (roomCookies.hasActiveRoom()) {
      const room = roomCookies.getCurrentRoom();
      setError(`You're already in room "${room?.roomCode}". Leave it first.`);
      setTimeout(() => setError(''), 4000);
      return;
    }

    if (!isConnected) {
      setError('Not connected to server');
      setTimeout(() => setError(''), 4000);
      return;
    }
    
    socketService.createRoom(roomName, maxPlayers);
  };

  const handleJoinRoom = async (roomId: string) => {
    const activeRoomId = roomCookies.getActiveRoomId();
    if (activeRoomId && activeRoomId !== roomId) {
      const room = roomCookies.getCurrentRoom();
      setError(`You're already in room "${room?.roomCode}". Leave it first.`);
      setTimeout(() => setError(''), 4000);
      return;
    }

    if (!isConnected) {
      setError('Not connected to server');
      setTimeout(() => setError(''), 4000);
      return;
    }

    if (!user) {
      setError('Authentication required');
      setTimeout(() => setError(''), 4000);
      return;
    }

    const targetRoom = rooms.find(r => r.id === roomId);
    if (!targetRoom) {
      setError('Room not found');
      setTimeout(() => setError(''), 4000);
      return;
    }

    const playerName = user.username;
    roomCookies.setCurrentRoom(roomId, targetRoom.roomCode, playerName);

    console.log(`[Lobby] Attempting to join room ${roomId} as ${playerName}`);
    socketService.joinRoom(roomId, playerName);
  };

  const handleRejoinActiveRoom = () => {
    if (activeRoom) {
      console.log('[Lobby] Rejoining active room:', activeRoom.roomId);
      navigate(`/game/${activeRoom.roomId}`, { 
        state: { reconnect: true }
      });
    }
  };

  const handleAbandonActiveRoom = () => {
    console.log('[Lobby] User abandoned active room');
    roomCookies.clearCurrentRoom();
    setShowReconnectPrompt(false);
    setActiveRoom(null);
  };

  const filteredRooms = rooms.filter((room) =>
    room.roomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.roomCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeRooms = rooms.length;
  const totalPlayers = rooms.reduce((sum, room) => sum + room.players.length, 0);
  const gamesInProgress = rooms.filter(r => r.gameStarted).length;

  if (isCheckingRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="relative mb-8">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 animate-spin">
                <div className="absolute inset-4 rounded-full bg-gray-900"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl">🔍</span>
              </div>
            </div>
            <p className="text-lg text-gray-300 font-light animate-pulse">Checking for active games...</p>
          </div>
        </div>
      </div>
    );
  }

  if (showReconnectPrompt && activeRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="glass-panel-dark rounded-2xl p-8 max-w-md w-full text-center animate-fade-in-up">
            <div className="relative inline-block mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mx-auto">
                <span className="text-3xl">🎮</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Active Game Found!
            </h2>
            <p className="text-gray-400 mb-6">
              You're still in room <span className="text-blue-400 font-mono font-bold">{activeRoom.roomCode}</span>.
              Would you like to continue or leave?
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleRejoinActiveRoom}
                className="btn-modern"
              >
                🎯 Rejoin Game
              </button>
              <button
                onClick={handleAbandonActiveRoom}
                className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:shadow-lg text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105"
              >
                🚪 Leave & Browse Lobby
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Navigation />

      {/* Modern Connection Status */}
      <div className="fixed top-20 right-4 z-40">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full glass-panel ${isConnected ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'}`}>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-sm font-medium">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Modern Error Notification */}
      {error && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 glass-panel border-l-4 border-red-500 px-6 py-3 rounded-xl animate-fade-in-down max-w-md w-full">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Modern Content */}
      <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
        {/* Modern Header */}
        <div className="mb-12 text-center md:text-left animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 text-gradient">
            Game Lobby
          </h1>
          <p className="text-lg text-gray-400">
            Find a room to join or create your own gaming space
          </p>
        </div>

        {/* Modern Actions Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {/* Modern Search */}
          <div className="flex-1 relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rooms by name or code..."
              className="w-full pl-12 pr-4 py-4 glass-panel rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>

          {/* Modern Create Room Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={!isConnected}
            className="btn-modern px-8 whitespace-nowrap"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Room
            </span>
          </button>
        </div>

        {/* Modern Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {[
            { icon: '🏠', label: 'Active Rooms', value: activeRooms, color: 'blue' },
            { icon: '👥', label: 'Players Online', value: totalPlayers, color: 'green' },
            { icon: '🎯', label: 'Games in Progress', value: gamesInProgress, color: 'yellow' }
          ].map((stat, idx) => (
            <div key={idx} className="glass-panel-dark rounded-xl p-6 hover:scale-105 transition-all duration-300">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-lg bg-${stat.color}-500/20 flex items-center justify-center`}>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Room List */}
        {!isConnected ? (
          <div className="text-center py-20 animate-fade-in-up">
            <div className="relative inline-block mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-gray-700 to-gray-800 flex items-center justify-center mx-auto">
                <span className="text-3xl">🔌</span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Connecting to server...
            </h3>
            <p className="text-gray-400">Please wait while we establish connection</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-20 animate-fade-in-up">
            <div className="relative inline-block mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-gray-700 to-gray-800 flex items-center justify-center mx-auto">
                <span className="text-3xl">🎮</span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              No rooms found
            </h3>
            <p className="text-gray-400 mb-6">
              {searchQuery
                ? 'Try a different search term'
                : 'Be the first to create a room!'}
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-modern"
            >
              Create Room
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room, idx) => (
              <div key={room.id} className="animate-fade-in-up" style={{ animationDelay: `${0.1 + idx * 0.05}s` }}>
                <RoomCard
                  roomName={room.roomName}
                  roomCode={room.roomCode}
                  players={room.players}
                  maxPlayers={room.maxPlayers}
                  onJoin={() => handleJoinRoom(room.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateRoom}
      />
    </div>
  );
}