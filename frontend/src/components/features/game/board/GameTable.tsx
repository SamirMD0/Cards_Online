// frontend/src/components/features/game/board/GameTable.tsx
// ✅ FIXED: Removed isMobile JS check - pure responsive CSS

import { memo } from "react";
import UnoCard, { CardColor } from "../../uno-cards/UnoCard";
import type { GameState } from "../../../../types";
import { cn } from "../../../../lib/utils";

interface GameTableProps {
  gameState: GameState;
  isMyTurn: boolean;
  onDrawCard: () => void;
}

const colorMap: Record<string, string> = {
  red: "hsl(0, 85%, 50%)",
  blue: "hsl(210, 100%, 45%)",
  green: "hsl(145, 70%, 40%)",
  yellow: "hsl(45, 100%, 50%)",
  wild: "linear-gradient(135deg, hsl(0, 85%, 50%), hsl(210, 100%, 45%), hsl(145, 70%, 40%), hsl(45, 100%, 50%))",
};

const GameTable = memo(function GameTable({
  gameState,
  isMyTurn,
  onDrawCard,
}: GameTableProps) {
  // ✅ REMOVED: const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  return (
    // ✅ Changed from absolute to flexbox - parent controls positioning
    <div className="flex items-center gap-2 sm:gap-4 md:gap-8 lg:gap-12">
      {/* Draw Pile */}
      <div className="text-center group">
        <p className="text-white/80 mb-0.5 sm:mb-1 md:mb-2 font-heading font-semibold text-[10px] sm:text-xs md:text-sm tracking-wide">
          DRAW
        </p>
        <button
          onClick={onDrawCard}
          disabled={!isMyTurn}
          className={cn(
            "relative game-action-smooth",
            isMyTurn && "cursor-pointer"
          )}
        >
          {/* Stacked cards effect - Hidden on mobile via sm: */}
          <div className="hidden sm:block absolute top-1 left-1 opacity-60">
            <UnoCard color="wild" value="" faceUp={false} disabled size="sm" />
          </div>
          <div className="hidden sm:block absolute top-0.5 left-0.5 opacity-80">
            <UnoCard color="wild" value="" faceUp={false} disabled size="sm" />
          </div>
          {/* ✅ Card uses Tailwind responsive, not JS size prop */}
          <UnoCard
            color="wild"
            value=""
            faceUp={false}
            disabled={!isMyTurn}
            size="sm"
            className={cn(
              isMyTurn && "ring-2 ring-primary/50 animate-pulse-ring",
              // Override size at different breakpoints if needed
              "w-8 h-12 sm:w-12 sm:h-[4.5rem] md:w-14 md:h-20"
            )}
          />
          <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 bg-secondary text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-bold border border-border shadow-lg">
            {gameState.deckCount}
          </div>
        </button>
      </div>

      {/* Current Color Indicator */}
      <div className="flex flex-col items-center gap-0.5 sm:gap-1 md:gap-2">
        <p className="text-white/80 text-[10px] sm:text-xs md:text-sm font-heading font-semibold tracking-wide">
          COLOR
        </p>
        <div
          className="w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 rounded-full border-2 sm:border-4 border-white/40 shadow-xl animate-float"
          style={{
            background: gameState.currentColor
              ? colorMap[gameState.currentColor]
              : "white",
          }}
        />
      </div>

      {/* Discard Pile */}
      <div className="text-center">
        <p className="text-white/80 mb-0.5 sm:mb-1 md:mb-2 font-heading font-semibold text-[10px] sm:text-xs md:text-sm tracking-wide">
          DISCARD
        </p>
        <div className="relative">
          {/* Shadow cards - Hidden on mobile */}
          <div className="hidden sm:block absolute top-1 left-1 opacity-30">
            <div className="w-8 h-12 sm:w-12 sm:h-[4.5rem] md:w-14 md:h-20 rounded-lg bg-gray-700" />
          </div>
          {gameState.topCard && (
            <UnoCard
              color={gameState.topCard.color as CardColor}
              value={gameState.topCard.value}
              faceUp={true}
              disabled
              size="sm"
              className="shadow-2xl card-glow w-8 h-12 sm:w-12 sm:h-[4.5rem] md:w-14 md:h-20"
            />
          )}
        </div>
      </div>
    </div>
  );
});

export default GameTable;
