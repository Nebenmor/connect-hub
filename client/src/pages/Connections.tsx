import { useState, useEffect } from 'react';
import { connectionsAPI } from '../api/client';
import { Connection } from '../types';
import Navbar from '../components/Navbar';
import ConnectionCard from '../components/ConnectionCard';

const Connections = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      setLoading(true);
      const data = await connectionsAPI.getConnections();
      setConnections(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load connections';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: number) => {
    try {
      await connectionsAPI.acceptConnection(id);
      loadConnections();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to accept connection';
      alert(errorMessage);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await connectionsAPI.deleteConnection(id);
      loadConnections();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reject connection';
      alert(errorMessage);
    }
  };

  const handleRemove = async (id: number) => {
    if (!confirm('Are you sure you want to remove this connection?')) return;
    
    try {
      await connectionsAPI.deleteConnection(id);
      loadConnections();
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

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Connections</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="mb-8">
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
          <div className="mb-8">
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
            Connections ({acceptedConnections.length})
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
            <p className="text-gray-500">No connections yet. Start connecting with others!</p>
          )}
        </div>
      </div>
    </>
  );
};

export default Connections;