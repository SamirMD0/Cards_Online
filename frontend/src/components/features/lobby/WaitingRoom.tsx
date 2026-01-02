// frontend/src/components/game/WaitingRoom.tsx
import Navigation from '../../common/Navigation';
import PlayerAvatar from '../../common/PlayerAvatar';
import type { GameState } from '../../../types';

interface WaitingRoomProps {
  roomId: string;
  gameState: GameState;
  onAddBot: () => void;
  onStartGame: () => void;
  onLeave: () => void;
}

export default function WaitingRoom({
  roomId,
  gameState,
  onAddBot,
  onStartGame,
  onLeave
}: WaitingRoomProps) {
  return (
    <div className="min-h-screen bg-dark-900">
      <Navigation />

      <div className="pt-32 px-4 max-w-4xl mx-auto">
        <div className="bg-dark-800 border-2 border-dark-700 rounded-2xl p-6 sm:p-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-poppins font-bold text-white mb-4">
            Waiting Room
          </h2>
          <p className="text-lg sm:text-xl text-gray-400 mb-8">
            Room Code:{" "}
            <span className="text-uno-yellow font-mono">{roomId}</span>
          </p>

          {/* Players Grid */}
          <div className="mb-8">
            <h3 className="text-xl sm:text-2xl font-poppins font-bold text-white mb-6">
              Players ({gameState.players.length}/4)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {gameState.players.map((player) => (
                <div key={player.id} className="flex flex-col items-center">
                  <PlayerAvatar
                    name={player.name}
                    isHost={player.id === gameState.players[0].id}
                    isReady={true}
                    size="lg"
                  />
                  <p className="mt-3 text-white font-semibold text-sm sm:text-base">
                    {player.name}
                  </p>
                  {player.isBot && (
                    <span className="text-xs sm:text-sm text-gray-400">Bot</span>
                  )}
                </div>
              ))}
              {Array.from({ length: 4 - gameState.players.length }).map(
                (_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="flex flex-col items-center"
                  >
                    <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border-4 border-dashed border-dark-600 flex items-center justify-center">
                      <span className="text-2xl sm:text-4xl text-dark-600">?</span>
                    </div>
                    <p className="mt-3 text-gray-500 text-sm sm:text-base">Waiting...</p>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button
              onClick={onAddBot}
              disabled={gameState.players.length >= 4}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-dark-700 hover:bg-dark-600 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              ➕ Add Bot
            </button>
            <button
              onClick={onStartGame}
              disabled={gameState.players.length < 2}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-uno-blue to-uno-green hover:shadow-glow-blue text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              🚀 Start Game
            </button>
            <button
              onClick={onLeave}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all duration-300 text-sm sm:text-base"
            >
              🚪 Leave
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}