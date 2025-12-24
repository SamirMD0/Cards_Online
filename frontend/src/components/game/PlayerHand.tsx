// frontend/src/components/game/PlayerHand.tsx
import UnoCard, { CardColor } from '../UnoCard';
import PlayerAvatar from '../PlayerAvatar';
import type { Card, GameState } from '../../types';

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
  return (
    <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-full sm:max-w-4xl px-2 sm:px-4">
      <div className="bg-gray-800/95 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2 sm:p-4 border border-gray-700">
        <div className="flex justify-between items-center mb-2 sm:mb-3">
          <div className="flex items-center gap-2">
            <PlayerAvatar name={playerName} size="sm" />
            <div>
              <p className="font-semibold text-white text-xs sm:text-sm">
                Your Hand ({playerHand.length})
              </p>
              {isMyTurn && (
                <p className="text-yellow-400 text-[10px] sm:text-xs font-bold">
                  🎯 YOUR TURN!
                </p>
              )}
            </div>
          </div>
          {pendingDraw > 0 && (
            <div className="bg-red-500 text-white px-2 sm:px-3 py-1 rounded-lg font-bold text-xs sm:text-sm">
              +{pendingDraw}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1 sm:gap-2 justify-center max-h-32 sm:max-h-none overflow-y-auto sm:overflow-visible">
          {playerHand.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-400 text-sm mb-2">No cards in hand</p>
              <button
                onClick={onRequestHand}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs"
              >
                🔄 Request Hand
              </button>
            </div>
          ) : (
            playerHand.map((card) => (
              <UnoCard
                key={card.id}
                color={card.color as CardColor}
                value={card.value}
                faceUp={true}
                onClick={() => onCardClick(card)}
                disabled={!isMyTurn}
                size="xs"
                className="hover:scale-105 sm:hover:scale-110 transition-all"
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}