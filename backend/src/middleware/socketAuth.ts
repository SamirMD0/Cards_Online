import { Socket } from 'socket.io';
import { AuthService } from '../services/AuthService.js';

export async function socketAuthMiddleware(socket: Socket, next: any) {
  try {
    // Extract token from handshake auth
    const token = socket.handshake.auth.token;
    
    if (!token) {
      console.log('[Socket Auth] No token provided');
      return next(new Error('Authentication required'));
    }
    
    // Verify token and get user
    const user = await AuthService.verifyToken(token) as {
      id: string;
      username: string;
      email: string;
      avatar: string | null;
      createdAt: Date;
      updatedAt: Date;
    };
    
    // Attach user data to socket
    socket.data.userId = user.id;
    socket.data.username = user.username;
    socket.data.email = user.email;
    
    console.log(`[Socket Auth] User authenticated: ${user.username} (${user.id})`);
    
    next();
    
  } catch (error: any) {
    console.log('[Socket Auth] Authentication failed:', error.message);
    next(new Error('Invalid or expired token'));
  }
}