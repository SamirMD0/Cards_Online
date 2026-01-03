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
  const maxVisibleCards = position === 'top' ? 7 : 5;
  const cards = Array.from({ length: Math.min(player.handCount, maxVisibleCards) }, (_, i) => i);
  
  const positionStyles: Record<string, string> = {
    top: 'top-[3%] left-1/2 -translate-x-1/2',
    left: 'left-[3%] top-1/2 -translate-y-1/2',
    right: 'right-[3%] top-1/2 -translate-y-1/2',
    'top-left': 'top-[15%] left-[10%]',
    'top-right': 'top-[15%] right-[10%]',
  };

  const isVertical = position === 'left' || position === 'right';
  const fanSpread = isVertical ? 8 : 12;

  return (
    <div className={cn('absolute z-20', positionStyles[position])}>
      <div className={cn(
        'flex items-center gap-3',
        isVertical ? 'flex-col' : 'flex-col',
        position === 'left' && 'flex-row',
        position === 'right' && 'flex-row-reverse'
      )}>
        {/* Player Info Badge */}
        <div className={cn(
          'glass-panel px-3 py-2 rounded-full flex items-center gap-2',
          'transition-all duration-300',
          isCurrentTurn && 'ring-2 ring-primary turn-indicator shadow-lg shadow-primary/30'
        )}>
          <PlayerAvatar name={player.name} size="sm" />
          <div className="text-white">
            <p className="font-heading font-semibold text-xs sm:text-sm whitespace-nowrap">
              {player.name}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              {player.handCount} cards
            </p>
          </div>
          {isCurrentTurn && (
            <span className="text-primary text-xs animate-pulse">⭐</span>
          )}
        </div>

        {/* Cards Fan */}
        <div className={cn(
          'flex relative',
          isVertical ? 'flex-col -space-y-10' : 'flex-row'
        )}>
          {cards.map((i, index) => {
            const offset = (index - (cards.length - 1) / 2) * fanSpread;
            const rotation = isVertical 
              ? (position === 'left' ? -90 : 90)
              : offset * 0.5;
            
            return (
              <div 
                key={i}
                style={{
                  transform: isVertical 
                    ? `rotate(${rotation}deg)` 
                    : `rotate(${rotation}deg) translateX(${offset}px)`,
                  marginLeft: !isVertical && i > 0 ? '-1.5rem' : 0,
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
              'w-6 h-9 sm:w-8 sm:h-12 rounded-md',
              'bg-secondary/90 text-white text-[10px] sm:text-xs font-bold',
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
