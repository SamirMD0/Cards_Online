import PlayerAvatar from './PlayerAvatar';

interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
}

interface RoomCardProps {
  roomName: string;
  roomCode: string;
  players: Player[];
  maxPlayers: number;
  onJoin: () => void;
}

export default function RoomCard({
  roomName,
  roomCode,
  players,
  maxPlayers,
  onJoin,
}: RoomCardProps) {
  const isFull = players.length >= maxPlayers;

  return (
    <div className="group bg-dark-800 border-2 border-dark-700 rounded-xl p-6 hover:border-uno-blue transition-all duration-300 hover:shadow-glow-blue">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-poppins font-bold text-white mb-1 group-hover:text-uno-blue transition-colors">
            {roomName}
          </h3>
          <p className="text-sm text-gray-400 font-mono">
            Code: <span className="text-uno-yellow">{roomCode}</span>
          </p>
        </div>

        {/* Player Count Badge */}
        <div className="flex items-center space-x-1 bg-dark-700 px-3 py-1.5 rounded-full">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span className="text-sm font-semibold text-white">
            {players.length}/{maxPlayers}
          </span>
        </div>
      </div>

      {/* Players */}
      <div className="flex items-center space-x-2 mb-4">
        {players.slice(0, 4).map((player) => (
          <PlayerAvatar
            key={player.id}
            name={player.name}
            isHost={player.isHost}
            isReady={player.isReady}
            size="sm"
          />
        ))}
        {Array.from({ length: maxPlayers - players.length }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="w-10 h-10 rounded-full border-2 border-dashed border-dark-600 flex items-center justify-center"
          >
            <span className="text-dark-600 text-xs">?</span>
          </div>
        ))}
      </div>

      {/* Join Button */}
      <button
        onClick={onJoin}
        disabled={isFull}
        className={`
          w-full py-3 px-4 rounded-lg font-semibold
          transition-all duration-300
          ${
            isFull
              ? 'bg-dark-700 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-uno-blue to-uno-green text-white hover:shadow-glow-blue hover:scale-105'
          }
        `}
      >
        {isFull ? 'Room Full' : 'Join Room'}
      </button>
    </div>
  );
}