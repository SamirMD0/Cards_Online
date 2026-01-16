// frontend/src/components/features/game/ui/GameHeader.tsx

import { memo } from 'react';
import type { GameState } from '../../../../types';

interface GameHeaderProps {
  gameState: GameState;
  isMyTurn: boolean;
  currentPlayerName?: string;
  turnTimeRemaining?: number;
}

// ✅ CRITICAL FIX: Memoize component to prevent timer-induced re-renders
const GameHeader = memo(({
  gameState,
  isMyTurn,
  currentPlayerName,
  turnTimeRemaining
}: GameHeaderProps) => {
  // ✅ OPTIMIZATION: Use prop directly instead of local state
  const timeLeft = turnTimeRemaining || 30;
  const isLowTime = timeLeft <= 10;

  return (
    <div className="px-2 sm:px-4 max-w-7xl mx-auto mb-1 sm:mb-2 md:mb-4">
      <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
        <div className="flex-1">
          <h3 className="text-sm sm:text-base md:text-xl font-poppins font-bold text-white mb-0.5 sm:mb-1">
            {isMyTurn ? (
              <span className="text-uno-yellow">🎯 YOUR TURN!</span>
            ) : (
              <span className="truncate block max-w-[200px] sm:max-w-none">
                {currentPlayerName}'s Turn
              </span>
            )}
          </h3>
          <p className="text-gray-400 text-[10px] sm:text-xs md:text-sm">
            {gameState.direction === 1 ? "→ Clockwise" : "← Counter"}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 md:gap-6">
          {/* Timer Display */}
          {isMyTurn && turnTimeRemaining && (
            <div className="text-center">
              <p className="text-[10px] sm:text-xs text-gray-400">Time</p>
              <p className={`text-base sm:text-lg md:text-xl font-bold ${isLowTime ? 'text-red-500 animate-pulse' : 'text-white'
                }`}>
                {timeLeft}s
              </p>
            </div>
          )}

          <div className="text-center">
            <p className="text-[10px] sm:text-xs text-gray-400">Deck</p>
            <p className="text-base sm:text-lg md:text-xl font-bold text-white">
              {gameState.deckCount}
            </p>
          </div>
          {gameState.pendingDraw > 0 && (
            <div className="text-center">
              <p className="text-[10px] sm:text-xs text-gray-400">Draw</p>
              <p className="text-base sm:text-lg md:text-xl font-bold text-uno-yellow">
                +{gameState.pendingDraw}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // ✅ OPTIMIZATION: Custom comparison - only re-render when meaningful props change
  // Don't re-render on every timer tick, only when second changes
  return (
    prevProps.isMyTurn === nextProps.isMyTurn &&
    prevProps.currentPlayerName === nextProps.currentPlayerName &&
    prevProps.gameState.direction === nextProps.gameState.direction &&
    prevProps.gameState.deckCount === nextProps.gameState.deckCount &&
    prevProps.gameState.pendingDraw === nextProps.gameState.pendingDraw &&
    Math.floor((prevProps.turnTimeRemaining || 0) / 1000) === Math.floor((nextProps.turnTimeRemaining || 0) / 1000)
  );
});

GameHeader.displayName = 'GameHeader';

export default GameHeader;