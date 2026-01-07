// frontend/src/components/features/game/board/OpponentHand.tsx
// ✅ FIXED: Mobile-safe positioning that doesn't overlap game table

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
  
  // ✅ FIXED: Mobile-safe positioning that respects table boundaries
  const positionStyles: Record<string, string> = {
    // Top player - stays high, safe distance from table
    top: 'top-[3%] sm:top-[5%] left-1/2 -translate-x-1/2',
    
    // ✅ CRITICAL: Left/Right on mobile - pushed to edges, vertically centered
    left: cn(
      'left-[2%] sm:left-[5%]',  // Closer to edge on mobile
      'top-[35%] sm:top-1/2',     // Higher on mobile to avoid table
      '-translate-y-1/2'
    ),
    right: cn(
      'right-[2%] sm:right-[5%]', // Closer to edge on mobile
      'top-[35%] sm:top-1/2',     // Higher on mobile to avoid table
      '-translate-y-1/2'
    ),
    
    // Corner positions (3+ players)
    'top-left': 'top-[15%] sm:top-[18%] left-[8%] sm:left-[12%]',
    'top-right': 'top-[15%] sm:top-[18%] right-[8%] sm:right-[12%]',
  };

  const isVertical = position === 'left' || position === 'right';
  const fanSpread = isMobile ? (isVertical ? 4 : 6) : (isVertical ? 8 : 12);

  return (
    <div className={cn('absolute z-20', positionStyles[position])}>
      <div className={cn(
        'flex items-center gap-2 sm:gap-3',
        isVertical ? 'flex-col' : 'flex-col',
        position === 'left' && 'flex-row',
        position === 'right' && 'flex-row-reverse'
      )}>
        {/* Player Info Badge - ✅ Compact on mobile */}
        <div className={cn(
          'glass-panel rounded-full flex items-center gap-1.5 sm:gap-2',
          'px-2 py-1 sm:px-3 sm:py-2', // ✅ Smaller padding on mobile
          'transition-all duration-300',
          isCurrentTurn && 'ring-2 ring-primary turn-indicator shadow-lg shadow-primary/30'
        )}>
          <PlayerAvatar name={player.name} size={isMobile ? 'sm' : 'sm'} />
          <div className="text-white">
            <p className="font-heading font-semibold text-[10px] sm:text-xs whitespace-nowrap">
              {player.name.length > 8 && isMobile 
                ? player.name.substring(0, 8) + '...' 
                : player.name}
            </p>
            <p className="text-[8px] sm:text-xs text-muted-foreground">
              {player.handCount} card{player.handCount !== 1 ? 's' : ''}
            </p>
          </div>
          {isCurrentTurn && (
            <span className="text-primary text-xs sm:text-xs animate-pulse">⭐</span>
          )}
        </div>

        {/* ✅ FIXED: Cards Fan - More compact on mobile */}
        <div className={cn(
          'flex relative',
          isVertical ? 'flex-col -space-y-4 sm:-space-y-10' : 'flex-row'
        )}>
          {cards.map((i, index) => {
            const offset = (index - (cards.length - 1) / 2) * fanSpread;
            const rotation = isVertical 
              ? (position === 'left' ? -90 : 90)
              : isMobile ? offset * 0.2 : offset * 0.5;
            
            return (
              <div 
                key={i}
                style={{
                  transform: isVertical 
                    ? `rotate(${rotation}deg)` 
                    : `rotate(${rotation}deg) translateX(${offset}px)`,
                  marginLeft: !isVertical && i > 0 ? (isMobile ? '-0.75rem' : '-1.5rem') : 0,
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
          
          {/* Card count overflow indicator */}
          {player.handCount > maxVisibleCards && (
            <div className={cn(
              'flex items-center justify-center',
              'w-4 h-6 sm:w-6 sm:h-9 md:w-8 md:h-12 rounded-md',
              'bg-secondary/90 text-white text-[7px] sm:text-[10px] md:text-xs font-bold',
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