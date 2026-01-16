import { useState, useEffect, useRef } from 'react';
import { socketService } from '../socket';

export function useGameTimer(gameStarted: boolean, isMyTurn: boolean, roomId: string | undefined) {
  const [turnTimeRemaining, setTurnTimeRemaining] = useState(30);
  const hasSkippedTurnRef = useRef(false);

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

  // Local Countdown
  useEffect(() => {
    if (!gameStarted || !isMyTurn) return;

    const interval = setInterval(() => {
      setTurnTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
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