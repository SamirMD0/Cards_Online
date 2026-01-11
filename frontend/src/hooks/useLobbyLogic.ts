import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { socketService } from '../socket';
import { roomCookies } from '../utils/roomCookies';

interface Room {
  id: string;
  roomName: string;
  roomCode: string;
  players: Array<{
    id: string;
    name: string;
    isHost: boolean;
    isReady: boolean;
  }>;
  maxPlayers: number;
  gameStarted: boolean;
}

export function useLobbyLogic() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');
  const [isCheckingRoom, setIsCheckingRoom] = useState(true);
  const [showReconnectPrompt, setShowReconnectPrompt] = useState(false);
  const [activeRoom, setActiveRoom] = useState<any>(null);

  useEffect(() => {
    if (!socketService.socket.connected) {
      socketService.connect();
    }

    const checkActiveRoom = async () => {
      const room = roomCookies.getCurrentRoom();
      
      if (room) {
        socketService.socket.emit('check_room_exists', { roomId: room.roomId });
      } else {
        setIsCheckingRoom(false);
      }
    };

    const handleConnect = () => {
      setIsConnected(true);
      socketService.getRooms();
      checkActiveRoom();
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleRoomsList = (roomsList: Room[]) => {
      setRooms(roomsList);
    };

    const handleRoomCreated = (data: { roomId: string; roomCode: string }) => {
      if (user) {
        roomCookies.setCurrentRoom(data.roomId, data.roomCode, user.username);
      }
    };

    const handleJoinedRoom = (data: { roomId: string }) => {
      navigate(`/game/${data.roomId}`);
    };

    const handleShouldReconnect = (data: { roomId: string }) => {
      navigate(`/game/${data.roomId}`, { state: { reconnect: true } });
    };

    const handleRoomExists = (data: { exists: boolean; roomId: string; gameState?: any }) => {
      setIsCheckingRoom(false);

      if (data.exists) {
        setActiveRoom(roomCookies.getCurrentRoom());
        setShowReconnectPrompt(true);
      } else {
        roomCookies.clearCurrentRoom();
      }
    };

    const handleError = (error: { message: string }) => {
      setError(error.message);
      setTimeout(() => setError(''), 4000);
    };

    socketService.socket.on('connect', handleConnect);
    socketService.socket.on('disconnect', handleDisconnect);
    socketService.onRoomsList(handleRoomsList);
    socketService.onRoomCreated(handleRoomCreated);
    socketService.onJoinedRoom(handleJoinedRoom);
    socketService.socket.on('should_reconnect', handleShouldReconnect);
    socketService.socket.on('room_exists', handleRoomExists);
    socketService.onError(handleError);

    if (socketService.socket.connected) {
      handleConnect();
    }

    const interval = setInterval(() => {
      if (socketService.socket.connected) {
        socketService.getRooms();
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      socketService.socket.off('connect', handleConnect);
      socketService.socket.off('disconnect', handleDisconnect);
      socketService.socket.off('should_reconnect', handleShouldReconnect);
      socketService.socket.off('room_exists', handleRoomExists);
      socketService.off('rooms_list');
      socketService.off('room_created');
      socketService.off('joined_room');
      socketService.off('error');
    };
  }, [navigate, user]);

  const handleCreateRoom = (roomName: string, maxPlayers: number) => {
    if (roomCookies.hasActiveRoom()) {
      const room = roomCookies.getCurrentRoom();
      setError(`You're already in room "${room?.roomCode}". Leave it first.`);
      setTimeout(() => setError(''), 4000);
      return;
    }

    if (!isConnected) {
      setError('Not connected to server');
      setTimeout(() => setError(''), 4000);
      return;
    }
    
    socketService.createRoom(roomName, maxPlayers);
  };

  const handleJoinRoom = async (roomId: string) => {
    const activeRoomId = roomCookies.getActiveRoomId();
    if (activeRoomId && activeRoomId !== roomId) {
      const room = roomCookies.getCurrentRoom();
      setError(`You're already in room "${room?.roomCode}". Leave it first.`);
      setTimeout(() => setError(''), 4000);
      return;
    }

    if (!isConnected) {
      setError('Not connected to server');
      setTimeout(() => setError(''), 4000);
      return;
    }

    if (!user) {
      setError('Authentication required');
      setTimeout(() => setError(''), 4000);
      return;
    }

    const targetRoom = rooms.find(r => r.id === roomId);
    if (!targetRoom) {
      setError('Room not found');
      setTimeout(() => setError(''), 4000);
      return;
    }

    const playerName = user.username;
    roomCookies.setCurrentRoom(roomId, targetRoom.roomCode, playerName);
    socketService.joinRoom(roomId, playerName);
  };

  const handleRejoinActiveRoom = () => {
    if (activeRoom) {
      navigate(`/game/${activeRoom.roomId}`, { 
        state: { reconnect: true }
      });
    }
  };

  const handleAbandonActiveRoom = () => {
    roomCookies.clearCurrentRoom();
    setShowReconnectPrompt(false);
    setActiveRoom(null);
  };

  const filteredRooms = rooms.filter((room) =>
    room.roomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.roomCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeRooms = rooms.length;
  const totalPlayers = rooms.reduce((sum, room) => sum + room.players.length, 0);
  const gamesInProgress = rooms.filter(r => r.gameStarted).length;

  return {
    rooms,
    isModalOpen,
    setIsModalOpen,
    searchQuery,
    setSearchQuery,
    isConnected,
    error,
    isCheckingRoom,
    showReconnectPrompt,
    activeRoom,
    handleCreateRoom,
    handleJoinRoom,
    handleRejoinActiveRoom,
    handleAbandonActiveRoom,
    filteredRooms,
    activeRooms,
    totalPlayers,
    gamesInProgress,
  };
}