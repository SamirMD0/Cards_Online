// frontend/src/components/game/GameOverModal.tsx

interface GameOverModalProps {
  isOpen: boolean;
  winner: string;
  onClose: () => void;
}

export default function GameOverModal({
  isOpen,
  winner,
  onClose
}: GameOverModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-uno-blue to-uno-green p-8 sm:p-12 rounded-2xl text-center max-w-md w-full">
        <div className="text-6xl sm:text-8xl mb-4 sm:mb-6">🎉</div>
        <h2 className="text-3xl sm:text-5xl font-poppins font-extrabold text-white mb-3 sm:mb-4">
          Game Over!
        </h2>
        <p className="text-2xl sm:text-3xl text-white mb-6 sm:mb-8">
          <strong>{winner}</strong> wins!
        </p>
        <button
          onClick={onClose}
          className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-uno-blue font-bold rounded-xl hover:scale-105 active:scale-95 transition-transform text-sm sm:text-base"
        >
          Back to Lobby
        </button>
      </div>
    </div>
  );
}