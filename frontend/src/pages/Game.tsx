import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navigation from "../components/common/Navigation";
// import GameDebugPanel from "../components/features/game/ui/GameDebugPanel";
import GameHeader from "../components/features/game/ui/GameHeader";
import GameTable from "../components/features/game/board/GameTable";
import PlayerHand from "../components/features/game/board/PlayerHand";
import OpponentHand from "../components/features/game/board/OpponentHand";
import ColorPickerModal from "../components/features/game/ui/ColorPickerModal";
import GameOverModal from "../components/features/game/ui/GameOverModal";
import WaitingRoom from "../components/features/lobby/WaitingRoom";
import { socketService } from "../socket";
import type { GameState, Card } from "../types";
import ReconnectionModal from "../components/features/game/ui/ReconnectionModal";
import { roomCookies } from "../utils/roomCookies";

// frontend/src/pages/Game.tsx

export default function Game() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pendingCard, setPendingCard] = useState<Card | null>(null);
  const [showGameOver, setShowGameOver] = useState(false);
  const [winner, setWinner] = useState<string>("");
  const [notification, setNotification] = useState("");

  const [showReconnectModal, setShowReconnectModal] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [canReconnect, setCanReconnect] = useState(false);

  const [turnTimeRemaining, setTurnTimeRemaining] = useState<number>(30000);
  const userId = user?.id || null;
  const isMyTurn = gameState?.currentPlayer === userId;
  const hasJoinedRef = useRef(false);
  const isReconnectAttempt = location.state?.reconnect === true;

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 3000);
  };

  const requestHand = () => {
    socketService.socket.emit('request_hand');
  };

   useEffect(() => {
    if (!roomId || !userId) {
      navigate("/lobby");
      return;
    }

    console.log('[Game] 🎬 Component mounted');

    if (!socketService.socket.connected) {
      socketService.connect();
    }

    let stateRequestTimeout: NodeJS.Timeout | null = null;

    // ========================================
    // EVENT HANDLERS
    // ========================================

    const handleGameState = (state: GameState) => {
      console.log('[Game] ✅ Game state received');
      setGameState(state);
      
      if (stateRequestTimeout) {
        clearTimeout(stateRequestTimeout);
        stateRequestTimeout = null;
      }
    };

    const handleGameStarted = (state: GameState) => {
      console.log('[Game] 🎮 Game started');
      setGameState(state);
      showNotification("Game started! 🎮");
      setTimeout(() => requestHand(), 500);
    };

    const handleHandUpdate = (data: { hand: Card[] }) => {
      console.log('[Game] ✅ Hand update:', data.hand.length, 'cards');
      setPlayerHand(data.hand);
    };

    const handleCardPlayed = (data: any) => {
      const player = gameState?.players.find((p) => p.id === data.playerId);
      if (player) {
        showNotification(`${player.name} played ${data.card.value}`);
      }
    };

    const handleGameOver = (data: { winner: string; winnerId: string }) => {
      console.log('[Game] 🏆 Game over:', data);
      setWinner(data.winner);
      setShowGameOver(true);
      roomCookies.clearCurrentRoom();
    };

    const handleError = (error: { message: string; shouldReconnect?: boolean }) => {
      console.error('[Game] ❌ Error:', error);
      
      // ✅ FIX: If error says we should reconnect, do it
      if (error.shouldReconnect) {
        console.log('[Game] 🔄 Switching to reconnection mode...');
        socketService.reconnectToGame(roomId);
        return;
      }

      showNotification(error.message);
    };

    const handleShouldReconnect = (data: { roomId: string }) => {
      console.log('[Game] 🔄 Server says we should reconnect');
      socketService.reconnectToGame(data.roomId);
    };

    const handleGameRestored = (data: any) => {
      console.log('[Game] 🎮 Game restored!');
      setGameState(data.gameState);
      setPlayerHand(data.yourHand || []);
      showNotification(data.message || 'Reconnected successfully');
    };

    const handleReconnectionFailed = (data: any) => {
      console.log('[Game] ❌ Reconnection failed:', data.message);
      showNotification('Reconnection failed. Returning to lobby...');
      roomCookies.clearCurrentRoom();
      setTimeout(() => navigate('/lobby'), 2000);
    };

    const handlePlayerReconnected = (data: any) => {
      showNotification(`${data.playerName} reconnected`);
    };

    const handleTurnTimerStarted = (data: { duration: number; startTime: number }) => {
      const elapsed = Date.now() - data.startTime;
      setTurnTimeRemaining(data.duration - elapsed);
    };

    const handleTurnTimeout = (data: { playerId: string; playerName: string }) => {
      showNotification(`⏱️ ${data.playerName}'s turn timed out!`);
    };

    const handleRoomClosing = (data: { message: string }) => {
      showNotification(data.message);
      roomCookies.clearCurrentRoom();
      setTimeout(() => navigate('/lobby'), 3000);
    };

    // ========================================
    // ATTACH LISTENERS
    // ========================================

    socketService.socket.on('game_state', handleGameState);
    socketService.socket.on('game_started', handleGameStarted);
    socketService.socket.on('hand_update', handleHandUpdate);
    socketService.socket.on('card_played', handleCardPlayed);
    socketService.socket.on('game_over', handleGameOver);
    socketService.socket.on('error', handleError);
    socketService.socket.on('should_reconnect', handleShouldReconnect);
    socketService.socket.on('game_restored', handleGameRestored);
    socketService.socket.on('reconnection_failed', handleReconnectionFailed);
    socketService.socket.on('player_reconnected', handlePlayerReconnected);
    socketService.socket.on('turn_timer_started', handleTurnTimerStarted);
    socketService.socket.on('turn_timeout', handleTurnTimeout);
    socketService.socket.on('room_closing', handleRoomClosing);

    // ========================================
    // JOIN OR RECONNECT DECISION
    // ========================================

    // ✅ FIX: Prevent duplicate actions in StrictMode
    if (hasJoinedRef.current) {
      console.log('[Game] Already joined/reconnected, skipping');
      return;
    }
    hasJoinedRef.current = true;

    const cookie = roomCookies.getCurrentRoom();
    const hasActiveCookie = cookie && cookie.roomId === roomId;

    if (isReconnectAttempt || hasActiveCookie) {
      // ✅ RECONNECTION PATH
      console.log('[Game] 🔄 Attempting reconnection to', roomId);
      socketService.reconnectToGame(roomId);
      
      // ✅ Fallback: Request state if no response
      stateRequestTimeout = setTimeout(() => {
        if (!gameState) {
          console.log('[Game] ⏱️ No response, requesting state...');
          socketService.socket.emit('request_game_state', { roomId });
        }
      }, 3000);
      
    } else {
      // ✅ FRESH JOIN PATH (should not happen - lobby handles joining)
      console.log('[Game] ⚠️ Fresh navigation without join - requesting state');
      socketService.socket.emit('request_game_state', { roomId });
      
      stateRequestTimeout = setTimeout(() => {
        if (!gameState) {
          console.error('[Game] ❌ No game state - returning to lobby');
          showNotification('Failed to load game');
          setTimeout(() => navigate('/lobby'), 2000);
        }
      }, 5000);
    }

    // ========================================
    // CLEANUP
    // ========================================
    return () => {
      if (stateRequestTimeout) {
        clearTimeout(stateRequestTimeout);
      }
      
      socketService.socket.off('game_state', handleGameState);
      socketService.socket.off('game_started', handleGameStarted);
      socketService.socket.off('hand_update', handleHandUpdate);
      socketService.socket.off('card_played', handleCardPlayed);
      socketService.socket.off('game_over', handleGameOver);
      socketService.socket.off('error', handleError);
      socketService.socket.off('should_reconnect', handleShouldReconnect);
      socketService.socket.off('game_restored', handleGameRestored);
      socketService.socket.off('reconnection_failed', handleReconnectionFailed);
      socketService.socket.off('player_reconnected', handlePlayerReconnected);
      socketService.socket.off('turn_timer_started', handleTurnTimerStarted);
      socketService.socket.off('turn_timeout', handleTurnTimeout);
      socketService.socket.off('room_closing', handleRoomClosing);
      
      // ✅ Reset ref on unmount
      hasJoinedRef.current = false;
    };
  }, [roomId, userId, navigate]);

  // ========================================
  // HANDLER FUNCTIONS (outside useEffect)
  // ========================================

  const handleReconnect = () => {
    // This function is no longer used since reconnectRoomId was removed
    console.log('[Game] 🔄 Reconnect function called but no room ID available');
  };

  const handleDismissReconnect = () => {
    console.log('[Game] ❌ User dismissed reconnection');
    setShowReconnectModal(false);
    setCanReconnect(false);
    setIsReconnecting(false);
    roomCookies.clearCurrentRoom();
    navigate("/lobby");
  };

   const handleCardClick = (card: Card) => {
    if (!isMyTurn) {
      showNotification("It's not your turn!");
      return;
    }
    if (gameState && gameState.pendingDraw > 0 && !["draw2", "wild_draw4"].includes(card.value as string)) {
      showNotification(`You must draw ${gameState.pendingDraw} cards!`);
      return;
    }
    if (card.color === "wild") {
      setPendingCard(card);
      setShowColorPicker(true);
    } else {
      socketService.playCard(card.id);
    }
  };

  const handleColorSelect = (color: string) => {
    if (pendingCard) {
      socketService.playCard(pendingCard.id, color);
    }
    setShowColorPicker(false);
    setPendingCard(null);
  };

  const handleDraw = () => {
    if (!isMyTurn) {
      showNotification("It's not your turn!");
      return;
    }
    socketService.drawCard();
  };

  const handleLeaveRoom = () => {
    roomCookies.clearCurrentRoom();
    socketService.leaveRoom();
    navigate("/lobby");
  };

  // ========================================
  // RENDER
  // ========================================

  if (showReconnectModal) {
    return (
      <div className="min-h-screen bg-dark-900">
        <Navigation />
        <ReconnectionModal
          isOpen={showReconnectModal}
          isReconnecting={isReconnecting}
          canReconnect={canReconnect}
          onReconnect={handleReconnect}
          onDismiss={handleDismissReconnect}
        />
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🎮</div>
          <p className="text-xl text-gray-400 mb-2">Loading game...</p>
        </div>
      </div>
    );
  }

  const currentPlayer = gameState.players.find((p) => p.id === gameState.currentPlayer);
  const myPlayer = gameState.players.find((p) => p.id === userId);
  const otherPlayers = gameState.players.filter((p) => p.id !== userId);

  const getOpponentPosition = (index: number): "top" | "left" | "right" => {
    if (otherPlayers.length === 1) return "top";
    if (otherPlayers.length === 2) return index === 0 ? "left" : "right";
    return index === 0 ? "left" : index === 1 ? "top" : "right";
  };

  if (!gameState.gameStarted) {
    return (
      <WaitingRoom
        roomId={roomId || ""}
        gameState={gameState}
        onAddBot={() => socketService.addBot()}
        onStartGame={() => socketService.startGame()}
        onLeave={handleLeaveRoom}
      />
    );
  }

return (
    <div className="min-h-screen bg-dark-900 flex flex-col overflow-hidden">
      <Navigation />

      {/* Notification */}
      {notification && (
        <div className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-50 bg-uno-blue text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg text-xs sm:text-base max-w-[90vw] sm:max-w-md text-center">
          {notification}
        </div>
      )}

      {/* Header */}
      <div className="pt-12 sm:pt-20">
        <GameHeader
          gameState={gameState}
          isMyTurn={isMyTurn}
          currentPlayerName={currentPlayer?.name}
          turnTimeRemaining={turnTimeRemaining}
        />
      </div>

      {/* GAME AREA */}
      <div className="relative flex-1 bg-background overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5 sm:opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />
        </div>

        {/* CENTRAL TABLE AREA 
          Combines the felt background and the GameTable (cards)
          to ensure they stay perfectly aligned.
          - Mobile: top-[42%] (higher up to leave room for hand)
          - Desktop: top-[50%] (centered)
        */}
        <div className="absolute left-1/2 top-[42%] sm:top-[50%] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10">
          <div className="relative">
            {/* The Green Felt Table Background */}
            <div
              className="
                w-[85vw] h-[32vh]
                sm:w-[75vw] sm:h-[50vh]
                md:w-[65vw] md:h-[55vh]
                lg:w-[55vw] lg:h-[60vh]
                max-w-[480px]
                max-h-[380px]
                rounded-[50%]
                table-felt
                table-border-ring
              "
            />

            {/* The Actual Game Table (Draw/Discard Piles) - Centered on top of the felt */}
            <div className="absolute inset-0 flex items-center justify-center">
              <GameTable
                gameState={gameState}
                isMyTurn={isMyTurn}
                onDrawCard={handleDraw}
              />
            </div>
          </div>
        </div>

        {/* Opponent Hands - Positioned around the edges */}
        <div className="block">
          {otherPlayers.map((player, index) => (
            <OpponentHand
              key={player.id}
              player={player}
              isCurrentTurn={gameState.currentPlayer === player.id}
              position={getOpponentPosition(index)}
            />
          ))}
        </div>

        {/* Player Hand - Fixed at bottom */}
        <div className="fixed bottom-0 left-0 right-0 z-30">
          <PlayerHand
            playerName={myPlayer?.name || 'You'}
            playerHand={playerHand}
            isMyTurn={isMyTurn}
            pendingDraw={gameState.pendingDraw}
            onCardClick={handleCardClick}
            onRequestHand={requestHand}
          />
        </div>

        {/* Turn Indicator */}
        {isMyTurn && (
          <div className="fixed top-12 sm:top-20 left-1/2 -translate-x-1/2 z-40">
            <div className="glass-panel px-4 sm:px-6 py-1.5 sm:py-2 rounded-full border-2 border-primary/50">
              <span className="font-heading text-primary font-bold text-sm sm:text-base animate-pulse">
                ⚡ Your Turn ⚡
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ColorPickerModal
        isOpen={showColorPicker}
        onClose={() => setShowColorPicker(false)}
        onSelectColor={handleColorSelect}
      />

      <GameOverModal
        isOpen={showGameOver}
        winner={winner}
        onClose={handleLeaveRoom}
      />
    </div>
  );
}