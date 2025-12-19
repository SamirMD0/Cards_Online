import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import GameTable from '../components/GameTable';
import UnoCard, { CardColor } from '../components/UnoCard';
import PlayerAvatar from '../components/PlayerAvatar';
import { socketService } from '../socket';
import type { GameState, Card } from '../types';

export default function Game() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pendingCard, setPendingCard] = useState<Card | null>(null);
  const [showGameOver, setShowGameOver] = useState(false);
  const [winner, setWinner] = useState<string>('');
  const [notification, setNotification] = useState('');

  useEffect(() => {
    if (!roomId) {
      navigate('/lobby');
      return;
    }

    // Setup game listeners
    const handleGameState = (state: GameState) => {
      console.log('Game state update:', state);
      setGameState(state);
    };

    const handleGameStarted = (state: GameState) => {
      console.log('Game started:', state);
      setGameState(state);
      showNotification('Game started! 🎮');
    };

    const handleHandUpdate = (data: { hand: Card[] }) => {
      console.log('Hand update:', data.hand.length, 'cards');
      setPlayerHand(data.hand);
    };

    const handleCardPlayed = (data: { playerId: string; card: Card; chosenColor: string }) => {
      console.log('Card played:', data);
      const player = gameState?.players.find(p => p.id === data.playerId);
      if (player) {
        showNotification(`${player.name} played ${data.card.value}`);
      }
    };

    const handleGameOver = (data: { winner: string; winnerId: string }) => {
      console.log('Game over:', data);
      setWinner(data.winner);
      setShowGameOver(true);
    };

    const handlePlayerJoined = (data: { playerName: string }) => {
      showNotification(`${data.playerName} joined the game`);
    };

    const handlePlayerLeft = (data: { playerId: string }) => {
      showNotification('A player left the game');
    };

    const handleError = (error: { message: string }) => {
      showNotification(error.message);
    };

    socketService.onGameState(handleGameState);
    socketService.onGameStarted(handleGameStarted);
    socketService.onHandUpdate(handleHandUpdate);
    socketService.onCardPlayed(handleCardPlayed);
    socketService.onGameOver(handleGameOver);
    socketService.onPlayerJoined(handlePlayerJoined);
    socketService.onPlayerLeft(handlePlayerLeft);
    socketService.onError(handleError);

    return () => {
      socketService.off('game_state');
      socketService.off('game_started');
      socketService.off('hand_update');
      socketService.off('card_played');
      socketService.off('game_over');
      socketService.off('player_joined');
      socketService.off('player_left');
      socketService.off('error');
    };
  }, [roomId, navigate, gameState?.players]);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleCardClick = (card: Card) => {
    if (!gameState || gameState.currentPlayer !== socketService.socket.id) {
      showNotification("It's not your turn!");
      return;
    }

    if (gameState.pendingDraw > 0 && !['draw2', 'wild_draw4'].includes(card.value as string)) {
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
    if (!gameState || gameState.currentPlayer !== socketService.socket.id) {
      showNotification("It's not your turn!");
      return;
    }
    socketService.drawCard();
  };

  const handleStartGame = () => {
    socketService.startGame();
  };

  const handleAddBot = () => {
    socketService.addBot();
  };

  const handleLeaveGame = () => {
    socketService.leaveRoom();
    navigate('/lobby');
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

  const isMyTurn = gameState.currentPlayer === socketService.socket.id;
  const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayer);
  const myPlayer = gameState.players.find(p => p.id === socketService.socket.id);
  const otherPlayers = gameState.players.filter(p => p.id !== socketService.socket.id);

  // Waiting room (game not started)
  if (!gameState.gameStarted) {
    return (
      <div className="min-h-screen bg-dark-900">
        <Navigation />
        
        <div className="pt-32 px-4 max-w-4xl mx-auto">
          <div className="bg-dark-800 border-2 border-dark-700 rounded-2xl p-12 text-center">
            <h2 className="text-4xl font-poppins font-bold text-white mb-4">
              Waiting Room
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Room Code: <span className="text-uno-yellow font-mono">{roomId}</span>
            </p>

            {/* Players */}
            <div className="mb-8">
              <h3 className="text-2xl font-poppins font-bold text-white mb-6">
                Players ({gameState.players.length}/4)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {gameState.players.map((player) => (
                  <div key={player.id} className="flex flex-col items-center">
                    <PlayerAvatar
                      name={player.name}
                      isHost={player.id === gameState.players[0].id}
                      isReady={true}
                      size="lg"
                    />
                    <p className="mt-3 text-white font-semibold">{player.name}</p>
                    {player.isBot && <span className="text-sm text-gray-400">Bot</span>}
                  </div>
                ))}
                {Array.from({ length: 4 - gameState.players.length }).map((_, i) => (
                  <div key={`empty-${i}`} className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full border-4 border-dashed border-dark-600 flex items-center justify-center">
                      <span className="text-4xl text-dark-600">?</span>
                    </div>
                    <p className="mt-3 text-gray-500">Waiting...</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleAddBot}
                disabled={gameState.players.length >= 4}
                className="px-8 py-4 bg-dark-700 hover:bg-dark-600 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ➕ Add Bot
              </button>
              <button
                onClick={handleStartGame}
                disabled={gameState.players.length < 2}
                className="px-8 py-4 bg-gradient-to-r from-uno-blue to-uno-green hover:shadow-glow-blue text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🚀 Start Game
              </button>
              <button
                onClick={handleLeaveGame}
                className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all duration-300"
              >
                🚪 Leave
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active game
  return (
    <div className="min-h-screen bg-dark-900">
      <Navigation />

      {/* Notification */}
      {notification && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-uno-blue text-white px-6 py-3 rounded-lg shadow-lg animate-float">
          {notification}
        </div>
      )}

      <div className="pt-24 pb-12 px-4">
        {/* Turn Indicator */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="text-2xl font-poppins font-bold text-white mb-1">
                {isMyTurn ? (
                  <span className="text-uno-yellow animate-pulse">🎯 YOUR TURN!</span>
                ) : (
                  <span>{currentPlayer?.name}'s Turn</span>
                )}
              </h3>
              <p className="text-gray-400">
                Direction: {gameState.direction === 1 ? '→ Clockwise' : '← Counter-clockwise'}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-400">Deck</p>
                <p className="text-2xl font-bold text-white">{gameState.deckCount} 🎴</p>
              </div>
              {gameState.pendingDraw > 0 && (
                <div className="text-center">
                  <p className="text-sm text-gray-400">Must Draw</p>
                  <p className="text-2xl font-bold text-uno-yellow">+{gameState.pendingDraw}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Other Players */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {otherPlayers.map((player) => (
              <div
                key={player.id}
                className={`bg-dark-800 border-2 rounded-xl p-4 flex items-center gap-4 ${
                  player.id === gameState.currentPlayer
                    ? 'border-uno-yellow'
                    : 'border-dark-700'
                }`}
              >
                <PlayerAvatar
                  name={player.name}
                  isHost={player.id === gameState.players[0].id}
                  isReady={true}
                  size="md"
                />
                <div className="flex-1">
                  <p className="font-semibold text-white">
                    {player.name} {player.isBot && '🤖'}
                  </p>
                  <p className="text-gray-400">{player.handCount} cards</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Game Table */}
        <div className="max-w-7xl mx-auto mb-12">
          <GameTable>
            <div className="flex items-center justify-center gap-12">
              {/* Draw Pile */}
              <div className="text-center">
                <p className="text-white mb-3 font-semibold">Draw Pile</p>
                <button
                  onClick={handleDraw}
                  disabled={!isMyTurn}
                  className="w-32 h-48 bg-gradient-to-br from-dark-800 to-dark-900 border-4 border-white rounded-2xl flex flex-col items-center justify-center text-6xl hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed shadow-card"
                >
                  🎴
                  <span className="text-sm text-gray-400 mt-2">{gameState.deckCount}</span>
                </button>
              </div>

              {/* Discard Pile */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <p className="text-white font-semibold">Current Color:</p>
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white"
                    style={{ backgroundColor: gameState.currentColor || 'white' }}
                  />
                </div>
                {gameState.topCard && (
                  <UnoCard
                    color={gameState.topCard.color as CardColor}
                    value={gameState.topCard.value}
                    disabled
                    className="scale-125"
                  />
                )}
              </div>
            </div>
          </GameTable>
        </div>

        {/* Player Hand */}
        <div className="max-w-7xl mx-auto">
          <div className="bg-dark-800 border-2 border-dark-700 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-poppins font-bold text-white">
                Your Hand ({playerHand.length} cards)
              </h3>
              {isMyTurn && (
                <span className="px-4 py-2 bg-uno-yellow text-dark-900 font-bold rounded-lg animate-pulse">
                  YOUR TURN
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              {playerHand.map((card) => (
                <UnoCard
                  key={card.id}
                  color={card.color as CardColor}
                  value={card.value}
                  onClick={() => handleCardClick(card)}
                  disabled={!isMyTurn}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Color Picker Modal */}
      {showColorPicker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setShowColorPicker(false)}
        >
          <div
            className="bg-dark-800 border-2 border-dark-700 rounded-2xl p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-3xl font-poppins font-bold text-white mb-6 text-center">
              Choose a Color
            </h3>
            <div className="flex gap-6">
              {['red', 'blue', 'green', 'yellow'].map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color.toUpperCase()}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {showGameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-uno-blue to-uno-green p-12 rounded-2xl text-center max-w-md">
            <div className="text-8xl mb-6">🎉</div>
            <h2 className="text-5xl font-poppins font-extrabold text-white mb-4">
              Game Over!
            </h2>
            <p className="text-3xl text-white mb-8">
              <strong>{winner}</strong> wins!
            </p>
            <button
              onClick={handleLeaveGame}
              className="px-8 py-4 bg-white text-uno-blue font-bold rounded-xl hover:scale-105 transition-transform"
            >
              Back to Lobby
            </button>
          </div>
        </div>
      )}
    </div>
  );
}