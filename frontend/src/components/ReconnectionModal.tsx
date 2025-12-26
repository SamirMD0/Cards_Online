interface ReconnectionModalProps {
  isOpen: boolean;
  isReconnecting: boolean;
  canReconnect: boolean;
  onReconnect: () => void;
  onDismiss: () => void;
}

export default function ReconnectionModal({
  isOpen,
  isReconnecting,
  canReconnect,
  onReconnect,
  onDismiss
}: ReconnectionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="bg-dark-800 border-2 border-dark-700 rounded-2xl p-8 max-w-md w-full text-center">
        {isReconnecting ? (
          // Attempting to reconnect
          <>
            <div className="text-6xl mb-4 animate-bounce">🔄</div>
            <h2 className="text-3xl font-poppins font-bold text-white mb-4">
              Reconnecting...
            </h2>
            <p className="text-gray-400 mb-6">
              Checking if you were in a game...
            </p>
            <div className="flex justify-center">
              <div className="w-12 h-12 border-4 border-uno-blue border-t-transparent rounded-full animate-spin" />
            </div>
          </>
        ) : canReconnect ? (
          // Can rejoin game
          <>
            <div className="text-6xl mb-4">🎮</div>
            <h2 className="text-3xl font-poppins font-bold text-white mb-4">
              Game Found!
            </h2>
            <p className="text-gray-400 mb-6">
              You were disconnected from an active game. Would you like to rejoin?
            </p>
            <div className="flex gap-3">
              <button
                onClick={onDismiss}
                className="flex-1 py-3 bg-dark-700 hover:bg-dark-600 text-white font-semibold rounded-lg transition-colors"
              >
                Leave Game
              </button>
              <button
                onClick={onReconnect}
                className="flex-1 py-3 bg-gradient-to-r from-uno-blue to-uno-green hover:shadow-glow-blue text-white font-semibold rounded-lg transition-all duration-300"
              >
                Rejoin Game
              </button>
            </div>
          </>
        ) : (
          // No game to rejoin
          <>
            <div className="text-6xl mb-4">🔌</div>
            <h2 className="text-3xl font-poppins font-bold text-white mb-4">
              Connection Lost
            </h2>
            <p className="text-gray-400 mb-6">
              You were disconnected. No active game found to rejoin.
            </p>
            <button
              onClick={onDismiss}
              className="w-full py-3 bg-uno-blue hover:bg-uno-blue/80 text-white font-semibold rounded-lg transition-colors"
            >
              Back to Lobby
            </button>
          </>
        )}
      </div>
    </div>
  );
}