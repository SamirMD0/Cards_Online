// frontend/src/components/game/GameTable.tsx
import UnoCard, { CardColor } from '../../uno-cards/UnoCard';
import type { GameState } from '../../../../types';

interface GameTableProps {
  gameState: GameState;
  isMyTurn: boolean;
  onDrawCard: () => void;
}

export default function GameTable({ 
  gameState, 
  isMyTurn, 
  onDrawCard 
}: GameTableProps) {
  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <div className="flex items-center gap-3 sm:gap-6 md:gap-8">
        {/* Draw Pile */}
        <div className="text-center">
          <p className="text-white mb-1 sm:mb-2 font-semibold text-xs sm:text-sm">
            Draw
          </p>
          <button
            onClick={onDrawCard}
            disabled={!isMyTurn}
            className="relative group"
          >
            <UnoCard
              color="wild"
              value=""
              faceUp={false}
              disabled={!isMyTurn}
              size="sm"
              className="hover:scale-105 transition-transform"
            />
            <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded-full">
              {gameState.deckCount}
            </div>
          </button>
        </div>

        {/* Current Color Indicator */}
        <div className="flex flex-col items-center gap-1 sm:gap-2">
          <p className="text-white text-xs sm:text-sm font-semibold">Color</p>
          <div 
            className="w-8 h-8 sm:w-12 sm:h-12 rounded-full border-2 sm:border-4 border-white shadow-lg"
            style={{ backgroundColor: gameState.currentColor || 'white' }}
          />
        </div>

        {/* Discard Pile */}
        <div className="text-center">
          <p className="text-white mb-1 sm:mb-2 font-semibold text-xs sm:text-sm">
            Discard
          </p>
          {gameState.topCard && (
            <UnoCard
              color={gameState.topCard.color as CardColor}
              value={gameState.topCard.value}
              faceUp={true}
              disabled
              size="sm"
              className="shadow-2xl"
            />
          )}
        </div>
      </div>
    </div>
  );
}