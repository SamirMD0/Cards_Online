// frontend/src/pages/Game.tsx
// ✅ FIXED: Zone-based layout architecture for clean separation

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navigation from "../components/common/Navigation";
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

  // [Socket event handlers - UNCHANGED]
  useEffect(() => {
    if (!roomId || !userId) {
      navigate("/lobby");
      return;
    }

    if (!socketService.socket.connected) {
      socketService.connect();
    }

    let stateRequestTimeout: NodeJS.Timeout | null = null;

    const handleGameState = (state: GameState) => {
      setGameState(state);
      if (stateRequestTimeout) {
        clearTimeout(stateRequestTimeout);
        stateRequestTimeout = null;
      }
    };

    const handleGameStarted = (state: GameState) => {
      setGameState(state);
      showNotification("Game started! 🎮");
      setTimeout(() => requestHand(), 500);
    };

    const handleHandUpdate = (data: { hand: Card[] }) => {
      setPlayerHand(data.hand);
    };

    const handleCardPlayed = (data: any) => {
      const player = gameState?.players.find((p) => p.id === data.playerId);
      if (player) {
        showNotification(`${player.name} played ${data.card.value}`);
      }
    };

    const handleGameOver = (data: { winner: string; winnerId: string }) => {
      setWinner(data.winner);
      setShowGameOver(true);
      roomCookies.clearCurrentRoom();
    };

    const handleError = (error: { message: string; shouldReconnect?: boolean }) => {
      if (error.shouldReconnect) {
        socketService.reconnectToGame(roomId);
        return;
      }
      showNotification(error.message);
    };

    const handleShouldReconnect = (data: { roomId: string }) => {
      socketService.reconnectToGame(data.roomId);
    };

    const handleGameRestored = (data: any) => {
      setGameState(data.gameState);
      setPlayerHand(data.yourHand || []);
      showNotification(data.message || 'Reconnected successfully');
    };

    const handleReconnectionFailed = (_data: any) => {
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

    if (hasJoinedRef.current) return;
    hasJoinedRef.current = true;

    const cookie = roomCookies.getCurrentRoom();
    const hasActiveCookie = cookie && cookie.roomId === roomId;

    if (isReconnectAttempt || hasActiveCookie) {
      socketService.reconnectToGame(roomId);
      stateRequestTimeout = setTimeout(() => {
        if (!gameState) {
          socketService.socket.emit('request_game_state', { roomId });
        }
      }, 3000);
    } else {
      socketService.socket.emit('request_game_state', { roomId });
      stateRequestTimeout = setTimeout(() => {
        if (!gameState) {
          showNotification('Failed to load game');
          setTimeout(() => navigate('/lobby'), 2000);
        }
      }, 5000);
    }

    return () => {
      if (stateRequestTimeout) clearTimeout(stateRequestTimeout);
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
      hasJoinedRef.current = false;
    };
  }, [roomId, userId, navigate]);

  // [Event handlers - UNCHANGED]
  const handleReconnect = () => { };
  const handleDismissReconnect = () => {
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

  // ✅ ZONE ASSIGNMENT (unchanged)
  const topOpponent = otherPlayers.length === 1 ? otherPlayers[0] :
    otherPlayers.length >= 2 ? otherPlayers[1] : null;
  const leftOpponent = otherPlayers.length >= 2 ? otherPlayers[0] : null;
  const rightOpponent = otherPlayers.length >= 3 ? otherPlayers[2] :
    otherPlayers.length === 2 ? otherPlayers[1] : null;

  // ✅ NEW: Fixed layout with proper zone isolation
  return (
    <div className="h-screen bg-dark-900 flex flex-col overflow-hidden">
      <Navigation />

      {/* Notification */}
      {notification && (
        <div className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-50 bg-uno-blue text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg text-xs sm:text-base max-w-[90vw] sm:max-w-md text-center">
          {notification}
        </div>
      )}

      {/* Header - Fixed height */}
      <div className="shrink-0 pt-12 sm:pt-16">
        <GameHeader
          gameState={gameState}
          isMyTurn={isMyTurn}
          currentPlayerName={currentPlayer?.name}
          turnTimeRemaining={turnTimeRemaining}
        />
      </div>

      {/* ✅ ZONE-BASED LAYOUT - Flex Column with Absolute Side Zones */}
      <div className="flex-1 flex flex-col overflow-hidden relative">

        {/* ========== TOP ZONE - Fixed Height, Standard Flow ========== */}
        <div className="shrink-0 h-[60px] sm:h-[80px] md:h-[100px] flex items-center justify-center px-2 z-20 w-full">
          {topOpponent && (
            <OpponentHand
              player={topOpponent}
              isCurrentTurn={gameState.currentPlayer === topOpponent.id}
              position="top"
            />
          )}
        </div>

        {/* ========== MIDDLE ZONE (Side Opponents + Table) ========== */}
        <div className="flex-1 relative w-full isolate">

          {/* LEFT ZONE - Absolute Anchor */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 z-30 h-full flex items-center pl-1 sm:pl-2 md:pl-4 pointer-events-none">
            {/* Pointer events auto on child to allow interaction if needed, but wrapper shouldn't block table clicks */}
            <div className="pointer-events-auto">
              {leftOpponent && (
                <OpponentHand
                  player={leftOpponent}
                  isCurrentTurn={gameState.currentPlayer === leftOpponent.id}
                  position="left"
                />
              )}
            </div>
          </div>

          {/* RIGHT ZONE - Absolute Anchor */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 z-30 h-full flex items-center pr-1 sm:pr-2 md:pr-4 pointer-events-none">
            <div className="pointer-events-auto">
              {rightOpponent && (
                <OpponentHand
                  player={rightOpponent}
                  isCurrentTurn={gameState.currentPlayer === rightOpponent.id}
                  position="right"
                />
              )}
            </div>
          </div>

          {/* ✅ CENTER ZONE - TABLE ONLY (Isolated & Centered) */}
          <div className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
                  backgroundSize: '24px 24px',
                }}
              />
            </div>

            {/* Table container - Responsive Max Widths to avoid side overlaps */}
            {/* Mobile: Max width constrained to leave space for side avatars */}
            <div className="
              relative
              w-full 
              max-w-[calc(100%-6rem)] sm:max-w-[calc(100%-10rem)] md:max-w-[520px] 
              aspect-[16/10]
              rounded-[50%]
              table-felt table-border-ring
            ">
              {/* Table content - Flexbox centered */}
              <div className="absolute inset-0 flex items-center justify-center">
                <GameTable
                  gameState={gameState}
                  isMyTurn={isMyTurn}
                  onDrawCard={handleDraw}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ========== BOTTOM ZONE (Player hand) - Auto height ========== */}
        <div className="shrink-0 z-30 w-full">
          <PlayerHand
            playerName={myPlayer?.name || 'You'}
            playerHand={playerHand}
            isMyTurn={isMyTurn}
            pendingDraw={gameState.pendingDraw}
            onCardClick={handleCardClick}
            onRequestHand={requestHand}
          />
        </div>
      </div>

      {/* Turn Indicator */}
      {isMyTurn && (
        <div className="fixed top-12 sm:top-16 left-1/2 -translate-x-1/2 z-40">
          <div className="glass-panel px-4 sm:px-6 py-1.5 sm:py-2 rounded-full border-2 border-primary/50">
            <span className="font-heading text-primary font-bold text-sm sm:text-base animate-pulse">
              ⚡ Your Turn ⚡
            </span>
          </div>
        </div>
      )}

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