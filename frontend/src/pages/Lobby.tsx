import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import RoomCard from '../components/RoomCard';
import CreateRoomModal from '../components/CreateRoomModal';
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
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');

  // ✅ NEW: Check for active room on mount
  const [isCheckingRoom, setIsCheckingRoom] = useState(true);
  const [showReconnectPrompt, setShowReconnectPrompt] = useState(false);
  const [activeRoom, setActiveRoom] = useState<any>(null);

  useEffect(() => {
    // Connect socket
    if (!socketService.socket.connected) {
      console.log('[Lobby] Socket not connected, connecting...');
      socketService.connect();
    }

    // ✅ NEW: Check for active room in cookies
    const checkActiveRoom = async () => {
      const room = roomCookies.getCurrentRoom();
      
      if (room) {
        console.log('[Lobby] Found active room in cookies:', room);
        
        // Ask server if this room still exists
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
      checkActiveRoom(); // ✅ Check room on connect
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
      
      // ✅ Save to cookie
      roomCookies.setCurrentRoom(data.roomId, data.roomCode, 'Host');
      
      setSelectedRoomId(data.roomId);
      setShowNamePrompt(true);
    };

    const handleJoinedRoom = (data: { roomId: string }) => {
  console.log('[Lobby] Joined room:', data.roomId);
  
  // ✅ Normal join, no reconnect flag
  navigate(`/game/${data.roomId}`); // No state = fresh join
};

    // ✅ NEW: Handle room existence check
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

    // Attach listeners
    socketService.socket.on('connect', handleConnect);
    socketService.socket.on('disconnect', handleDisconnect);
    socketService.onRoomsList(handleRoomsList);
    socketService.onRoomCreated(handleRoomCreated);
    socketService.onJoinedRoom(handleJoinedRoom);
    socketService.socket.on('room_exists', handleRoomExists); // ✅ NEW
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
      socketService.socket.off('room_exists', handleRoomExists); // ✅ NEW
      socketService.off('rooms_list');
      socketService.off('room_created');
      socketService.off('joined_room');
      socketService.off('error');
    };
  }, [navigate]);

  const handleCreateRoom = (roomName: string, maxPlayers: number) => {
    // ✅ NEW: Check for active room first
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

  

  const handleJoinRoom = (roomId: string) => {
    // ✅ NEW: Check for active room first
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
    
    setSelectedRoomId(roomId);
    setShowNamePrompt(true);
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim() && selectedRoomId) {
      // ✅ Save to cookie (will be updated with proper roomCode after join)
      const room = rooms.find(r => r.id === selectedRoomId);
      if (room) {
        roomCookies.setCurrentRoom(selectedRoomId, room.roomCode, playerName.trim());
      }

      socketService.joinRoom(selectedRoomId, playerName.trim());
      setShowNamePrompt(false);
      setPlayerName('');
      setSelectedRoomId(null);
    }
  };

  // ✅ NEW: Handle rejoin to active room
  const handleRejoinActiveRoom = () => {
    if (activeRoom) {
      console.log('[Lobby] Rejoining active room:', activeRoom.roomId);
      navigate(`/game/${activeRoom.roomId}`, { 
      state: { reconnect: true }  // ✅ This tells Game.tsx to check reconnection
    });
    }
  };

  // ✅ NEW: Handle abandon active room
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
      <div className="min-h-screen bg-dark-900">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">🔍</div>
            <p className="text-xl text-gray-400">Checking for active games...</p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ NEW: Show reconnect prompt if user has active room
  if (showReconnectPrompt && activeRoom) {
    return (
      <div className="min-h-screen bg-dark-900">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="bg-dark-800 border-2 border-dark-700 rounded-2xl p-8 max-w-md w-full text-center">
            <div className="text-6xl mb-4">🎮</div>
            <h2 className="text-3xl font-poppins font-bold text-white mb-4">
              Active Game Found!
            </h2>
            <p className="text-gray-400 mb-6">
              You're still in room <span className="text-uno-yellow font-mono">{activeRoom.roomCode}</span>.
              Would you like to continue or leave?
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleRejoinActiveRoom}
                className="w-full py-3 bg-gradient-to-r from-uno-blue to-uno-green hover:shadow-glow-blue text-white font-semibold rounded-lg transition-all duration-300"
              >
                🎯 Rejoin Game
              </button>
              <button
                onClick={handleAbandonActiveRoom}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
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
    <div className="min-h-screen bg-dark-900">
      {/* Navigation */}
      <Navigation />

      {/* Connection Status */}
      <div className="fixed top-20 right-4 z-40">
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full ${
            isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className="text-sm font-medium">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Error Notification */}
      {error && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
          {error}
        </div>
      )}

      {/* Content */}
      <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-poppins font-extrabold text-white mb-4">
            Game Lobby
          </h1>
          <p className="text-xl text-gray-400">
            Join an existing room or create your own
          </p>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="flex-1 relative">
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rooms by name or code..."
              className="w-full pl-12 pr-4 py-4 bg-dark-800 border-2 border-dark-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-uno-blue transition-colors duration-200"
            />
          </div>

          {/* Create Room Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={!isConnected}
            className="px-8 py-4 bg-gradient-to-r from-uno-blue to-uno-green hover:shadow-glow-blue text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center justify-center space-x-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Create Room</span>
            </span>
          </button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 flex items-center space-x-4">
            <div className="w-12 h-12 bg-uno-blue/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-uno-blue"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Active Rooms</p>
              <p className="text-2xl font-bold text-white">{activeRooms}</p>
            </div>
          </div>

          <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 flex items-center space-x-4">
            <div className="w-12 h-12 bg-uno-green/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-uno-green"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Players Online</p>
              <p className="text-2xl font-bold text-white">{totalPlayers}</p>
            </div>
          </div>

          <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 flex items-center space-x-4">
            <div className="w-12 h-12 bg-uno-yellow/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-uno-yellow"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Games in Progress</p>
              <p className="text-2xl font-bold text-white">{gamesInProgress}</p>
            </div>
          </div>
        </div>

        {/* Room List */}
        {!isConnected ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔌</div>
            <h3 className="text-2xl font-poppins font-bold text-white mb-2">
              Connecting to server...
            </h3>
            <p className="text-gray-400">Please wait</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-2xl font-poppins font-bold text-white mb-2">
              No rooms found
            </h3>
            <p className="text-gray-400 mb-6">
              {searchQuery
                ? 'Try a different search term'
                : 'Be the first to create a room!'}
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-3 bg-gradient-to-r from-uno-blue to-uno-green hover:shadow-glow-blue text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
            >
              Create Room
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.id}
                roomName={room.roomName}
                roomCode={room.roomCode}
                players={room.players}
                maxPlayers={room.maxPlayers}
                onJoin={() => handleJoinRoom(room.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateRoom}
      />

      {/* Name Prompt Modal */}
      {showNamePrompt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setShowNamePrompt(false)}
        >
          <div
            className="bg-dark-800 border-2 border-dark-700 rounded-2xl p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-3xl font-poppins font-bold text-white mb-6">
              Enter Your Name
            </h2>
            <form onSubmit={handleNameSubmit}>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Your name..."
                maxLength={30}
                className="w-full px-4 py-3 bg-dark-700 border-2 border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-uno-blue transition-colors duration-200 mb-4"
                autoFocus
                required
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNamePrompt(false)}
                  className="flex-1 py-3 bg-dark-700 hover:bg-dark-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!playerName.trim()}
                  className="flex-1 py-3 bg-gradient-to-r from-uno-blue to-uno-green hover:shadow-glow-blue text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Join
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}