import { useState, useEffect, useRef } from 'react';
import { socketService } from '../socket';

export function useGameTimer(gameStarted: boolean, isMyTurn: boolean, roomId: string | undefined) {
  const [turnTimeRemaining, setTurnTimeRemaining] = useState(30);
  const hasSkippedTurnRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);

  // Sync with server timer events
  useEffect(() => {
    const handleTurnTimerStarted = (data: { duration: number; startTime: number }) => {
      const elapsed = Date.now() - data.startTime;
      const remaining = Math.ceil((data.duration - elapsed) / 1000);
      setTurnTimeRemaining(Math.max(0, remaining));
      hasSkippedTurnRef.current = false;
    };

    socketService.socket.on('turn_timer_started', handleTurnTimerStarted);
    return () => {
      socketService.socket.off('turn_timer_started', handleTurnTimerStarted);
    };
  }, []);

  // ✅ CRITICAL FIX: Use requestAnimationFrame instead of setInterval for smoother updates
  useEffect(() => {
    if (!gameStarted || !isMyTurn) {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      return;
    }

    let lastUpdate = Date.now();

    const tick = () => {
      const now = Date.now();
      const elapsed = now - lastUpdate;

      // Only update every second to prevent unnecessary re-renders
      if (elapsed >= 1000) {
        setTurnTimeRemaining((prev) => {
          const next = Math.max(0, prev - 1);
          // ✅ OPTIMIZATION: Only update if value actually changed
          return next !== prev ? next : prev;
        });
        lastUpdate = now;
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [gameStarted, isMyTurn]);

  // Handle Timeout (Auto-skip)
  useEffect(() => {
    if (turnTimeRemaining === 0 && isMyTurn && !hasSkippedTurnRef.current && roomId) {
      console.log("Timer finished. Skipping turn...");
      hasSkippedTurnRef.current = true;
      socketService.socket.emit("skip_turn", { roomId });
    }
  }, [turnTimeRemaining, isMyTurn, roomId]);

  return { turnTimeRemaining };
}