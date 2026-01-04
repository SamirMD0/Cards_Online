import { useState, useEffect } from 'react';
// import { useAuth } from '../context/AuthContext';
import Navigation from '../components/common/Navigation';
import PlayerAvatar from '../components/common/PlayerAvatar';

const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

interface Friend {
  id: string;
  username: string;
  avatar: string | null;
}

interface FriendRequest {
  id: string;
  requester: Friend;
  createdAt: string;
}

export default function Friends() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchUsername, setSearchUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);

  useEffect(() => {
    loadFriends();
  }, []);

  async function loadFriends() {
    try {
      const token = localStorage.getItem('token');
      
      const [friendsRes, requestsRes, sentRes] = await Promise.all([
        fetch(`${API_URL}/api/friends`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include'
        }),
        fetch(`${API_URL}/api/friends/requests`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include'
        }),
        fetch(`${API_URL}/api/friends/sent`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include'
        })
      ]);

      if (friendsRes.ok) {
        const data = await friendsRes.json();
        setFriends(data.friends);
      }

      if (requestsRes.ok) {
        const data = await requestsRes.json();
        setRequests(data.requests);
      }

      if (sentRes.ok) {
        const data = await sentRes.json();
        setSentRequests(data.sent);
      }
    } catch (error) {
      console.error('Failed to load friends:', error);
    } finally {
      setLoading(false);
    }
  }

  async function sendFriendRequest(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSendingRequest(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/friends/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ username: searchUsername })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      setSuccess(`Friend request sent to ${searchUsername}!`);
      setSearchUsername('');
      loadFriends();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSendingRequest(false);
    }
  }

  async function acceptRequest(friendshipId: string) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/friends/accept/${friendshipId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      });

      if (response.ok) {
        setSuccess('Friend request accepted!');
        loadFriends();
      }
    } catch (error) {
      setError('Failed to accept request');
    }
  }

  async function rejectRequest(friendshipId: string) {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/friends/reject/${friendshipId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      });
      loadFriends();
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  }

  async function removeFriend(friendId: string) {
    if (!confirm('Remove this friend?')) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/friends/${friendId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      });
      loadFriends();
    } catch (error) {
      console.error('Failed to remove friend:', error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">👥</div>
            <p className="text-xl text-gray-400">Loading friends...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <Navigation />

      <div className="pt-24 pb-12 px-4 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-poppins font-extrabold text-white mb-4">
            Friends
          </h1>
          <p className="text-xl text-gray-400">
            Connect with other UNO players
          </p>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500 rounded-lg">
            <p className="text-green-400">{success}</p>
          </div>
        )}

        {/* Add Friend */}
        <div className="bg-dark-800 border-2 border-dark-700 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-poppins font-bold text-white mb-4">
            Add Friend
          </h2>
          <form onSubmit={sendFriendRequest} className="flex gap-3">
            <input
              type="text"
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              placeholder="Enter username..."
              className="flex-1 px-4 py-3 bg-dark-700 border-2 border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-uno-blue"
              required
            />
            <button
              type="submit"
              disabled={sendingRequest}
              className="px-8 py-3 bg-gradient-to-r from-uno-blue to-uno-green hover:shadow-glow-blue text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50"
            >
              {sendingRequest ? 'Sending...' : 'Send Request'}
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Requests */}
          {requests.length > 0 && (
            <div className="bg-dark-800 border-2 border-dark-700 rounded-xl p-6">
              <h2 className="text-2xl font-poppins font-bold text-white mb-4">
                Friend Requests ({requests.length})
              </h2>
              <div className="space-y-3">
                {requests.map((request) => (
                  <div key={request.id} className="bg-dark-700 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <PlayerAvatar name={request.requester.username} size="sm" />
                      <span className="text-white font-semibold">{request.requester.username}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => acceptRequest(request.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => rejectRequest(request.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sent Requests */}
          {sentRequests.length > 0 && (
            <div className="bg-dark-800 border-2 border-dark-700 rounded-xl p-6">
              <h2 className="text-2xl font-poppins font-bold text-white mb-4">
                Sent Requests ({sentRequests.length})
              </h2>
              <div className="space-y-3">
                {sentRequests.map((request) => (
                  <div key={request.id} className="bg-dark-700 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <PlayerAvatar name={request.receiver.username} size="sm" />
                      <span className="text-white font-semibold">{request.receiver.username}</span>
                    </div>
                    <span className="text-gray-400 text-sm">Pending...</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Friends List */}
        <div className="mt-8 bg-dark-800 border-2 border-dark-700 rounded-xl p-6">
          <h2 className="text-2xl font-poppins font-bold text-white mb-6">
            Your Friends ({friends.length})
          </h2>
          
          {friends.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">😢</div>
              <p className="text-xl text-gray-400 mb-2">No friends yet</p>
              <p className="text-gray-500">Add friends to play together!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friends.map((friend) => (
                <div key={friend.id} className="bg-dark-700 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <PlayerAvatar name={friend.username} size="md" />
                    <div>
                      <p className="text-white font-semibold">{friend.username}</p>
                      <p className="text-sm text-gray-400">Friend</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFriend(friend.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                    title="Remove friend"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}