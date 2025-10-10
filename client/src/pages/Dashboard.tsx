import { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { usersAPI, connectionsAPI } from '../api/client';
import { User, Connection } from '../types';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allUsers, connectionsData] = await Promise.all([
        usersAPI.getAllUsers(),
        connectionsAPI.getConnections(),
      ]);

      setUsers(allUsers);
      setConnections(connectionsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load users';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (userId: number) => {
    try {
      const newConnection = await connectionsAPI.sendConnectionRequest(userId);
      // Add the new connection to the list immediately
      setConnections((prev) => [...prev, newConnection]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send connection request';
      alert(errorMessage);
    }
  };

  // Helper function to get connection status for a user
  const getConnectionStatus = (userId: number) => {
    const connection = connections.find((c) => c.friend.id === userId);
    
    if (!connection) return null;
    
    if (connection.status === 'accepted') {
      return 'accepted';
    }
    
    // If current user sent the request
    if (connection.is_sender) {
      return 'pending-sent';
    }
    
    // If current user received the request
    return 'pending-received';
  };

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {currentUser?.name}!
          </h1>
          <p className="text-gray-600 mt-2">Discover and connect with professionals</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => {
            const status = getConnectionStatus(user.id);
            
            return (
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

                {/* Dynamic button based on connection status */}
                {!status && (
                  <button
                    onClick={() => handleConnect(user.id)}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Connect
                  </button>
                )}

                {status === 'pending-sent' && (
                  <button
                    disabled
                    className="w-full px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 rounded-md cursor-not-allowed border border-amber-200"
                  >
                    Pending
                  </button>
                )}

                {status === 'pending-received' && (
                  <button
                    disabled
                    className="w-full px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-md cursor-not-allowed border border-blue-200"
                  >
                    Respond in Connections
                  </button>
                )}

                {status === 'accepted' && (
                  <button
                    disabled
                    className="w-full px-4 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-md cursor-not-allowed border border-green-200"
                  >
                    ✓ Connected
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No users to connect with yet.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;