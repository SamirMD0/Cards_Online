// frontend/src/pages/Game.tsx
// ✅ MODERNIZED: Sleek, contemporary design with glassmorphism and responsive layout

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
  const [turnTimeRemaining, setTurnTimeRemaining] = useState<number>(30);

  const userId = user?.id || null;
  const isMyTurn = gameState?.currentPlayer === userId;
  const hasJoinedRef = useRef(false);
  const isReconnectAttempt = location.state?.reconnect === true;

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 3000);
  };

  const requestHand = () => {
    socketService.socket.emit("request_hand");
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

    const handleError = (error: {
      message: string;
      shouldReconnect?: boolean;
    }) => {
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
      showNotification(data.message || "Reconnected successfully");
    };

    const handleReconnectionFailed = (_data: any) => {
      showNotification("Reconnection failed. Returning to lobby...");
      roomCookies.clearCurrentRoom();
      setTimeout(() => navigate("/lobby"), 2000);
    };

    const handlePlayerReconnected = (data: any) => {
      showNotification(`${data.playerName} reconnected`);
    };

    const handleTurnTimerStarted = (data: {
      duration: number;
      startTime: number;
    }) => {
      const elapsed = Date.now() - data.startTime;
      const remaining = Math.ceil((data.duration - elapsed) / 1000);
      setTurnTimeRemaining(Math.max(0, remaining));
    };

    const handleTurnTimeout = (data: {
      playerId: string;
      playerName: string;
    }) => {
      showNotification(`⏱️ ${data.playerName}'s turn timed out!`);
    };

    const handleRoomClosing = (data: { message: string }) => {
      showNotification(data.message);
      roomCookies.clearCurrentRoom();
      setTimeout(() => navigate("/lobby"), 3000);
    };

    socketService.socket.on("game_state", handleGameState);
    socketService.socket.on("game_started", handleGameStarted);
    socketService.socket.on("hand_update", handleHandUpdate);
    socketService.socket.on("card_played", handleCardPlayed);
    socketService.socket.on("game_over", handleGameOver);
    socketService.socket.on("error", handleError);
    socketService.socket.on("should_reconnect", handleShouldReconnect);
    socketService.socket.on("game_restored", handleGameRestored);
    socketService.socket.on("reconnection_failed", handleReconnectionFailed);
    socketService.socket.on("player_reconnected", handlePlayerReconnected);
    socketService.socket.on("turn_timer_started", handleTurnTimerStarted);
    socketService.socket.on("turn_timeout", handleTurnTimeout);
    socketService.socket.on("room_closing", handleRoomClosing);

    if (hasJoinedRef.current) return;
    hasJoinedRef.current = true;

    const cookie = roomCookies.getCurrentRoom();
    const hasActiveCookie = cookie && cookie.roomId === roomId;

    if (isReconnectAttempt || hasActiveCookie) {
      socketService.reconnectToGame(roomId);
      stateRequestTimeout = setTimeout(() => {
        if (!gameState) {
          socketService.socket.emit("request_game_state", { roomId });
        }
      }, 3000);
    } else {
      socketService.socket.emit("request_game_state", { roomId });
      stateRequestTimeout = setTimeout(() => {
        if (!gameState) {
          showNotification("Failed to load game");
          setTimeout(() => navigate("/lobby"), 2000);
        }
      }, 5000);
    }

    return () => {
      if (stateRequestTimeout) clearTimeout(stateRequestTimeout);
      socketService.socket.off("game_state", handleGameState);
      socketService.socket.off("game_started", handleGameStarted);
      socketService.socket.off("hand_update", handleHandUpdate);
      socketService.socket.off("card_played", handleCardPlayed);
      socketService.socket.off("game_over", handleGameOver);
      socketService.socket.off("error", handleError);
      socketService.socket.off("should_reconnect", handleShouldReconnect);
      socketService.socket.off("game_restored", handleGameRestored);
      socketService.socket.off("reconnection_failed", handleReconnectionFailed);
      socketService.socket.off("player_reconnected", handlePlayerReconnected);
      socketService.socket.off("turn_timer_started", handleTurnTimerStarted);
      socketService.socket.off("turn_timeout", handleTurnTimeout);
      socketService.socket.off("room_closing", handleRoomClosing);
      hasJoinedRef.current = false;
    };
  }, [roomId, userId, navigate]);

  useEffect(() => {
    if (!isMyTurn || !gameState?.gameStarted) {
      return;
    }

    // Initialize countdown
    let timeLeft = turnTimeRemaining;

    // Update immediately
    setTurnTimeRemaining(timeLeft);

    // Start countdown
    const interval = setInterval(() => {
      timeLeft = Math.max(0, timeLeft - 1);
      setTurnTimeRemaining(timeLeft);
    }, 1000);

    return () => clearInterval(interval);
  }, [isMyTurn, gameState?.currentPlayer]); // Re-run when turn changes

  // [Event handlers - UNCHANGED]
  const handleReconnect = () => {};
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
    if (
      gameState &&
      gameState.pendingDraw > 0 &&
      !["draw2", "wild_draw4"].includes(card.value as string)
    ) {
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

  // Modern loading screen
  if (showReconnectModal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 animate-spin">
              
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl">🎮</span>
            </div>
          </div>
          <p className="text-xl text-gray-300 font-light mb-2 animate-pulse">
            Loading game
          </p>
          <p className="text-sm text-gray-500">Room: {roomId}</p>
        </div>
      </div>
    );
  }

  const currentPlayer = gameState.players.find(
    (p) => p.id === gameState.currentPlayer
  );
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

  const topOpponent =
    otherPlayers.length === 1
      ? otherPlayers[0]
      : otherPlayers.length >= 2
      ? otherPlayers[1]
      : null;
  const leftOpponent = otherPlayers.length >= 2 ? otherPlayers[0] : null;
  const rightOpponent =
    otherPlayers.length >= 3
      ? otherPlayers[2]
      : otherPlayers.length === 2
      ? otherPlayers[1]
      : null;

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col overflow-hidden">
      <Navigation />

      {/* Modern Notification */}
      {notification && (
        <div className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium max-w-[90vw] sm:max-w-md text-center backdrop-blur-md bg-gradient-to-r from-blue-600/90 to-purple-600/90 border border-white/10 animate-fade-in-down">
          <div className="flex items-center justify-center gap-2 text-white">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
            {notification}
          </div>
        </div>
      )}

      {/* Modern Header */}
      <div className="hidden sm:block shrink-0 pt-16">
        <GameHeader
          gameState={gameState}
          isMyTurn={isMyTurn}
          currentPlayerName={currentPlayer?.name}
          turnTimeRemaining={turnTimeRemaining}
        />
      </div>

      {/* Modern Game Layout */}
      <div className="flex-1 flex flex-col overflow-hidden relative pt-16 sm:pt-0">
        {/* Top Zone - Modern Design */}
        <div className="shrink-0 h-[80px] sm:h-[100px] flex items-center justify-center px-2 z-20 w-full relative">
          {topOpponent && (
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
              <div className="relative">
                <OpponentHand
                  player={topOpponent}
                  isCurrentTurn={gameState.currentPlayer === topOpponent.id}
                  position="top"
                />
              </div>
            </div>
          )}
        </div>

        {/* Middle Zone - Modern Glass Design */}
        <div className="flex-1 relative w-full">
          {/* Left Zone */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 z-30 h-full flex items-center pl-1 sm:pl-2 md:pl-4 pointer-events-none">
            <div className="pointer-events-auto relative group">
              <div className="absolute -inset-2 bg-gradient-to-b from-green-500/20 to-teal-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative">
                {leftOpponent && (
                  <OpponentHand
                    player={leftOpponent}
                    isCurrentTurn={gameState.currentPlayer === leftOpponent.id}
                    position="left"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Right Zone */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 z-30 h-full flex items-center pr-1 sm:pr-2 md:pr-4 pointer-events-none">
            <div className="pointer-events-auto relative group">
              <div className="absolute -inset-2 bg-gradient-to-b from-red-500/20 to-pink-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative">
                {rightOpponent && (
                  <OpponentHand
                    player={rightOpponent}
                    isCurrentTurn={gameState.currentPlayer === rightOpponent.id}
                    position="right"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Center Table - Modern Glass Design */}
          <div className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden">
            {/* Animated background gradient */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20 animate-gradient-shift"></div>
            </div>

            {/* Floating grid pattern */}
            <div
              className="absolute inset-0 opacity-[0.02] pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #ffffff 1px, transparent 1px),
                  linear-gradient(to bottom, #ffffff 1px, transparent 1px)
                `,
                backgroundSize: "30px 30px",
              }}
            />

            {/* Modern Table Container */}
            <div
              className="
              relative
              w-full 
              max-w-[calc(100%-4rem)] sm:max-w-[calc(100%-8rem)] md:max-w-[500px] 
              aspect-[16/10]
              rounded-3xl
              backdrop-blur-xl
              bg-gradient-to-br from-gray-800/40 to-gray-900/60
              border border-white/10
              shadow-2xl
              overflow-hidden
              before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:to-transparent before:via-transparent
            "
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 blur-xl"></div>

              {/* Inner border */}
              <div className="absolute inset-4 rounded-2xl border border-white/5"></div>

              <div className="absolute inset-0 flex items-center justify-center p-4">
                <GameTable
                  gameState={gameState}
                  isMyTurn={isMyTurn}
                  onDrawCard={handleDraw}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Zone - Modern Player Area */}
        <div className="shrink-0 z-30 w-full px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="relative group">
            {/* Glow effect for player area */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-50 transition duration-500"></div>

            {/* Glass panel background */}
            <div className="relative backdrop-blur-xl bg-gradient-to-b from-gray-800/80 to-gray-900/90 border-t border-white/10 rounded-t-3xl shadow-2xl overflow-hidden">
              {/* Shine effect */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

              <PlayerHand
                playerName={myPlayer?.name || "You"}
                playerHand={playerHand}
                isMyTurn={isMyTurn}
                pendingDraw={gameState.pendingDraw}
                onCardClick={handleCardClick}
                onRequestHand={requestHand}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Turn Timer - Modern Design */}
      {isMyTurn && (
        <div className="sm:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-40">
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full blur opacity-60 animate-pulse"></div>
            <div className="relative backdrop-blur-lg bg-gradient-to-r from-yellow-600/90 to-orange-600/90 border border-yellow-400/30 px-6 py-3 rounded-full shadow-xl">
              <div className="flex items-center gap-3 text-white font-bold">
                <div className="w-3 h-3 rounded-full bg-white animate-ping"></div>
                <span className="text-sm">YOUR TURN</span>
                <span className="text-lg font-mono">
                  ⏱ {turnTimeRemaining}s
                </span>
              </div>
            </div>
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

      {/* Decorative floating elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-cyan-500/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-gradient-to-r from-purple-500/10 to-transparent rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
