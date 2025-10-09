import { useState, useEffect } from 'react';
import { connectionsAPI, usersAPI } from '../api/client';
import { Connection, User } from '../types';
import Navbar from '../components/Navbar';
import ConnectionCard from '../components/ConnectionCard';

const Connections = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'connections' | 'discover'>('connections');
  const [connectionUserIds, setConnectionUserIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [connectionsData, usersData] = await Promise.all([
        connectionsAPI.getConnections(),
        usersAPI.getAllUsers(),
      ]);
      
      setConnections(connectionsData);
      setUsers(usersData);
      
      // FIX: Track ALL users who have connections (both as sender and receiver)
      const connectedIds = new Set(connectionsData.map((c) => c.friend.id));
      setConnectionUserIds(connectedIds);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (userId: number) => {
    try {
      await connectionsAPI.sendConnectionRequest(userId);
      // FIX: Add the user to the connected set immediately
      setConnectionUserIds((prev) => new Set(prev).add(userId));
      loadData(); // Reload to update the connections list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send connection request';
      alert(errorMessage);
    }
  };

  const handleAccept = async (id: number) => {
    try {
      await connectionsAPI.acceptConnection(id);
      loadData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to accept connection';
      alert(errorMessage);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await connectionsAPI.deleteConnection(id);
      loadData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reject connection';
      alert(errorMessage);
    }
  };

  const handleRemove = async (id: number) => {
    if (!confirm('Are you sure you want to remove this connection?')) return;
    
    try {
      await connectionsAPI.deleteConnection(id);
      loadData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove connection';
      alert(errorMessage);
    }
  };

  const pendingRequests = connections.filter(
    (c) => c.status === 'pending' && !c.is_sender
  );
  const sentRequests = connections.filter(
    (c) => c.status === 'pending' && c.is_sender
  );
  const acceptedConnections = connections.filter((c) => c.status === 'accepted');

  // Filter users who don't have any connection
  const availableUsers = users.filter((user) => !connectionUserIds.has(user.id));

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pb-20 md:pb-0">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Connections</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('connections')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'connections'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Connections ({acceptedConnections.length + pendingRequests.length + sentRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('discover')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'discover'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Discover ({availableUsers.length})
            </button>
          </div>
        </div>

        {/* Connections Tab */}
        {activeTab === 'connections' && (
          <div className="space-y-8">
            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Pending Requests ({pendingRequests.length})
                </h2>
                <div className="space-y-4">
                  {pendingRequests.map((connection) => (
                    <ConnectionCard
                      key={connection.id}
                      connection={connection}
                      onAccept={handleAccept}
                      onReject={handleReject}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sent Requests */}
            {sentRequests.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Sent Requests ({sentRequests.length})
                </h2>
                <div className="space-y-4">
                  {sentRequests.map((connection) => (
                    <ConnectionCard
                      key={connection.id}
                      connection={connection}
                      onRemove={handleRemove}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Accepted Connections */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Accepted Connections ({acceptedConnections.length})
              </h2>
              {acceptedConnections.length > 0 ? (
                <div className="space-y-4">
                  {acceptedConnections.map((connection) => (
                    <ConnectionCard
                      key={connection.id}
                      connection={connection}
                      onRemove={handleRemove}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">
                  No accepted connections yet. Check the Discover tab to connect with others!
                </p>
              )}
            </div>

            {connections.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No connections yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by discovering and connecting with professionals
                </p>
                <button
                  onClick={() => setActiveTab('discover')}
                  className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Discover Users
                </button>
              </div>
            )}
          </div>
        )}

        {/* Discover Tab */}
        {activeTab === 'discover' && (
          <div>
            {availableUsers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableUsers.map((user) => (
                  <div key={user.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.name}
                          className="h-16 w-16 rounded-full"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
                        <p className="text-sm text-gray-600 truncate">{user.email}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleConnect(user.id)}
                      className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">All caught up!</h3>
                <p className="mt-1 text-sm text-gray-500">
                  You've connected with all available users
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Connections;