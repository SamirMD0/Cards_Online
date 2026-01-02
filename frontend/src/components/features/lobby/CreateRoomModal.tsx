import { useState, useEffect } from 'react';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (roomName: string, maxPlayers: number) => void;
}

export default function CreateRoomModal({
  isOpen,
  onClose,
  onCreate,
}: CreateRoomModalProps) {
  const [roomName, setRoomName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(4);

  useEffect(() => {
    if (isOpen) {
      setRoomName('');
      setMaxPlayers(4);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomName.trim()) {
      onCreate(roomName.trim(), maxPlayers);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-dark-800 border-2 border-dark-700 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-float"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          title="Close modal"
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-dark-700 hover:bg-dark-600 text-gray-400 hover:text-white transition-all duration-200"
        >
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Title */}
        <h2 className="text-3xl font-poppins font-bold text-white mb-6">
          Create Room
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Room Name Input */}
          <div>
            <label
              htmlFor="roomName"
              className="block text-sm font-semibold text-gray-300 mb-2"
            >
              Room Name
            </label>
            <input
              id="roomName"
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter room name..."
              maxLength={30}
              className="w-full px-4 py-3 bg-dark-700 border-2 border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-uno-blue transition-colors duration-200"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              {roomName.length}/30 characters
            </p>
          </div>

          {/* Max Players Slider */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              Max Players: <span className="text-uno-yellow">{maxPlayers}</span>
            </label>
            <div className="relative">
              <input
                type="range"
                min="2"
                max="4"
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(Number(e.target.value))}
                className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-uno-blue"
                aria-label="Maximum number of players"
                style={{
                  background: `linear-gradient(to right, #3182CE 0%, #3182CE ${((maxPlayers - 2) / 2) * 100}%, #1F2937 ${((maxPlayers - 2) / 2) * 100}%, #1F2937 100%)`,
                }}
              />
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>2</span>
                <span>3</span>
                <span>4</span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-dark-700 hover:bg-dark-600 text-white font-semibold rounded-lg transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!roomName.trim()}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-uno-blue to-uno-green hover:shadow-glow-blue text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              Create Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}