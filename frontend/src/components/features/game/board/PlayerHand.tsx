// frontend/src/components/game/PlayerHand.tsx
import UnoCard, { CardColor } from '../../uno-cards/UnoCard';
import PlayerAvatar from '../../../common/PlayerAvatar';
import type { Card } from '../../../../types';
import { useState } from 'react';
import { cn } from '../../../../lib/utils';

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
  onRequestHand
}: PlayerHandProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30">
      <div className="glass-panel mx-2 sm:mx-4 mb-2 sm:mb-4 rounded-2xl p-3 sm:p-4 max-w-5xl lg:mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <PlayerAvatar name={playerName} size="md" />
            <div>
              <p className="font-heading font-bold text-white text-sm sm:text-base">
                Your Hand
                <span className="ml-2 text-muted-foreground font-normal">
                  ({playerHand.length})
                </span>
              </p>
              {isMyTurn && (
                <p className="text-primary text-xs sm:text-sm font-bold flex items-center gap-1 text-shadow-glow">
                  <span className="animate-pulse">🎯</span> YOUR TURN!
                </p>
              )}
            </div>
          </div>
          
          {pendingDraw > 0 && (
            <div className="bg-destructive text-white px-3 py-1.5 rounded-xl font-heading font-bold text-sm sm:text-base animate-pulse">
              +{pendingDraw}
            </div>
          )}
        </div>

        {/* Cards */}
        <div className="relative overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex justify-center gap-1 min-w-min px-2">
            {playerHand.length === 0 ? (
              <div className="text-center py-6 px-8">
                <p className="text-muted-foreground text-sm mb-3">No cards in hand</p>
                <button
                  onClick={onRequestHand}
                  className="px-4 py-2 bg-accent hover:bg-accent/80 text-accent-foreground rounded-lg text-sm font-medium transition-colors"
                >
                  🔄 Request Hand
                </button>
              </div>
            ) : (
              playerHand.map((card, index) => {
                const totalCards = playerHand.length;
                const centerIndex = (totalCards - 1) / 2;
                const offset = index - centerIndex;
                const rotation = offset * 2;
                const translateY = Math.abs(offset) * 3;
                const isHovered = hoveredIndex === index;
                
                return (
                  <div
                    key={card.id}
                    className="relative transition-all duration-200 ease-out"
                    style={{
                      transform: `
                        rotate(${isHovered ? 0 : rotation}deg) 
                        translateY(${isHovered ? -16 : translateY}px)
                        scale(${isHovered ? 1.1 : 1})
                      `,
                      marginLeft: index > 0 ? '-0.75rem' : 0,
                      zIndex: isHovered ? 50 : index,
                    }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <UnoCard
                      color={card.color as CardColor}
                      value={card.value}
                      faceUp={true}
                      onClick={() => onCardClick(card)}
                      disabled={!isMyTurn}
                      size="sm"
                      className={cn(
                        'transition-shadow duration-200',
                        isMyTurn && isHovered && 'ring-2 ring-primary shadow-xl'
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
