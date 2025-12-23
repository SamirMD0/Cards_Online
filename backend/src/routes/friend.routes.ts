import express from 'express';
import { FriendService } from '../services/FriendService.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All friend routes require authentication
router.use(authMiddleware);

/**
 * GET /api/friends
 * Get list of friends
 */
router.get('/', async (req, res) => {
  try {
    const friends = await FriendService.getFriends(req.user!.id);
    res.json({ friends });
  } catch (error: any) {
    console.error('[Friends API] Get friends error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/friends/requests
 * Get pending friend requests (received)
 */
router.get('/requests', async (req, res) => {
  try {
    const requests = await FriendService.getPendingRequests(req.user!.id);
    res.json({ requests });
  } catch (error: any) {
    console.error('[Friends API] Get requests error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/friends/sent
 * Get sent friend requests
 */
router.get('/sent', async (req, res) => {
  try {
    const sent = await FriendService.getSentRequests(req.user!.id);
    res.json({ sent });
  } catch (error: any) {
    console.error('[Friends API] Get sent requests error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/friends/request
 * Send a friend request
 */
router.post('/request', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username required' });
    }
    
    const friendship = await FriendService.sendFriendRequest(req.user!.id, username);
    res.json({ friendship });
  } catch (error: any) {
    console.error('[Friends API] Send request error:', error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

/**
 * POST /api/friends/accept/:friendshipId
 * Accept a friend request
 */
router.post('/accept/:friendshipId', async (req, res) => {
  try {
    const { friendshipId } = req.params;
    const friendship = await FriendService.acceptFriendRequest(req.user!.id, friendshipId);
    res.json({ friendship });
  } catch (error: any) {
    console.error('[Friends API] Accept request error:', error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

/**
 * POST /api/friends/reject/:friendshipId
 * Reject a friend request
 */
router.post('/reject/:friendshipId', async (req, res) => {
  try {
    const { friendshipId } = req.params;
    await FriendService.rejectFriendRequest(req.user!.id, friendshipId);
    res.json({ success: true });
  } catch (error: any) {
    console.error('[Friends API] Reject request error:', error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

/**
 * DELETE /api/friends/:friendId
 * Remove a friend
 */
router.delete('/:friendId', async (req, res) => {
  try {
    const { friendId } = req.params;
    await FriendService.removeFriend(req.user!.id, friendId);
    res.json({ success: true });
  } catch (error: any) {
    console.error('[Friends API] Remove friend error:', error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

export default router;