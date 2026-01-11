// Friends.tsx - Modernized
import { useState, useEffect } from 'react';
// import { useAuth } from '../context/AuthContext';
import Navigation from '../components/common/Navigation';
import PlayerAvatar from '../components/common/PlayerAvatar';

const API_URL = import.meta.env.VITE_SERVER_URL;

if (!API_URL) {
  throw new Error('VITE_SERVER_URL environment variable is required');
}

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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="relative mb-8">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 animate-spin">
                
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl">👥</span>
              </div>
            </div>
            <p className="text-lg text-gray-300 font-light animate-pulse">Loading friends...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Navigation />

      <div className="pt-24 pb-12 px-4 max-w-6xl mx-auto">
        {/* Modern Header */}
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 text-gradient">
            Friends
          </h1>
          <p className="text-lg text-gray-400">
            Connect with other players and build your gaming community
          </p>
        </div>

        {/* Modern Notifications */}
        {error && (
          <div className="mb-6 glass-panel border-l-4 border-red-500 animate-fade-in-up">
            <div className="flex items-center gap-3 p-4">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}
        {success && (
          <div className="mb-6 glass-panel border-l-4 border-green-500 animate-fade-in-up">
            <div className="flex items-center gap-3 p-4">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <p className="text-green-400">{success}</p>
            </div>
          </div>
        )}

        {/* Modern Add Friend Section */}
        <div className="glass-panel-dark rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Add Friend
          </h2>
          <form onSubmit={sendFriendRequest} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                placeholder="Enter username..."
                className="w-full input-modern pl-12"
                required
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                @
              </div>
            </div>
            <button
              type="submit"
              disabled={sendingRequest}
              className="btn-modern min-w-[140px]"
            >
              {sendingRequest ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Sending...
                </span>
              ) : (
                'Send Request'
              )}
            </button>
          </form>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pending Requests - Modern Card */}
          {requests.length > 0 && (
            <div className="glass-panel-dark rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                  Friend Requests
                </h2>
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">
                  {requests.length} new
                </span>
              </div>
              <div className="space-y-3">
                {requests.map((request) => (
                  <div key={request.id} className="glass-panel rounded-xl p-4 animate-fade-in-up">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <PlayerAvatar name={request.requester.username} size="sm" />
                        <div>
                          <p className="text-white font-semibold">{request.requester.username}</p>
                          <p className="text-xs text-gray-400">Sent recently</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => acceptRequest(request.id)}
                          className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all hover:scale-105"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => rejectRequest(request.id)}
                          className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all hover:scale-105"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sent Requests - Modern Card */}
          {sentRequests.length > 0 && (
            <div className="glass-panel-dark rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  Sent Requests
                </h2>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium">
                  {sentRequests.length} pending
                </span>
              </div>
              <div className="space-y-3">
                {sentRequests.map((request) => (
                  <div key={request.id} className="glass-panel rounded-xl p-4 animate-fade-in-up">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <PlayerAvatar name={request.receiver.username} size="sm" />
                        <div>
                          <p className="text-white font-semibold">{request.receiver.username}</p>
                          <p className="text-xs text-gray-400">Waiting for response</p>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-gray-700/50 rounded-full">
                        <span className="text-sm text-gray-400 animate-pulse">Pending...</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modern Friends List */}
        <div className="glass-panel-dark rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Your Friends
            </h2>
            <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full font-medium">
              {friends.length} total
            </span>
          </div>
          
          {friends.length === 0 ? (
            <div className="text-center py-12">
              <div className="relative inline-block mb-6">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-gray-700 to-gray-800 flex items-center justify-center">
                  <span className="text-4xl">😢</span>
                </div>
              </div>
              <p className="text-xl text-gray-300 mb-2">No friends yet</p>
              <p className="text-gray-500">Start by adding friends above!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friends.map((friend) => (
                <div key={friend.id} className="glass-panel rounded-xl p-4 hover:scale-[1.02] transition-all duration-300 group animate-fade-in-up">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <PlayerAvatar name={friend.username} size="md" />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                      </div>
                      <div>
                        <p className="text-white font-semibold">{friend.username}</p>
                        <p className="text-sm text-gray-400">Online</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFriend(friend.id)}
                      className="text-gray-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 rounded-lg"
                      title="Remove friend"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}