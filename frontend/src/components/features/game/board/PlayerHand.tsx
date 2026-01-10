// frontend/src/components/features/game/board/PlayerHand.tsx

import UnoCard, { CardColor } from "../../uno-cards/UnoCard";
import PlayerAvatar from "../../../common/PlayerAvatar";
import type { Card } from "../../../../types";
import { useState } from "react";
import { cn } from "../../../../lib/utils";

interface PlayerHandProps {
  playerName: string;
  playerHand: Card[];
  isMyTurn: boolean;
  pendingDraw: number;
  onCardClick: (card: Card) => void;
  onRequestHand: () => void;
}

export default function PlayerHand({
  playerName,
  playerHand,
  isMyTurn,
  pendingDraw,
  onCardClick,
  onRequestHand,
}: PlayerHandProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

  return (
    <div className="w-full">
      <div className="glass-panel mx-1 sm:mx-2 md:mx-4 mb-1 sm:mb-2 md:mb-4 rounded-xl sm:rounded-2xl p-2 sm:p-3 md:p-4 max-w-5xl lg:mx-auto">
        {/* Header - Bigger on mobile */}
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

        {/* Cards - CENTERED ON MOBILE with BIGGER SIZE */}
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

                // Mobile: BIGGER cards, less rotation
                const rotation = isMobile ? offset * 0.5 : offset * 2;
                const translateY = Math.abs(offset) * (isMobile ? 1 : 3);
                const isHovered = hoveredIndex === index;

                return (
                  <div
                    key={card.id}
                    className="relative transition-all duration-200 ease-out touch-manipulation"
                    style={{
                      transform: `
                        rotate(${isHovered ? 0 : rotation}deg) 
                        translateY(${isHovered ? -12 : translateY}px)
                        scale(${isHovered ? 1.05 : 1})
                      `,
                      marginLeft:
                        index > 0
                          ? isMobile
                            ? // Tighter spacing if many cards on mobile
                              totalCards > 7
                              ? "-1.75rem"
                              : "-1rem"
                            : "-0.75rem"
                          : 0,
                      zIndex: isHovered ? 50 : index,
                    }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onTouchStart={() => setHoveredIndex(index)}
                    onTouchEnd={() =>
                      setTimeout(() => setHoveredIndex(null), 300)
                    }
                  >
                    <UnoCard
                      color={card.color as CardColor}
                      value={card.value}
                      faceUp={true}
                      onClick={() => onCardClick(card)}
                      disabled={!isMyTurn}
                      size={isMobile ? "sm" : "sm"}
                      className={cn(
                        "card-hover",
                        isMyTurn && isHovered && "ring-2 ring-primary shadow-xl"
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
}
