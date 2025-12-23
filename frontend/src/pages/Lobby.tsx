import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import RoomCard from '../components/RoomCard';
import CreateRoomModal from '../components/CreateRoomModal';
import { socketService } from '../socket';

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

 useEffect(() => {
  // Connect to socket
  socketService.connect();

  // Setup listeners
  const handleConnect = () => {
    console.log('Connected to server');
    setIsConnected(true);
    socketService.getRooms(); // Request rooms after connection
  };

  const handleDisconnect = () => {
    console.log('Disconnected from server');
    setIsConnected(false);
  };

  const handleRoomsList = (roomsList: Room[]) => {
    console.log('Rooms list received:', roomsList);
    setRooms(roomsList);
  };

  const handleRoomCreated = (data: { roomId: string; roomCode: string }) => {
    console.log('Room created:', data);
    setSelectedRoomId(data.roomId);
    setShowNamePrompt(true);
  };

  const handleJoinedRoom = (data: { roomId: string }) => {
    console.log('Joined room:', data);
    navigate(`/game/${data.roomId}`);
  };

  const handleError = (error: { message: string }) => {
    console.error('Socket error:', error);
    setError(error.message);
    setTimeout(() => setError(''), 4000);
  };

  // IMPORTANT: Check if already connected
  if (socketService.socket.connected) {
    setIsConnected(true);
    socketService.getRooms();
  }

  socketService.socket.on('connect', handleConnect);
  socketService.socket.on('disconnect', handleDisconnect);
  socketService.onRoomsList(handleRoomsList);
  socketService.onRoomCreated(handleRoomCreated);
  socketService.onJoinedRoom(handleJoinedRoom);
  socketService.onError(handleError);

  // Request rooms list every 5 seconds
  const interval = setInterval(() => {
    if (socketService.socket.connected) {
      socketService.getRooms();
    }
  }, 5000);

  // Cleanup
  return () => {
    clearInterval(interval);
    socketService.off('connect', handleConnect);
    socketService.off('disconnect', handleDisconnect);
    socketService.off('rooms_list', handleRoomsList);
    socketService.off('room_created', handleRoomCreated);
    socketService.off('joined_room', handleJoinedRoom);
    socketService.off('error', handleError);
  };
}, [navigate]);

  const handleCreateRoom = (roomName: string, maxPlayers: number) => {
    if (!isConnected) {
      setError('Not connected to server');
      return;
    }
    socketService.createRoom(roomName, maxPlayers);
  };

  const handleJoinRoom = (roomId: string) => {
    if (!isConnected) {
      setError('Not connected to server');
      return;
    }
    setSelectedRoomId(roomId);
    setShowNamePrompt(true);
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim() && selectedRoomId) {
      socketService.joinRoom(selectedRoomId, playerName.trim());
      setShowNamePrompt(false);
      setPlayerName('');
      setSelectedRoomId(null);
    }
  };

  const filteredRooms = rooms.filter((room) =>
    room.roomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.roomCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeRooms = rooms.length;
  const totalPlayers = rooms.reduce((sum, room) => sum + room.players.length, 0);
  const gamesInProgress = rooms.filter(r => r.gameStarted).length;

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