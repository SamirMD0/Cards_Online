import { useState, useEffect, useRef, useCallback } from 'react';
import { socketService } from '../socket';

export function useGameTimer(gameStarted: boolean, isMyTurn: boolean, roomId: string | undefined) {
  const [turnTimeRemaining, setTurnTimeRemaining] = useState(30);
  const turnTimeRemainingRef = useRef(30);
  const hasSkippedTurnRef = useRef(false);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const lastDisplayUpdateRef = useRef(0);

  const handleTimerStarted = useCallback((data: { duration: number; startTime: number }) => {
    const elapsed = Date.now() - data.startTime;
    const remaining = Math.ceil((data.duration - elapsed) / 1000);
    const clamped = Math.max(0, remaining);
    turnTimeRemainingRef.current = clamped;
    setTurnTimeRemaining(clamped);
    hasSkippedTurnRef.current = false;
    lastDisplayUpdateRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (!gameStarted || !isMyTurn) {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
      return;
    }

    intervalIdRef.current = setInterval(() => {
      const next = Math.max(0, turnTimeRemainingRef.current - 1);
      turnTimeRemainingRef.current = next;
      const now = Date.now();
      if (now - lastDisplayUpdateRef.current >= 1000) {
        setTurnTimeRemaining(next);
        lastDisplayUpdateRef.current = now;
      }
    }, 1000);

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [gameStarted, isMyTurn]);

  useEffect(() => {
    const checkTimeout = setInterval(() => {
      if (turnTimeRemainingRef.current === 0 && isMyTurn && !hasSkippedTurnRef.current && roomId) {
        hasSkippedTurnRef.current = true;
        socketService.socket.emit("skip_turn", { roomId });
      }
    }, 100);

    return () => clearInterval(checkTimeout);
  }, [isMyTurn, roomId]);

  return { turnTimeRemaining, handleTimerStarted };
}