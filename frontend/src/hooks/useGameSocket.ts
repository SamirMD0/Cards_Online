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

  useEffect(() => {
    if (!roomId || !userId) return;

    if (!socketService.socket.connected) {
      socketService.connect();
    }

    let stateRequestTimeout: NodeJS.Timeout | null = null;
    let hasJoined = false;

    const handleGameState = (state: GameState) => {
      onGameState(state);
      if (stateRequestTimeout) {
        clearTimeout(stateRequestTimeout);
        stateRequestTimeout = null;
      }
    };

    const handleGameStarted = (state: GameState) => {
      onGameStarted(state);
      setTimeout(() => requestHand(), 500);
    };

    const handleHandUpdate = (data: { hand: Card[] }) => {
      onHandUpdate(data.hand);
    };

    socketService.socket.on('game_state', handleGameState);
    socketService.socket.on('game_started', handleGameStarted);
    socketService.socket.on('hand_update', handleHandUpdate);
    socketService.socket.on('card_played', onCardPlayed);
    socketService.socket.on('game_over', onGameOver);
    socketService.socket.on('error', onError);
    socketService.socket.on('should_reconnect', onShouldReconnect);
    socketService.socket.on('game_restored', onGameRestored);
    socketService.socket.on('reconnection_failed', onReconnectionFailed);
    socketService.socket.on('player_reconnected', onPlayerReconnected);
    socketService.socket.on('turn_timer_started', onTurnTimerStarted);
    socketService.socket.on('turn_timeout', onTurnTimeout);
    socketService.socket.on('room_closing', onRoomClosing);

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

    return () => {
      if (stateRequestTimeout) clearTimeout(stateRequestTimeout);
      socketService.socket.off('game_state', handleGameState);
      socketService.socket.off('game_started', handleGameStarted);
      socketService.socket.off('hand_update', handleHandUpdate);
      socketService.socket.off('card_played', onCardPlayed);
      socketService.socket.off('game_over', onGameOver);
      socketService.socket.off('error', onError);
      socketService.socket.off('should_reconnect', onShouldReconnect);
      socketService.socket.off('game_restored', onGameRestored);
      socketService.socket.off('reconnection_failed', onReconnectionFailed);
      socketService.socket.off('player_reconnected', onPlayerReconnected);
      socketService.socket.off('turn_timer_started', onTurnTimerStarted);
      socketService.socket.off('turn_timeout', onTurnTimeout);
      socketService.socket.off('room_closing', onRoomClosing);
    };
  }, [
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
    requestHand,
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