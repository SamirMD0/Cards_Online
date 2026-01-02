interface RoomCookie {
  roomId: string;
  roomCode: string;
  playerName: string;
  joinedAt: number;
}

const ROOM_COOKIE_NAME = 'uno_current_room';
const COOKIE_MAX_AGE = 24 * 60 * 60; // 24 hours in seconds

export const roomCookies = {
  /**
   * Save current room to cookie
   */
  setCurrentRoom(roomId: string, roomCode: string, playerName: string): void {
    const data: RoomCookie = {
      roomId,
      roomCode,
      playerName,
      joinedAt: Date.now(),
    };

    const value = JSON.stringify(data);
    
    document.cookie = `${ROOM_COOKIE_NAME}=${encodeURIComponent(value)}; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Strict`;
    
    console.log(`[RoomCookies] ✅ Saved room: ${roomCode} (${roomId})`);
  },

  /**
   * Get current room from cookie
   */
  getCurrentRoom(): RoomCookie | null {
    const cookies = document.cookie.split(';');
    const roomCookie = cookies.find(c => c.trim().startsWith(`${ROOM_COOKIE_NAME}=`));

    if (!roomCookie) {
      console.log('[RoomCookies] No room cookie found');
      return null;
    }

    try {
      const value = roomCookie.split('=')[1];
      const decoded = decodeURIComponent(value);
      const data: RoomCookie = JSON.parse(decoded);
      
      const age = Date.now() - data.joinedAt;
      const maxAge = 24 * 60 * 60 * 1000;
      
      if (age > maxAge) {
        console.log('[RoomCookies] Cookie expired, clearing...');
        this.clearCurrentRoom();
        return null;
      }

      console.log(`[RoomCookies] Found room: ${data.roomCode} (${data.roomId})`);
      return data;
    } catch (error) {
      console.error('[RoomCookies] Failed to parse cookie:', error);
      this.clearCurrentRoom();
      return null;
    }
  },

  /**
   * Clear current room cookie
   */
  clearCurrentRoom(): void {
    document.cookie = `${ROOM_COOKIE_NAME}=; max-age=0; path=/; SameSite=Strict`;
    console.log('[RoomCookies] ✅ Cleared room cookie');
  },

  /**
   * Check if user is in a room
   */
  hasActiveRoom(): boolean {
    return this.getCurrentRoom() !== null;
  },

  /**
   * Get room ID if in a room
   */
  getActiveRoomId(): string | null {
    const room = this.getCurrentRoom();
    return room ? room.roomId : null;
  },
};
