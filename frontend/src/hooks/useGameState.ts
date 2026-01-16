import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { socketService } from "../socket";
import type { GameState, Card, Player } from "../types";
import { roomCookies } from "../utils/roomCookies";

interface UseGameStateCallbacks {
  onNotification?: (message: string) => void;
  onTurnTimerStarted?: (data: { duration: number; startTime: number }) => void;
}

export type TurnTimerHandler = (data: { duration: number; startTime: number }) => void;

export function useGameState(roomId: string | undefined, callbacks?: UseGameStateCallbacks) {
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
  const callbacksRef = useRef(callbacks);
  
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  useEffect(() => {
    if (!roomId) return;

    const handleGameState = (state: GameState) => {
      setGameState(state);
      setError(null);
    };

    const handleGameStarted = (state: GameState) => {
      setGameState(state);
      callbacksRef.current?.onNotification?.('Game started! 🎮');
    };

    const handleHandUpdate = (data: { hand: Card[] }) => {
      console.log('[HandUpdate] Received hand with', data.hand.length, 'cards:', data.hand.map(c => `${c.color} ${c.value}`).join(', '));
      if (data.hand && Array.isArray(data.hand) && data.hand.length > 0) {
        setPlayerHand([...data.hand]);
      } else {
        console.warn('[HandUpdate] Received invalid hand data:', data);
      }
    };

    const handleCardPlayed = (data: any) => {
      const currentPlayers = gameStateRef.current?.players || [];
      const player = currentPlayers.find((p) => p.id === data.playerId);
      if (player) {
        callbacksRef.current?.onNotification?.(`${player.name} played ${data.card.value}`);
      }
    };

    const handleGameRestored = (data: any) => {
      setGameState(data.gameState);
      setPlayerHand(data.yourHand || []);
      setIsReconnecting(false);
      setError(null);
      callbacksRef.current?.onNotification?.(data.message || 'Reconnected successfully');
    };

    const handleGameOver = (data: { winner: string; winnerId: string }) => {
      console.log('[GameOver] Received:', data);
      
      // Always set winner - prioritize event data (most reliable)
      if (data.winner && data.winnerId) {
        // Try to find player from current game state first (for full player data)
        const winningPlayer = gameStateRef.current?.players?.find(p => p.id === data.winnerId);
        
        if (winningPlayer) {
          setWinner(winningPlayer);
        } else {
          // Fallback: create player object from event data (always works)
          console.log('[GameOver] Creating fallback winner object for:', data.winner);
          setWinner({
            id: data.winnerId,
            name: data.winner,
            hand: [],
            handCount: 0,
            isBot: true
          });
        }
      } else {
        // Emergency fallback if event data is malformed
        console.error('[GameOver] Invalid event data:', data);
        setWinner({
          id: data.winnerId || 'unknown',
          name: data.winner || 'Unknown Player',
          hand: [],
          handCount: 0,
          isBot: true
        });
      }
      
      // Update game state to mark winner (safe functional update)
      setGameState((prevState) => {
        if (!prevState) {
          console.warn('[GameOver] No game state to update');
          return null;
        }
        return {
          ...prevState,
          winner: data.winnerId
        };
      });
    };

    const handleShouldReconnect = () => setCanReconnect(true);

    const handleReconnectionFailed = () => {
      callbacksRef.current?.onNotification?.('Reconnection failed. Returning to lobby...');
      roomCookies.clearCurrentRoom();
      setTimeout(() => navigate('/lobby'), 2000);
    };

    const handlePlayerReconnected = (data: any) => {
      callbacksRef.current?.onNotification?.(`${data.playerName} reconnected`);
    };

    const handleTurnTimeout = (data: { playerId: string; playerName: string }) => {
      callbacksRef.current?.onNotification?.(`⏱️ ${data.playerName}'s turn timed out!`);
    };

    const handleTurnTimerStarted = (data: { duration: number; startTime: number }) => {
      callbacksRef.current?.onTurnTimerStarted?.(data);
    };

    const handleRoomClosing = (data: { message: string }) => {
      callbacksRef.current?.onNotification?.(data.message);
      roomCookies.clearCurrentRoom();
      setTimeout(() => navigate('/lobby'), 3000);
    };

    const onError = (err: { message: string; shouldReconnect?: boolean }) => {
      if (err.shouldReconnect) {
        socketService.reconnectToGame(roomId);
        return;
      }
      setError(err.message);
      callbacksRef.current?.onNotification?.(err.message);
      if (err.message.toLowerCase().includes("not found")) {
        setTimeout(() => navigate("/lobby"), 3000);
      }
    };

    socketService.socket.on('game_state', handleGameState);
    socketService.socket.on('game_started', handleGameStarted);
    socketService.socket.on('hand_update', handleHandUpdate);
    socketService.socket.on('card_played', handleCardPlayed);
    socketService.socket.on('game_restored', handleGameRestored);
    socketService.socket.on('game_over', handleGameOver);
    socketService.socket.on('should_reconnect', handleShouldReconnect);
    socketService.socket.on('reconnection_failed', handleReconnectionFailed);
    socketService.socket.on('player_reconnected', handlePlayerReconnected);
    socketService.socket.on('turn_timer_started', handleTurnTimerStarted);
    socketService.socket.on('turn_timeout', handleTurnTimeout);
    socketService.socket.on('room_closing', handleRoomClosing);
    socketService.socket.on('error', onError);

    return () => {
      socketService.socket.off('game_state', handleGameState);
      socketService.socket.off('game_started', handleGameStarted);
      socketService.socket.off('hand_update', handleHandUpdate);
      socketService.socket.off('card_played', handleCardPlayed);
      socketService.socket.off('game_restored', handleGameRestored);
      socketService.socket.off('game_over', handleGameOver);
      socketService.socket.off('should_reconnect', handleShouldReconnect);
      socketService.socket.off('reconnection_failed', handleReconnectionFailed);
      socketService.socket.off('player_reconnected', handlePlayerReconnected);
      socketService.socket.off('turn_timer_started', handleTurnTimerStarted);
      socketService.socket.off('turn_timeout', handleTurnTimeout);
      socketService.socket.off('room_closing', handleRoomClosing);
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