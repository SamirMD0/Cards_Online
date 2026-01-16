import { useEffect, useCallback } from 'react';
import { socketService } from '../socket';
import type { GameState, Card } from '../types';

interface UseGameSocketProps {
  roomId: string | undefined;
  userId: string | null;
  isReconnectAttempt: boolean;
  onGameState: (state: GameState) => void;
  onGameStarted: (state: GameState) => void;
  onHandUpdate: (hand: Card[]) => void;
  onCardPlayed: (data: any) => void;
  onGameOver: (data: { winner: string; winnerId: string }) => void;
  onError: (error: { message: string; shouldReconnect?: boolean }) => void;
  onShouldReconnect: (data: { roomId: string }) => void;
  onGameRestored: (data: any) => void;
  onReconnectionFailed: (data: any) => void;
  onPlayerReconnected: (data: any) => void;
  onTurnTimerStarted: (data: { duration: number; startTime: number }) => void;
  onTurnTimeout: (data: { playerId: string; playerName: string }) => void;
  onRoomClosing: (data: { message: string }) => void;
}

export function useGameSocket({
  roomId,
  userId,
  isReconnectAttempt,
  onGameState,
  onGameStarted,
  onHandUpdate,
  onCardPlayed,
  onGameOver,
  onError,
  onShouldReconnect,
  onGameRestored,
  onReconnectionFailed,
  onPlayerReconnected,
  onTurnTimerStarted,
  onTurnTimeout,
  onRoomClosing,
}: UseGameSocketProps) {
  const requestHand = useCallback(() => {
    socketService.socket.emit('request_hand');
  }, []);

  const playCard = useCallback((cardId: string, chosenColor?: string) => {
    socketService.playCard(cardId, chosenColor);
  }, []);

  const drawCard = useCallback(() => {
    socketService.drawCard();
  }, []);

  const addBot = useCallback(() => {
    socketService.addBot();
  }, []);

  const startGame = useCallback(() => {
    socketService.startGame();
  }, []);

  const leaveRoom = useCallback(() => {
    socketService.leaveRoom();
  }, []);

  // ✅ CRITICAL FIX: Stabilize callbacks with useCallback to prevent listener churn
  const handleGameState = useCallback((state: GameState) => {
    onGameState(state);
  }, [onGameState]);

  const handleGameStarted = useCallback((state: GameState) => {
    onGameStarted(state);
    setTimeout(() => requestHand(), 500);
  }, [onGameStarted, requestHand]);

  const handleHandUpdate = useCallback((data: { hand: Card[] }) => {
    onHandUpdate(data.hand);
  }, [onHandUpdate]);

  const handleCardPlayed = useCallback((data: any) => {
    onCardPlayed(data);
  }, [onCardPlayed]);

  const handleGameOver = useCallback((data: { winner: string; winnerId: string }) => {
    onGameOver(data);
  }, [onGameOver]);

  const handleError = useCallback((error: { message: string; shouldReconnect?: boolean }) => {
    onError(error);
  }, [onError]);

  const handleShouldReconnect = useCallback((data: { roomId: string }) => {
    onShouldReconnect(data);
  }, [onShouldReconnect]);

  const handleGameRestored = useCallback((data: any) => {
    onGameRestored(data);
  }, [onGameRestored]);

  const handleReconnectionFailed = useCallback((data: any) => {
    onReconnectionFailed(data);
  }, [onReconnectionFailed]);

  const handlePlayerReconnected = useCallback((data: any) => {
    onPlayerReconnected(data);
  }, [onPlayerReconnected]);

  const handleTurnTimerStarted = useCallback((data: { duration: number; startTime: number }) => {
    onTurnTimerStarted(data);
  }, [onTurnTimerStarted]);

  const handleTurnTimeout = useCallback((data: { playerId: string; playerName: string }) => {
    onTurnTimeout(data);
  }, [onTurnTimeout]);

  const handleRoomClosing = useCallback((data: { message: string }) => {
    onRoomClosing(data);
  }, [onRoomClosing]);

  useEffect(() => {
    if (!roomId || !userId) return;

    if (!socketService.socket.connected) {
      socketService.connect();
    }

    let stateRequestTimeout: NodeJS.Timeout | null = null;
    let hasJoined = false;

    // ✅ Register listeners with stable callback references
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

    if (!hasJoined) {
      hasJoined = true;

      if (isReconnectAttempt) {
        socketService.reconnectToGame(roomId);
        stateRequestTimeout = setTimeout(() => {
          socketService.socket.emit('request_game_state', { roomId });
        }, 3000);
      } else {
        socketService.socket.emit('request_game_state', { roomId });
        stateRequestTimeout = setTimeout(() => {
          socketService.socket.emit('request_game_state', { roomId });
        }, 5000);
      }
    }

    // ✅ CRITICAL FIX: Ensure all listeners are removed and timeout is cleared
    return () => {
      if (stateRequestTimeout) {
        clearTimeout(stateRequestTimeout);
        stateRequestTimeout = null;
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
    };
  }, [
    roomId,
    userId,
    isReconnectAttempt,
    handleGameState,
    handleGameStarted,
    handleHandUpdate,
    handleCardPlayed,
    handleGameOver,
    handleError,
    handleShouldReconnect,
    handleGameRestored,
    handleReconnectionFailed,
    handlePlayerReconnected,
    handleTurnTimerStarted,
    handleTurnTimeout,
    handleRoomClosing,
  ]);

  return {
    requestHand,
    playCard,
    drawCard,
    addBot,
    startGame,
    leaveRoom,
  };
}