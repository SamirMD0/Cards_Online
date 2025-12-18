import { useState } from 'react';
import Navigation from '../components/Navigation';
import RoomCard from '../components/RoomCard';
import CreateRoomModal from '../components/CreateRoomModal';

// Mock data - replace with real data from your game state
const mockRooms = [
  {
    id: '1',
    roomName: "John's Game",
    roomCode: 'ABC123',
    players: [
      { id: '1', name: 'John Doe', isHost: true, isReady: true },
      { id: '2', name: 'Jane Smith', isHost: false, isReady: true },
    ],
    maxPlayers: 4,
  },
  {
    id: '2',
    roomName: 'Quick Match',
    roomCode: 'XYZ789',
    players: [
      { id: '3', name: 'Mike Wilson', isHost: true, isReady: true },
      { id: '4', name: 'Sarah Brown', isHost: false, isReady: false },
      { id: '5', name: 'Tom Davis', isHost: false, isReady: true },
    ],
    maxPlayers: 4,
  },
  {
    id: '3',
    roomName: 'Pro Players Only',
    roomCode: 'PRO999',
    players: [
      { id: '6', name: 'Alex Johnson', isHost: true, isReady: true },
      { id: '7', name: 'Emily White', isHost: false, isReady: true },
      { id: '8', name: 'Chris Lee', isHost: false, isReady: true },
      { id: '9', name: 'Pat Taylor', isHost: false, isReady: false },
    ],
    maxPlayers: 4,
  },
];

export default function Lobby() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateRoom = (roomName: string, maxPlayers: number) => {
    console.log('Creating room:', { roomName, maxPlayers });
    // TODO: Implement room creation logic
  };

  const handleJoinRoom = (roomId: string) => {
    console.log('Joining room:', roomId);
    // TODO: Implement join room logic
  };

  const filteredRooms = mockRooms.filter((room) =>
    room.roomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.roomCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Navigation */}
      <Navigation />

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
            className="px-8 py-4 bg-gradient-to-r from-uno-blue to-uno-green hover:shadow-glow-blue text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 whitespace-nowrap"
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
              <p className="text-2xl font-bold text-white">{mockRooms.length}</p>
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
              <p className="text-2xl font-bold text-white">
                {mockRooms.reduce((sum, room) => sum + room.players.length, 0)}
              </p>
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
              <p className="text-2xl font-bold text-white">
                {mockRooms.filter((r) => r.players.length >= 2).length}
              </p>
            </div>
          </div>
        </div>

        {/* Room List */}
        {filteredRooms.length === 0 ? (
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
    </div>
  );
}