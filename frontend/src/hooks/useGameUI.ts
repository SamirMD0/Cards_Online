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

  const showNotification = useCallback((message: string) => {
    setNotification(message);
  }, []);

  useEffect(() => {
    if (gameState?.winner) {
      setShowGameOver(true);
    } else {
      setShowGameOver(false);
    }
  }, [gameState?.winner]);

  useEffect(() => {
    if (!notification) return;
    const timeoutId = setTimeout(() => setNotification(""), 3000);
    return () => clearTimeout(timeoutId);
  }, [notification]);

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