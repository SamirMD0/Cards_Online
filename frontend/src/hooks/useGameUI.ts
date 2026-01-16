import { useState, useCallback, useEffect, useRef } from "react";
import { socketService } from "../socket";
import type { Card, GameState } from "../types";

export function useGameUI(gameState: GameState | null) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pendingCard, setPendingCard] = useState<Card | null>(null);
  const [showGameOver, setShowGameOver] = useState(false);
  const [notification, setNotification] = useState("");
  const [showReconnectModal, setShowReconnectModal] = useState(false);

  // ✅ CRITICAL FIX: Use ref to access latest gameState without triggering re-renders
  const gameStateRef = useRef(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // --- Notification Logic ---
  const showNotification = useCallback((message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 3000);
  }, []);

  // --- Socket Listeners for UI Events ---
  useEffect(() => {
    const handleGameStarted = () => showNotification('Game started! 🎮');

    // ✅ CRITICAL FIX: Use gameStateRef to access current state, not stale closure
    const handleCardPlayed = (data: any) => {
      const currentPlayers = gameStateRef.current?.players || [];
      const player = currentPlayers.find((p) => p.id === data.playerId);
      if (player) showNotification(`${player.name} played ${data.card.value}`);
    };

    const handlePlayerReconnected = (data: any) => showNotification(`${data.playerName} reconnected`);
    const handleTurnTimeout = (data: { playerName: string }) => showNotification(`⏱️ ${data.playerName}'s turn timed out!`);
    const handleError = (error: { message: string }) => showNotification(error.message);

    socketService.socket.on('game_started', handleGameStarted);
    socketService.socket.on('card_played', handleCardPlayed);
    socketService.socket.on('player_reconnected', handlePlayerReconnected);
    socketService.socket.on('turn_timeout', handleTurnTimeout);
    socketService.socket.on('error', handleError);

    return () => {
      socketService.socket.off('game_started', handleGameStarted);
      socketService.socket.off('card_played', handleCardPlayed);
      socketService.socket.off('player_reconnected', handlePlayerReconnected);
      socketService.socket.off('turn_timeout', handleTurnTimeout);
      socketService.socket.off('error', handleError);
    };
  }, [showNotification]); // ✅ FIXED: Only depend on showNotification, not gameState.players

  // --- Modal Logic (FIXED) ---
  useEffect(() => {
    // OLD ERROR: if (gameState?.status === 'ended') ...
    // NEW FIX: Check if a winner is declared
    if (gameState?.winner) {
      setShowGameOver(true);
    }
  }, [gameState?.winner]);

  const handleCloseColorPicker = () => {
    setShowColorPicker(false);
    setPendingCard(null);
  };

  const handleColorSelect = (color: string) => {
    if (pendingCard) {
      socketService.playCard(pendingCard.id, color);
    }
    handleCloseColorPicker();
  };

  const openColorPicker = (card: Card) => {
    setPendingCard(card);
    setShowColorPicker(true);
  };

  const handleDismissReconnect = useCallback(() => {
    setShowReconnectModal(false);
  }, []);

  return {
    showColorPicker,
    showGameOver,
    showReconnectModal,
    notification,
    handleCloseColorPicker,
    handleColorSelect,
    openColorPicker,
    setShowReconnectModal,
    showNotification,
    handleDismissReconnect
  };
}