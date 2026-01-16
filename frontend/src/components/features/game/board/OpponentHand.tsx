// frontend/src/components/features/game/board/OpponentHand.tsx
// ✅ FIXED: Pure CSS responsive - no JS viewport detection

import UnoCard from '../../uno-cards/UnoCard';
import PlayerAvatar from '../../../common/PlayerAvatar';
import type { Player } from '../../../../types';
import { cn } from '../../../../lib/utils';
import { memo } from 'react';

interface OpponentHandProps {
  player: Player;
  isCurrentTurn: boolean;
  position: 'top' | 'left' | 'right';
}

const OpponentHand = ({
  player,
  isCurrentTurn,
  position
}: OpponentHandProps) => {
  // ✅ Pure CSS: Responsive card counts via breakpoints
  const isVertical = position === 'left' || position === 'right';

  // Fewer cards visible on mobile to prevent overflow
  const maxVisibleCards = isVertical ? 3 : 4;
  const cards = Array.from(
    { length: Math.min(player.handCount, maxVisibleCards) },
    (_, i) => i
  );

  return (
    <div className={cn(
      "flex items-center justify-center transition-all duration-300",
      // ✅ Zone-safe sizing
      isVertical ? "h-auto w-auto" : "w-full h-auto py-1"
    )}>
      <div className={cn(
        'flex items-center',
        // ✅ Responsive layout direction
        isVertical
          ? 'flex-col gap-1'
          : 'flex-col gap-1 sm:gap-2',
        // Side opponents: badge above cards for vertical flow
        position === 'left' && 'flex-col',
        position === 'right' && 'flex-col'
      )}>

        {/* ========== PLAYER BADGE ========== */}
        <div className={cn(
          'glass-panel rounded-full flex items-center shrink-0 z-20',
          'px-1.5 py-1 sm:px-2 sm:py-1.5 md:px-3 md:py-2',
          'gap-1 sm:gap-1.5 md:gap-2',
          'transition-all duration-300',
          isCurrentTurn && 'ring-2 ring-primary turn-indicator shadow-lg shadow-primary/30'
        )}>
          <PlayerAvatar
            name={player.name}
            size="sm"
            className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8"
          />
          <div className="text-white min-w-0">
            <p className="font-heading font-semibold text-[9px] sm:text-[10px] md:text-xs whitespace-nowrap truncate max-w-[50px] sm:max-w-[70px] md:max-w-[80px]">
              {player.name}
            </p>
            <p className="text-[7px] sm:text-[8px] md:text-[10px] text-muted-foreground">
              {player.handCount} card{player.handCount !== 1 ? 's' : ''}
            </p>
          </div>
          {isCurrentTurn && (
            <span className="text-primary text-[10px] sm:text-xs animate-pulse shrink-0">⭐</span>
          )}
        </div>

        {/* ========== CARD FAN ========== */}
        <div className={cn(
          'flex relative shrink-0 z-10',
          // ✅ Tighter spacing on mobile for side opponents
          isVertical
            ? 'flex-col -mt-2 -space-y-6 sm:-space-y-7 md:-space-y-8'
            : 'flex-row -mt-0 -space-x-3 sm:-space-x-4 md:-space-x-5'
        )}>
          {cards.map((i, index) => {
            const centerOffset = (index - (cards.length - 1) / 2);
            const rotation = isVertical
              ? (position === 'left' ? -90 : 90)
              : centerOffset * 3;

            return (
              <div
                key={i}
                style={{ transform: `rotate(${rotation}deg)` }}
                className="transition-transform duration-200 origin-center"
              >
                {/* ✅ Card sizing via Tailwind */}
                <UnoCard
                  color="wild"
                  value=""
                  faceUp={false}
                  size="xs"
                  disabled
                  className={cn(
                    "shadow-md border-[0.5px] border-white/10",
                    // Responsive card dimensions
                    "!w-5 !h-8",           // mobile (smaller)
                    "sm:!w-7 sm:!h-11",    // sm
                    "md:!w-8 md:!h-12"     // md+
                  )}
                />
              </div>
            );
          })}

          {/* Overflow indicator */}
          {player.handCount > maxVisibleCards && (
            <div className={cn(
              'flex items-center justify-center shrink-0 z-20',
              'w-4 h-6 sm:w-5 sm:h-8 md:w-6 md:h-10',
              'rounded-md bg-secondary/90 text-white',
              'text-[7px] sm:text-[8px] md:text-[10px] font-bold',
              'border border-border shadow-md',
              isVertical && (position === 'left' ? '-rotate-90 my-1' : 'rotate-90 my-1')
            )}>
              +{player.handCount - maxVisibleCards}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default memo(OpponentHand);
