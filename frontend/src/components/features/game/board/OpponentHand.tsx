// frontend/src/components/features/game/board/OpponentHand.tsx

import UnoCard from '../../uno-cards/UnoCard';
import PlayerAvatar from '../../../common/PlayerAvatar';
import type { Player } from '../../../../types';
import { cn } from '../../../../lib/utils';

interface OpponentHandProps {
  player: Player;
  isCurrentTurn: boolean;
  position: 'top' | 'left' | 'right' | 'top-left' | 'top-right';
}

export default function OpponentHand({ 
  player, 
  isCurrentTurn, 
  position 
}: OpponentHandProps) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const maxVisibleCards = position === 'top' ? (isMobile ? 4 : 7) : (isMobile ? 3 : 5);
  const cards = Array.from({ length: Math.min(player.handCount, maxVisibleCards) }, (_, i) => i);
  
  const positionStyles: Record<string, string> = {
    top: 'top-[5%] left-1/2 -translate-x-1/2',
    left: 'left-[5%] top-1/2 -translate-y-1/2',
    right: 'right-[5%] top-1/2 -translate-y-1/2',
    'top-left': 'top-[18%] left-[12%]',
    'top-right': 'top-[18%] right-[12%]',
  };

  const isVertical = position === 'left' || position === 'right';
  const fanSpread = isMobile ? (isVertical ? 5 : 8) : (isVertical ? 8 : 12);

  return (
    <div className={cn('absolute z-20', positionStyles[position])}>
      <div className={cn(
        'flex items-center gap-2 sm:gap-3',
        isVertical ? 'flex-col' : 'flex-col',
        position === 'left' && 'flex-row',
        position === 'right' && 'flex-row-reverse'
      )}>
        {/* Player Info Badge - BIGGER on mobile */}
        <div className={cn(
          'glass-panel px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full flex items-center gap-1.5 sm:gap-2',
          'transition-all duration-300',
          isCurrentTurn && 'ring-2 ring-primary turn-indicator shadow-lg shadow-primary/30'
        )}>
          <PlayerAvatar name={player.name} size={isMobile ? 'md' : 'sm'} />
          <div className="text-white">
            <p className="font-heading font-semibold text-xs sm:text-xs md:text-sm whitespace-nowrap">
              {player.name}
            </p>
            <p className="text-[10px] sm:text-[10px] md:text-xs text-muted-foreground">
              {player.handCount} cards
            </p>
          </div>
          {isCurrentTurn && (
            <span className="text-primary text-xs sm:text-xs animate-pulse">⭐</span>
          )}
        </div>

        {/* Cards Fan - Simplified on mobile */}
        <div className={cn(
          'flex relative',
          isVertical ? 'flex-col -space-y-6 sm:-space-y-10' : 'flex-row'
        )}>
          {cards.map((i, index) => {
            const offset = (index - (cards.length - 1) / 2) * fanSpread;
            const rotation = isVertical 
              ? (position === 'left' ? -90 : 90)
              : isMobile ? offset * 0.3 : offset * 0.5;
            
            return (
              <div 
                key={i}
                style={{
                  transform: isVertical 
                    ? `rotate(${rotation}deg)` 
                    : `rotate(${rotation}deg) translateX(${offset}px)`,
                  marginLeft: !isVertical && i > 0 ? (isMobile ? '-1rem' : '-1.5rem') : 0,
                }}
                className="transition-transform duration-200"
              >
                <UnoCard
                  color="wild"
                  value=""
                  faceUp={false}
                  size="xs"
                  disabled
                  className="shadow-md"
                />
              </div>
            );
          })}
          
          {player.handCount > maxVisibleCards && (
            <div className={cn(
              'flex items-center justify-center',
              'w-5 h-7 sm:w-6 sm:h-9 md:w-8 md:h-12 rounded-md',
              'bg-secondary/90 text-white text-[8px] sm:text-[10px] md:text-xs font-bold',
              'border border-border shadow-md',
              isVertical && (position === 'left' ? '-rotate-90' : 'rotate-90')
            )}>
              +{player.handCount - maxVisibleCards}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}