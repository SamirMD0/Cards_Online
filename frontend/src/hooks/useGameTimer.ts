import { useState, useEffect, useRef, useCallback } from 'react';
import { socketService } from '../socket';

export function useGameTimer(gameStarted: boolean, isMyTurn: boolean, roomId: string | undefined) {
  const [turnTimeRemaining, setTurnTimeRemaining] = useState(30);
  const turnTimeRemainingRef = useRef(30);
  const hasSkippedTurnRef = useRef(false);
  const endTimeRef = useRef<number | null>(null);

  const handleTimerStarted = useCallback((data: { duration: number; startTime: number }) => {
    // FIX: If duration is 30 (seconds), convert to 30000 (ms)
    // If duration is already 30000, keep it.
    const durationMs = data.duration < 1000 ? data.duration * 1000 : data.duration;

    // ✅ FIX: Use client-side time to avoid clock skew (server vs client time diff)
    // We trust that the event just arrived, so the turn starts NOW for this client.
    endTimeRef.current = Date.now() + durationMs;
    hasSkippedTurnRef.current = false;

    const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
    turnTimeRemainingRef.current = remaining;
    setTurnTimeRemaining(remaining);
  }, []);

  useEffect(() => {
    if (!gameStarted || !endTimeRef.current) return;

    const intervalId = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((endTimeRef.current! - now) / 1000));

      if (remaining !== turnTimeRemainingRef.current) {
        turnTimeRemainingRef.current = remaining;
        setTurnTimeRemaining(remaining);
      }

      // Auto-skip logic for current player
      if (remaining === 0 && isMyTurn && !hasSkippedTurnRef.current && roomId) {
        hasSkippedTurnRef.current = true;
        socketService.socket.emit("skip_turn", { roomId });
      }
    }, 200); // Check every 200ms for smoothness, but only updates state every 1s

    return () => clearInterval(intervalId);
  }, [gameStarted, isMyTurn, roomId]);

  return { turnTimeRemaining, handleTimerStarted };
}