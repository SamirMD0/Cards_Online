// frontend/src/components/game/OpponentHand.tsx
import UnoCard from '../UnoCard';
import PlayerAvatar from '../PlayerAvatar';
import type { Player } from '../../types';

interface OpponentHandProps {
  player: Player;
  isCurrentTurn: boolean;
  position: 'top' | 'left' | 'right';
}

export default function OpponentHand({ 
  player, 
  isCurrentTurn, 
  position 
}: OpponentHandProps) {
  const cards = Array.from({ length: Math.min(player.handCount, 6) }, (_, i) => i);
  
  const positionStyles = {
    top: 'top-2 sm:top-4 left-1/2 -translate-x-1/2',
    left: 'left-2 sm:left-4 top-1/2 -translate-y-1/2',
    right: 'right-2 sm:right-4 top-1/2 -translate-y-1/2'
  };

  // Cards direction: row for top, column for left/right
  const cardDirection = {
    top: 'flex-row',
    left: 'flex-col',
    right: 'flex-col'
  };

  const shouldRotate = position === 'left' || position === 'right';

  return (
    <div className={`absolute ${positionStyles[position]} z-20`}>
      <div className={`flex ${position === 'top' ? 'flex-col' : position === 'left' ? 'flex-row' : 'flex-row-reverse'} items-center gap-2`}>
        {/* Player Info */}
        <div className={`flex items-center gap-2 bg-gray-800/95 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full border ${
          isCurrentTurn ? 'border-yellow-400 ring-2 ring-yellow-400/50 shadow-lg shadow-yellow-400/20' : 'border-gray-700'
        }`}>
          <PlayerAvatar name={player.name} size="sm" />
          <div className="text-white text-xs sm:text-sm whitespace-nowrap">
            <p className="font-semibold">{player.name}</p>
            <p className="text-[10px] sm:text-xs text-gray-400">{player.handCount} cards</p>
          </div>
        </div>

        {/* Cards Fan - Vertical for left/right, horizontal for top */}
        <div className={`flex ${cardDirection[position]} gap-1`}>
          {cards.map((i) => (
            <div 
              key={i}
              className={shouldRotate ? 'transform -rotate-90' : ''}
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
          ))}
          {player.handCount > 6 && (
            <div 
              className={`w-8 h-12 bg-gray-700/90 rounded-md flex items-center justify-center text-white text-[10px] border border-gray-600 ${
                shouldRotate ? 'transform -rotate-90' : ''
              }`}
            >
              +{player.handCount - 6}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}