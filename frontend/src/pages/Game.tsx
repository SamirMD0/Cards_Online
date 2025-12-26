// frontend/src/pages/Game.tsx - COMPLETE & FIXED
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navigation from "../components/Navigation";
import GameDebugPanel from "../components/game/GameDebugPanel";
import GameHeader from "../components/game/GameHeader";
import GameTable from "../components/game/GameTable";
import PlayerHand from "../components/game/PlayerHand";
import OpponentHand from "../components/game/OpponentHand";
import ColorPickerModal from "../components/game/ColorPickerModal";
import GameOverModal from "../components/game/GameOverModal";
import WaitingRoom from "../components/game/WaitingRoom";
import { socketService } from "../socket";
import type { GameState, Card } from "../types";
import ReconnectionModal from '../components/ReconnectionModal';

export default function Game() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth(); // ✅ Get authenticated user

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pendingCard, setPendingCard] = useState<Card | null>(null);
  const [showGameOver, setShowGameOver] = useState(false);
  const [winner, setWinner] = useState<string>("");
  const [notification, setNotification] = useState("");

   const [showReconnectModal, setShowReconnectModal] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [canReconnect, setCanReconnect] = useState(false);
  const [reconnectRoomId, setReconnectRoomId] = useState<string | null>(null);



  // ✅ CRITICAL FIX: Use userId for turn validation
  const userId = user?.id || null;
  const isMyTurn = gameState?.currentPlayer === userId; // ✅ Compare userId to userId!

  // Manual hand request for debugging
  const requestHand = () => {
    console.log('[Game] 🔄 Requesting hand...');
    console.log('[Game] User ID:', userId);
    console.log('[Game] Socket ID:', socketService.socket.id);
    socketService.socket.emit('request_hand');
  };

  useEffect(() => {
    if (!roomId) {
      navigate("/lobby");
      return;
    }

    console.log('[Game] 🎬 Initializing game');
    console.log('[Game] User ID:', userId);
    console.log('[Game] Socket ID:', socketService.socket.id);

    // Socket event handlers
    const handleGameState = (state: GameState) => {
      console.log('[Game] 📊 Game state received');
      setGameState(state);
    };

    const handleGameStarted = (state: GameState) => {
      console.log('[Game] 🎮 Game started');
      console.log('[Game] Current player:', state.currentPlayer);
      console.log('[Game] My userId:', userId);
      setGameState(state);
      showNotification("Game started! 🎮");
      
      // Auto-request hand after game starts
      setTimeout(() => {
        console.log('[Game] ⏰ Auto-requesting hand...');
        requestHand();
      }, 500);
    };

    const handleHandUpdate = (data: { hand: Card[] }) => {
      console.log('[Game] ✅✅✅ HAND UPDATE RECEIVED ✅✅✅');
      console.log('[Game] Received', data.hand.length, 'cards');
      console.log('[Game] Cards:', data.hand.map(c => `${c.color} ${c.value}`));
      setPlayerHand(data.hand);
    };

    const handleCardPlayed = (data: any) => {
      console.log('[Game] 🎴 Card played by:', data.playerId);
      const player = gameState?.players.find((p) => p.id === data.playerId);
      if (player) {
        showNotification(`${player.name} played ${data.card.value}`);
      }
    };

    const handleGameOver = (data: { winner: string; winnerId: string }) => {
      console.log('[Game] 🏆 Game over:', data);
      setWinner(data.winner);
      setShowGameOver(true);
    };

    const handleError = (error: { message: string }) => {
      console.error('[Game] ❌ Error:', error);
      showNotification(error.message);
    };

    // Attach listeners
    socketService.onGameState(handleGameState);
    socketService.onGameStarted(handleGameStarted);
    socketService.onHandUpdate(handleHandUpdate);
    socketService.onCardPlayed(handleCardPlayed);
    socketService.onGameOver(handleGameOver);
    socketService.onError(handleError);

    // Listen for all events (debug)
    socketService.socket.onAny((eventName, ...args) => {
      console.log(`[Game] 📡 Event: ${eventName}`, args);
    });

       socketService.checkReconnection();
    setIsReconnecting(true);
    setShowReconnectModal(true);

    // ✅ ADD: Handle reconnection result
    socketService.onReconnectionResult((data) => {
      setIsReconnecting(false);
      
      if (data.canReconnect) {
        setCanReconnect(true);
        setReconnectRoomId(data.roomId);
      } else {
        setCanReconnect(false);
        setShowReconnectModal(false);
      }
    });

    // ✅ ADD: Handle game restored
    socketService.onGameRestored((data) => {
      console.log('[Game] Game restored!', data);
      setGameState(data.gameState);
      setPlayerHand(data.yourHand);
      setShowReconnectModal(false);
      showNotification(data.message || 'Reconnected to game');
    });

    // ✅ ADD: Handle other player reconnected
    socketService.onPlayerReconnected((data) => {
      showNotification(`${data.playerName} reconnected`);
    });


    console.log('[Game] ✅ All listeners attached');

    return () => {
      console.log('[Game] 🧹 Cleaning up listeners');
      socketService.off("game_state");
      socketService.off("game_started");
      socketService.off("hand_update");
      socketService.off("card_played");
      socketService.off("game_over");
      socketService.off("error");
       socketService.off('reconnection_result');
      socketService.off('game_restored');
      socketService.off('player_reconnected');
      socketService.socket.offAny();

    };

    
  }, [roomId, navigate, userId]);

  const handleReconnect = () => {
    if (reconnectRoomId) {
      socketService.reconnectToGame(reconnectRoomId);
    }
  };

  const handleDismissReconnect = () => {
    setShowReconnectModal(false);
    navigate('/lobby');
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 3000);
  };

  const handleCardClick = (card: Card) => {
    if (!isMyTurn) {
      showNotification("It's not your turn!");
      return;
    }

    if (
      gameState &&
      gameState.pendingDraw > 0 &&
      !["draw2", "wild_draw4"].includes(card.value as string)
    ) {
      showNotification(`You must draw ${gameState.pendingDraw} cards!`);
      return;
    }

    if (card.color === "wild") {
      setPendingCard(card);
      setShowColorPicker(true);
    } else {
      console.log('[Game] 🎴 Playing card:', card.id);
      socketService.playCard(card.id);
    }
  };

  const handleColorSelect = (color: string) => {
    if (pendingCard) {
      console.log('[Game] 🎨 Playing wild with color:', color);
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
    console.log('[Game] 📥 Drawing card');
    socketService.drawCard();
  };

  if (!gameState) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🎮</div>
          <p className="text-xl text-gray-400">Loading game...</p>
        </div>
      </div>
    );
  }

  const currentPlayer = gameState.players.find(
    (p) => p.id === gameState.currentPlayer
  );
  const myPlayer = gameState.players.find(
    (p) => p.id === userId
  );
  const otherPlayers = gameState.players.filter(
    (p) => p.id !== userId
  );

  const getOpponentPosition = (index: number): 'top' | 'left' | 'right' => {
    if (otherPlayers.length === 1) return 'top';
    if (otherPlayers.length === 2) return index === 0 ? 'left' : 'right';
    return index === 0 ? 'left' : index === 1 ? 'top' : 'right';
  };

  // Waiting room
  if (!gameState.gameStarted) {
    return (
      <WaitingRoom
        roomId={roomId || ''}
        gameState={gameState}
        onAddBot={() => {
          console.log('[Game] 🤖 Adding bot...');
          socketService.addBot();
        }}
        onStartGame={() => {
          console.log('[Game] 🚀 Starting game...');
          socketService.startGame();
        }}
        onLeave={() => {
          socketService.leaveRoom();
          navigate("/lobby");
        }}
      />
    );
  }

  // Active game
  return (
    <div className="min-h-screen bg-dark-900 pb-4">
      <Navigation />

      {/* Notification */}
      {notification && (
        <div className="fixed top-20 sm:top-24 left-1/2 transform -translate-x-1/2 z-50 bg-uno-blue text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg text-sm sm:text-base max-w-xs sm:max-w-md text-center">
          {notification}
        </div>
      )}

      {/* Debug Panel */}
      <GameDebugPanel
        handCount={playerHand.length}
        userId={userId}
        isMyTurn={isMyTurn}
        onRequestHand={requestHand}
      />

      {/* Header */}
      <GameHeader
        gameState={gameState}
        isMyTurn={isMyTurn}
        currentPlayerName={currentPlayer?.name}
      />

       <ReconnectionModal
        isOpen={showReconnectModal}
        isReconnecting={isReconnecting}
        canReconnect={canReconnect}
        onReconnect={handleReconnect}
        onDismiss={handleDismissReconnect}
      />

      {/* Game Table */}
      <div className="px-2 sm:px-4 max-w-7xl mx-auto">
        <div className="relative w-full" style={{ perspective: '2000px' }}>
          <div 
            className="relative bg-gradient-to-br from-green-900 via-green-800 to-green-900 rounded-2xl sm:rounded-[3rem] shadow-2xl p-4 sm:p-8"
            style={{
              transform: 'rotateX(15deg)',
              minHeight: window.innerWidth < 640 ? '500px' : '650px',
              boxShadow: '0 30px 60px rgba(0, 0, 0, 0.6), inset 0 2px 10px rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Table Texture */}
            <div 
              className="absolute inset-0 rounded-2xl sm:rounded-[3rem] opacity-10"
              style={{
                backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.05) 10px, rgba(255, 255, 255, 0.05) 20px)`
              }}
            />

            {/* Opponents */}
            {otherPlayers.map((player, index) => (
              <OpponentHand
                key={player.id}
                player={player}
                isCurrentTurn={gameState.currentPlayer === player.id}
                position={getOpponentPosition(index)}
              />
            ))}

            {/* Center - Draw/Discard */}
            <GameTable
              gameState={gameState}
              isMyTurn={isMyTurn}
              onDrawCard={handleDraw}
            />

            {/* Your Hand */}
            <PlayerHand
              playerName={myPlayer?.name || 'You'}
              playerHand={playerHand}
              isMyTurn={isMyTurn}
              pendingDraw={gameState.pendingDraw}
              onCardClick={handleCardClick}
              onRequestHand={requestHand}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <ColorPickerModal
        isOpen={showColorPicker}
        onClose={() => setShowColorPicker(false)}
        onSelectColor={handleColorSelect}
      />

      <GameOverModal
        isOpen={showGameOver}
        winner={winner}
        onClose={() => {
          socketService.leaveRoom();
          navigate("/lobby");
        }}
      />
    </div>
  );
}