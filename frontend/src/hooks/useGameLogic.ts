import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { socketService } from '../socket';
import type { GameState, Card } from '../types';
import { roomCookies } from '../utils/roomCookies';

export function useGameLogic(roomId: string | undefined) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pendingCard, setPendingCard] = useState<Card | null>(null);
  const [showGameOver, setShowGameOver] = useState(false);
  const [winner, setWinner] = useState<string>('');
  const [notification, setNotification] = useState('');
  const [showReconnectModal, setShowReconnectModal] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [canReconnect, setCanReconnect] = useState(false);
  const [turnTimeRemaining, setTurnTimeRemaining] = useState<number>(30);

  // Refs
  const gameStateRef = useRef<GameState | null>(null);
  const hasJoinedRef = useRef(false);
  const hasSkippedTurnRef = useRef(false); // New ref to prevent double skipping
  
  const userId = user?.id || null;
  const isMyTurn = gameState?.currentPlayer === userId;
  const isReconnectAttempt = location.state?.reconnect === true;

  // Keep ref in sync
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Reset the skip ref whenever the turn changes
  useEffect(() => {
    hasSkippedTurnRef.current = false;
  }, [gameState?.currentPlayer]);

  const showNotification = useCallback((message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  }, []);

  const requestHand = useCallback(() => {
    socketService.socket.emit('request_hand');
  }, []);

  // --- EFFECT 1: Connection (Run Once) ---
  useEffect(() => {
    if (!roomId || !userId) {
      navigate('/lobby');
      return;
    }

    if (!socketService.socket.connected) {
      socketService.connect();
    }

    if (hasJoinedRef.current) return;
    hasJoinedRef.current = true;

    const cookie = roomCookies.getCurrentRoom();
    const hasActiveCookie = cookie && cookie.roomId === roomId;

    if (isReconnectAttempt || hasActiveCookie) {
      socketService.reconnectToGame(roomId);
    } else {
      socketService.socket.emit('request_game_state', { roomId });
    }

    const safetyTimeout = setTimeout(() => {
      if (!gameStateRef.current) {
        // Optional: Handle load failure
      }
    }, 5000);

    return () => clearTimeout(safetyTimeout);
  }, [roomId, userId, isReconnectAttempt]);

  // --- EFFECT 2: Event Listeners ---
  useEffect(() => {
    if (!roomId || !userId) return;

    const handleGameState = (state: GameState) => {
      setGameState(state);
    };

    const handleGameStarted = (state: GameState) => {
      setGameState(state);
      showNotification('Game started! 🎮');
      setTimeout(() => requestHand(), 500);
    };

    const handleHandUpdate = (data: { hand: Card[] }) => {
      setPlayerHand(data.hand);
    };

    const handleCardPlayed = (data: any) => {
      const currentPlayers = gameStateRef.current?.players || [];
      const player = currentPlayers.find((p) => p.id === data.playerId);
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
      const remaining = Math.ceil((data.duration - elapsed) / 1000);
      setTurnTimeRemaining(Math.max(0, remaining));
      // Reset local skip guard when new timer starts
      hasSkippedTurnRef.current = false;
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

    return () => {
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
    };
  }, [roomId, userId, navigate, showNotification, requestHand]);

  // --- EFFECT 3: Timer Countdown ---
  useEffect(() => {
    if (!gameState?.gameStarted) return;

    const interval = setInterval(() => {
      setTurnTimeRemaining((prevTime) => {
        if (prevTime <= 0) return 0;
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState?.gameStarted]);

  // --- EFFECT 4: Handle Timeout (Skip Player) ---
  useEffect(() => {
    // Only trigger if: Time is 0, It's My Turn, and we haven't already skipped this specific turn
    if (turnTimeRemaining === 0 && isMyTurn && !hasSkippedTurnRef.current) {
      console.log('Timer finished. Skipping turn...');
      hasSkippedTurnRef.current = true; // Lock so we don't spam the socket
      
      // EMIT THE SKIP EVENT
      // Note: Ensure your backend listens for 'skip_turn'. 
      // If your game requires drawing a card on timeout, use socketService.drawCard() instead.
      socketService.socket.emit('skip_turn', { roomId }); 
    }
  }, [turnTimeRemaining, isMyTurn, roomId]);


  const handleReconnect = () => {};

  const handleDismissReconnect = () => {
    setShowReconnectModal(false);
    setCanReconnect(false);
    setIsReconnecting(false);
    roomCookies.clearCurrentRoom();
    navigate('/lobby');
  };

  const handleCardClick = (card: Card) => {
    if (!isMyTurn) {
      showNotification("It's not your turn!");
      return;
    }
    if (gameState && gameState.pendingDraw > 0 && !['draw2', 'wild_draw4'].includes(card.value as string)) {
      showNotification(`You must draw ${gameState.pendingDraw} cards!`);
      return;
    }
    if (card.color === 'wild') {
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
    navigate('/lobby');
  };

  const handleCloseColorPicker = () => {
    setShowColorPicker(false);
    setPendingCard(null);
  };

  return {
    gameState,
    playerHand,
    showColorPicker,
    showGameOver,
    winner,
    notification,
    showReconnectModal,
    isReconnecting,
    canReconnect,
    turnTimeRemaining,
    userId,
    isMyTurn,
    handleReconnect,
    handleDismissReconnect,
    handleCardClick,
    handleColorSelect,
    handleDraw,
    handleLeaveRoom,
    requestHand,
    handleCloseColorPicker,
  };
}