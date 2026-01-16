// frontend/src/components/features/game/board/PlayerHand.tsx

import { memo } from "react";
import UnoCard, { CardColor } from "../../uno-cards/UnoCard";
import PlayerAvatar from "../../../common/PlayerAvatar";
import type { Card } from "../../../../types";
import { cn } from "../../../../lib/utils";

interface PlayerHandProps {
  playerName: string;
  playerHand: Card[];
  isMyTurn: boolean;
  pendingDraw: number;
  onCardClick: (card: Card) => void;
  onRequestHand: () => void;
}

// ✅ CRITICAL FIX: Memoize component to prevent timer-induced re-renders
const PlayerHand = memo(({
  playerName,
  playerHand,
  isMyTurn,
  pendingDraw,
  onCardClick,
  onRequestHand,
}: PlayerHandProps) => {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

  return (
    <div className="w-full">
      <div className="glass-panel mx-1 sm:mx-2 md:mx-4 mb-1 sm:mb-2 md:mb-4 rounded-xl sm:rounded-2xl p-2 sm:p-3 md:p-4 max-w-5xl lg:mx-auto">
        <div className="flex justify-between items-center mb-2 sm:mb-3">
          <div className="flex items-center gap-2 sm:gap-2 md:gap-3">
            <PlayerAvatar name={playerName} size={isMobile ? "md" : "sm"} />
            <div>
              <p className="font-heading font-bold text-white text-sm sm:text-sm md:text-base">
                Your Hand
                <span className="ml-1 sm:ml-2 text-muted-foreground font-normal">
                  ({playerHand.length})
                </span>
              </p>
              {isMyTurn && (
                <p className="text-primary text-xs sm:text-xs md:text-sm font-bold flex items-center gap-1 text-shadow-glow">
                  <span className="animate-pulse">🎯</span> YOUR TURN!
                </p>
              )}
            </div>
          </div>

          {pendingDraw > 0 && (
            <div className="bg-destructive text-white px-3 sm:px-3 py-1.5 sm:py-1.5 rounded-lg sm:rounded-xl font-heading font-bold text-sm sm:text-sm md:text-base animate-pulse">
              +{pendingDraw}
            </div>
          )}
        </div>

        <div className="relative overflow-x-auto pb-1 sm:pb-2 scrollbar-hide">
          <div className="flex justify-center gap-0.5 sm:gap-1 min-w-min px-1 sm:px-2">
            {playerHand.length === 0 ? (
              <div className="text-center py-4 sm:py-6 px-4 sm:px-8 w-full">
                <p className="text-muted-foreground text-sm sm:text-sm mb-2 sm:mb-3">
                  No cards in hand
                </p>
                <button
                  onClick={onRequestHand}
                  className="px-4 sm:px-4 py-2.5 bg-accent hover:bg-accent/80 text-accent-foreground rounded-lg text-sm sm:text-sm font-medium transition-colors"
                >
                  🔄 Request Hand
                </button>
              </div>
            ) : (
              playerHand.map((card, index) => {
                const totalCards = playerHand.length;
                const centerIndex = (totalCards - 1) / 2;
                const offset = index - centerIndex;

                const rotation = isMobile ? offset * 0.5 : offset * 2;
                const translateY = Math.abs(offset) * (isMobile ? 1 : 3);

                return (
                  <div
                    key={card.id}
                    // ✅ CSS-only hover: Uses group/card to trigger child styles
                    // !rotate-0 and !-translate-y override the inline styles below
                    className={cn(
                      "group/card relative transition-all duration-200 ease-out touch-manipulation",
                      "hover:z-50 hover:!rotate-0 hover:!-translate-y-[12px] hover:scale-105"
                    )}
                    style={{
                      transform: `rotate(${rotation}deg) translateY(${translateY}px)`,
                      marginLeft:
                        index > 0
                          ? isMobile
                            ? totalCards > 7 ? "-1.75rem" : "-1rem"
                            : "-0.75rem"
                          : 0,
                      zIndex: index,
                    }}
                  >
                    <UnoCard
                      color={card.color as CardColor}
                      value={card.value}
                      faceUp={true}
                      onClick={() => onCardClick(card)}
                      disabled={!isMyTurn}
                      size="sm"
                      className={cn(
                        "card-hover transition-all",
                        // ✅ Ring only shows on hover if it's the player's turn
                        isMyTurn && "group-hover/card:ring-2 group-hover/card:ring-primary group-hover/card:shadow-xl"
                      )}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

PlayerHand.displayName = 'PlayerHand';

export default PlayerHand;