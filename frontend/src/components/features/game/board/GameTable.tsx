// frontend/src/components/features/game/board/GameTable.tsx

import UnoCard, { CardColor } from '../../uno-cards/UnoCard';
import type { GameState } from '../../../../types';

interface GameTableProps {
  gameState: GameState;
  isMyTurn: boolean;
  onDrawCard: () => void;
}

const colorMap: Record<string, string> = {
  red: 'hsl(0, 85%, 50%)',
  blue: 'hsl(210, 100%, 45%)',
  green: 'hsl(145, 70%, 40%)',
  yellow: 'hsl(45, 100%, 50%)',
  wild: 'linear-gradient(135deg, hsl(0, 85%, 50%), hsl(210, 100%, 45%), hsl(145, 70%, 40%), hsl(45, 100%, 50%))',
};

export default function GameTable({ 
  gameState, 
  isMyTurn, 
  onDrawCard 
}: GameTableProps) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  
  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
      <div className="flex items-center gap-3 sm:gap-4 md:gap-8 lg:gap-12">
        {/* Draw Pile - BIGGER on mobile */}
        <div className="text-center group">
          <p className="text-white/80 mb-1 sm:mb-2 font-heading font-semibold text-xs sm:text-xs md:text-sm tracking-wide">
            DRAW
          </p>
          <button
            onClick={onDrawCard}
            disabled={!isMyTurn}
            className={cn(
              "relative transition-transform duration-200",
              isMyTurn && "hover:scale-105 hover:-translate-y-1 active:scale-95"
            )}
          >
            {/* Stacked cards effect - Simplified on mobile */}
            <div className="hidden sm:block absolute top-1 left-1 opacity-60">
              <UnoCard color="wild" value="" faceUp={false} disabled size="sm" />
            </div>
            <div className="hidden sm:block absolute top-0.5 left-0.5 opacity-80">
              <UnoCard color="wild" value="" faceUp={false} disabled size="sm" />
            </div>
            <UnoCard
              color="wild"
              value=""
              faceUp={false}
              disabled={!isMyTurn}
              size={isMobile ? 'sm' : 'sm'}
              className={isMyTurn ? "ring-2 ring-primary/50 animate-pulse-ring" : ""}
            />
            <div className="absolute -bottom-1 -right-1 bg-secondary text-white text-xs sm:text-[10px] md:text-xs px-2 sm:px-2 py-0.5 rounded-full font-bold border border-border shadow-lg">
              {gameState.deckCount}
            </div>
          </button>
        </div>

        {/* Current Color Indicator - BIGGER on mobile */}
        <div className="flex flex-col items-center gap-1 sm:gap-2 md:gap-3">
          <p className="text-white/80 text-xs sm:text-xs md:text-sm font-heading font-semibold tracking-wide">
            COLOR
          </p>
          <div 
            className="w-12 h-12 sm:w-10 sm:h-10 md:w-14 md:h-14 rounded-full border-3 sm:border-4 border-white/40 shadow-xl animate-float"
            style={{ 
              background: gameState.currentColor ? colorMap[gameState.currentColor] : 'white'
            }}
          />
        </div>

        {/* Discard Pile - BIGGER on mobile */}
        <div className="text-center">
          <p className="text-white/80 mb-1 sm:mb-2 font-heading font-semibold text-xs sm:text-xs md:text-sm tracking-wide">
            DISCARD
          </p>
          <div className="relative">
            {/* Shadow cards - Hidden on mobile */}
            <div className="hidden sm:block absolute top-1 left-1 opacity-30">
              <div className="w-8 h-12 sm:w-10 sm:h-14 md:w-12 md:h-[4.5rem] rounded-lg bg-gray-700" />
            </div>
            {gameState.topCard && (
              <UnoCard
                color={gameState.topCard.color as CardColor}
                value={gameState.topCard.value}
                faceUp={true}
                disabled
                size={isMobile ? 'sm' : 'sm'}
                className="shadow-2xl card-glow"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}