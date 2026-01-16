import { io, Socket } from "socket.io-client";

// ✅ FREE TIER: Use environment variable (NO localhost fallback)
const SERVER_URL = import.meta.env.VITE_SERVER_URL;

if (!SERVER_URL) {
  throw new Error(
    "FATAL: VITE_SERVER_URL not set. " +
    "Create frontend/.env.production with: " +
    "VITE_SERVER_URL=https://your-app.fly.dev"
  );
}

class SocketService {
  public socket: Socket;

  constructor() {
    // Create socket with auth callback (not static value!)
    this.socket = io(SERVER_URL, {
      autoConnect: false, // Don't auto-connect
      auth: (cb) => {
        // This function runs on EVERY connection attempt
        const token = localStorage.getItem("token");
        console.log("🔑 Socket auth callback - sending token:", !!token);
        cb({ token: token || "" });
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 30000, // ✅ Match Fly.io wake time
      reconnectionAttempts: 3, // ✅ Stop after 3 tries (30s max)
      timeout: 10000,
    });

    this.setupListeners();
  }

  private setupListeners() {
    this.socket.on("connect", () => {
      console.log("✅ Connected to server:", this.socket.id);
    });

    this.socket.on("disconnect", () => {
      console.log("❌ Disconnected from server");
    });

    this.socket.on("connect_error", (error) => {
      console.error("Connection error:", error.message);

      // ✅ CRITICAL FIX: Dispatch event if auth fails so UI can redirect
      if (
        error.message === "Authentication required" ||
        error.message === "invalid token"
      ) {
        window.dispatchEvent(
          new CustomEvent("socket-auth-failed", {
            detail: error.message,
          })
        );
      }

      console.warn(
        "⚠️ If server is on free tier, it may take 10-30s to wake up"
      );
    });
  }

  connect() {
    // ✅ CRITICAL FIX: Check token BEFORE trying to connect
    // This prevents the "sending token: false" error in logs
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn(
        "🚫 Aborting socket connection: No token found in localStorage"
      );
      return;
    }

    if (!this.socket.connected) {
      this.socket.connect();
    }
  }

  disconnect() {
    if (this.socket.connected) {
      this.socket.disconnect();
    }
  }

  // ✅ CRITICAL FIX: Add cleanup method to remove all listeners
  cleanup() {
    // Remove core connection listeners
    this.socket.off("connect");
    this.socket.off("disconnect");
    this.socket.off("connect_error");

    // Disconnect if connected
    if (this.socket.connected) {
      this.socket.disconnect();
    }
  }

  reconnect() {
    console.log("[Socket] Reconnecting with new token...");

    // Just disconnect and connect again.
    // The 'auth' callback in constructor will automatically grab the new token.
    this.socket.disconnect();
    this.connect();
  }

  // Room Management
  getRooms() {
    this.socket.emit("get_rooms");
  }

  createRoom(roomName: string, maxPlayers: number) {
    this.socket.emit("create_room", { roomName, maxPlayers });
  }

  joinRoom(roomId: string, playerName: string) {
    this.socket.emit("join_room", { roomId, playerName });
  }

  leaveRoom() {
    this.socket.emit("leave_room");
  }

  // Game Actions
  startGame() {
    this.socket.emit("start_game");
  }

  playCard(cardId: string, chosenColor?: string) {
    this.socket.emit("play_card", { cardId, chosenColor });
  }

  drawCard() {
    this.socket.emit("draw_card");
  }

  addBot() {
    this.socket.emit("add_bot");
  }

  // Event Listeners
  onRoomsList(callback: (rooms: any[]) => void) {
    this.socket.on("rooms_list", callback);
  }

  onRoomCreated(callback: (data: any) => void) {
    this.socket.on("room_created", callback);
  }

  onJoinedRoom(callback: (data: any) => void) {
    this.socket.on("joined_room", callback);
  }

  onGameState(callback: (state: any) => void) {
    this.socket.on("game_state", callback);
  }

  onGameStarted(callback: (state: any) => void) {
    this.socket.on("game_started", callback);
  }

  onHandUpdate(callback: (data: any) => void) {
    this.socket.on("hand_update", callback);
  }

  onCardPlayed(callback: (data: any) => void) {
    this.socket.on("card_played", callback);
  }

  onCardDrawn(callback: (data: any) => void) {
    this.socket.on("card_drawn", callback);
  }

  onGameOver(callback: (data: any) => void) {
    this.socket.on("game_over", callback);
  }

  onPlayerJoined(callback: (data: any) => void) {
    this.socket.on("player_joined", callback);
  }

  onPlayerLeft(callback: (data: any) => void) {
    this.socket.on("player_left", callback);
  }

  onError(callback: (error: any) => void) {
    this.socket.on("error", callback);
  }

  // Remove Listeners
  off(event: string, callback?: any) {
    this.socket.off(event, callback);
  }

  checkReconnection() {
    this.socket.emit("check_reconnection");
  }

  onReconnectionResult(callback: (data: any) => void) {
    this.socket.on("reconnection_result", callback);
  }

  onGameRestored(callback: (data: any) => void) {
    this.socket.on("game_restored", callback);
  }

  onPlayerReconnected(callback: (data: any) => void) {
    this.socket.on("player_reconnected", callback);
  }

  onReconnectionFailed(callback: (data: any) => void) {
    this.socket.on("reconnection_failed", callback);
  }

  checkRoomExists(roomId: string) {
    this.socket.emit("check_room_exists", { roomId });
  }

  onRoomExists(callback: (data: any) => void) {
    this.socket.on("room_exists", callback);
  }

  reconnectToGame(roomId: string) {
    console.log("[Socket] Emitting reconnect_to_game for", roomId);
    this.socket.emit("reconnect_to_game", { roomId });
  }
}

export const socketService = new SocketService();
export const socket = socketService.socket;
