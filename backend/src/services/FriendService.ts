import { prisma } from '../lib/prisma.js';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors.js';

export class FriendService {
  
  /**
   * Send a friend request
   */
  static async sendFriendRequest(requesterId: string, receiverUsername: string) {
   // ✅ SECURITY: Validate and sanitize username input
  if (!receiverUsername || receiverUsername.length < 3) {
    throw new ValidationError('Invalid username');
  }
  
   // ✅ SECURITY: Remove any dangerous characters
  const cleanUsername = receiverUsername.trim().replace(/[^a-zA-Z0-9_-]/g, '');
  if (cleanUsername !== receiverUsername.trim()) {
    throw new ValidationError('Username contains invalid characters');
  }

  if (cleanUsername.length > 20) {
    throw new ValidationError('Username too long');
  }

  // Find receiver by sanitized username
  const receiver = await prisma.user.findUnique({
    where: { username: cleanUsername }
  });

  if (!receiver) {
    throw new NotFoundError('User not found');
  }
  
    
    // Can't add yourself
    if (requesterId === receiver.id) {
      throw new ConflictError('You cannot add yourself as a friend');
    }
    
    // Check if friendship already exists (in either direction)
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId, receiverId: receiver.id },
          { requesterId: receiver.id, receiverId: requesterId }
        ]
      }
    });
    
    if (existing) {
      if (existing.status === 'PENDING') {
        throw new ConflictError('Friend request already pending');
      }
      if (existing.status === 'ACCEPTED') {
        throw new ConflictError('Already friends with this user');
      }
      if (existing.status === 'REJECTED') {
        throw new ConflictError('Friend request was rejected');
      }
    }
    
    // Create friend request
    const friendship = await prisma.friendship.create({
      data: {
        requesterId,
        receiverId: receiver.id,
        status: 'PENDING'
      },
      include: {
        receiver: {
          select: { 
            id: true, 
            username: true, 
            avatar: true 
          }
        }
      }
    });
    
    console.log(`[Friends] ${requesterId} sent request to ${receiver.username}`);
    
    return friendship;
  }
  
  /**
   * Accept a friend request
   */
  static async acceptFriendRequest(userId: string, friendshipId: string) {
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
      include: {
        requester: {
          select: { id: true, username: true, avatar: true }
        }
      }
    });
    
    if (!friendship) {
      throw new NotFoundError('Friend request not found');
    }
    
    // Must be the receiver to accept
    if (friendship.receiverId !== userId) {
      throw new ValidationError('You cannot accept this request');
    }
    
    // Update status
    const updated = await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: 'ACCEPTED' },
      include: {
        requester: {
          select: { id: true, username: true, avatar: true }
        },
        receiver: {
          select: { id: true, username: true, avatar: true }
        }
      }
    });
    
    console.log(`[Friends] ${friendship.requester.username} and ${userId} are now friends`);
    
    return updated;
  }
  
  /**
   * Reject a friend request
   */
  static async rejectFriendRequest(userId: string, friendshipId: string) {
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId }
    });
    
    if (!friendship) {
      throw new NotFoundError('Friend request not found');
    }
    
    if (friendship.receiverId !== userId) {
      throw new ValidationError('You cannot reject this request');
    }
    
    await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: 'REJECTED' }
    });
    
    console.log(`[Friends] ${userId} rejected friend request`);
  }
  
  /**
   * Remove a friend (delete friendship)
   */
  static async removeFriend(userId: string, friendId: string) {
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: userId, receiverId: friendId },
          { requesterId: friendId, receiverId: userId }
        ],
        status: 'ACCEPTED'
      }
    });
    
    if (!friendship) {
      throw new NotFoundError('Friendship not found');
    }
    
    await prisma.friendship.delete({
      where: { id: friendship.id }
    });
    
    console.log(`[Friends] ${userId} removed friend ${friendId}`);
  }
  
  /**
   * Get all friends (accepted friendships)
   */
  static async getFriends(userId: string) {
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { requesterId: userId, status: 'ACCEPTED' },
          { receiverId: userId, status: 'ACCEPTED' }
        ]
      },
      include: {
        requester: {
          select: { id: true, username: true, avatar: true }
        },
        receiver: {
          select: { id: true, username: true, avatar: true }
        }
      }
    });
    
    // Return the friend (not the current user)
    return friendships.map(f => 
      f.requesterId === userId ? f.receiver : f.requester
    );
  }
  
  /**
   * Get pending friend requests (received)
   */
  static async getPendingRequests(userId: string) {
    const requests = await prisma.friendship.findMany({
      where: {
        receiverId: userId,
        status: 'PENDING'
      },
      include: {
        requester: {
          select: { id: true, username: true, avatar: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return requests;
  }
  
  /**
   * Get sent friend requests (pending requests sent by user)
   */
  static async getSentRequests(userId: string) {
    const requests = await prisma.friendship.findMany({
      where: {
        requesterId: userId,
        status: 'PENDING'
      },
      include: {
        receiver: {
          select: { id: true, username: true, avatar: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return requests;
  }
}