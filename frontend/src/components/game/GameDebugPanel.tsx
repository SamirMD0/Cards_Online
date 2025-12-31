// frontend/src/components/game/GameDebugPanel.tsx
import { socketService } from '../../socket';

interface GameDebugPanelProps {
  handCount: number;
  userId: string | null;
  isMyTurn: boolean;
  onRequestHand: () => void;
}

export default function GameDebugPanel({
  handCount,
  userId,
  isMyTurn,
  onRequestHand
}: GameDebugPanelProps) {
  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed top-24 left-4 bg-black/80 text-white p-3 rounded-lg text-xs max-w-xs z-50">
      <div className="font-bold mb-2">🔍 Debug Info</div>
      <div>Hand: {handCount} cards</div>
      <div>Socket: {socketService.socket.id?.slice(0, 8)}...</div>
      <div>UserId: {userId?.slice(0, 8)}...</div>
      <div>My Turn: {isMyTurn ? 'YES' : 'NO'}</div>
      <button
        onClick={onRequestHand}
        className="mt-2 px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-white text-xs w-full"
      >
        🔄 Request Hand
      </button>
    </div>
  );
}