import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { socketService } from "../socket";
import type { GameState, Card, Player } from "../types";
import { roomCookies } from "../utils/roomCookies";

export function useGameState(roomId: string | undefined) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [winner, setWinner] = useState<Player | null>(null);
  const [canReconnect, setCanReconnect] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gameStateRef = useRef<GameState | null>(null);
  const hasRequestedState = useRef(false);

  // Sync ref for access inside listeners
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  // --- LISTENERS (Set these up FIRST) ---
  useEffect(() => {
    if (!roomId) return;

    const handleGameState = (state: GameState) => {
      console.log("📥 Received Game State:", state);
      setGameState(state);
      setError(null);
    };

    const handleHandUpdate = (data: { hand: Card[] }) => {
      setPlayerHand(data.hand);
    };

    const handleGameRestored = (data: any) => {
      console.log("📥 Game Restored:", data);
      setGameState(data.gameState);
      setPlayerHand(data.yourHand || []);
      setIsReconnecting(false);
      setError(null);
    };

    const handleGameOver = (data: { winnerId: string }) => {
      const winningPlayer = gameStateRef.current?.players.find(p => p.id === data.winnerId);
      setWinner(winningPlayer || null);
    };

    const onShouldReconnect = () => setCanReconnect(true);

    const onError = (err: { message: string }) => {
      console.error("❌ Socket Error:", err.message);
      setError(err.message);
      // If the room doesn't exist, go back to lobby
      if (err.message.toLowerCase().includes("not found")) {
        setTimeout(() => navigate("/lobby"), 3000);
      }
    };

    socketService.socket.on('game_state', handleGameState);
    socketService.socket.on('hand_update', handleHandUpdate);
    socketService.socket.on('game_restored', handleGameRestored);
    socketService.socket.on('game_over', handleGameOver);
    socketService.socket.on('should_reconnect', onShouldReconnect);
    socketService.socket.on('error', onError);

    return () => {
      socketService.socket.off('game_state', handleGameState);
      socketService.socket.off('hand_update', handleHandUpdate);
      socketService.socket.off('game_restored', handleGameRestored);
      socketService.socket.off('game_over', handleGameOver);
      socketService.socket.off('should_reconnect', onShouldReconnect);
      socketService.socket.off('error', onError);
    };
  }, [roomId, navigate]);

  // --- INITIALIZATION TRIGGER ---
  useEffect(() => {
    if (!roomId || hasRequestedState.current) return;

    const initialize = () => {
      const isReconnectAttempt = location.state?.reconnect === true;
      const cookie = roomCookies.getCurrentRoom();

      if (isReconnectAttempt || (cookie && cookie.roomId === roomId)) {
        console.log("📤 Emitting reconnect_to_game");
        socketService.reconnectToGame(roomId);
      } else {
        console.log("📤 Emitting request_game_state");
        socketService.socket.emit("request_game_state", { roomId });
      }
      hasRequestedState.current = true;
    };

    // Ensure socket is connected before emitting
    if (socketService.socket.connected) {
      initialize();
    } else {
      socketService.socket.once('connect', initialize);
      socketService.connect();
    }
  }, [roomId, location.state]);

  const handleReconnect = useCallback(() => {
    if (!roomId) return;
    setIsReconnecting(true);
    socketService.reconnectToGame(roomId);
  }, [roomId]);

  const handleDraw = useCallback(() => {
    socketService.drawCard();
  }, []);

  const handleLeaveRoom = useCallback(() => {
    roomCookies.clearCurrentRoom();
    socketService.leaveRoom();
    navigate("/lobby");
  }, [navigate]);

  return {
    gameState,
    playerHand,
    winner,
    userId: user?.id || socketService.socket.id || "",
    isMyTurn: gameState?.currentPlayer === (user?.id || socketService.socket.id),
    canReconnect,
    isReconnecting,
    error, // New: Pass error to UI
    handleReconnect,
    handleDraw,
    handleLeaveRoom,
    requestHand: () => socketService.socket.emit("request_hand"),
    handleDismissReconnect: () => setCanReconnect(false)
  };
}