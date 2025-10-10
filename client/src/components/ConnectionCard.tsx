import { Connection } from '../types';

interface ConnectionCardProps {
  connection: Connection;
  onAccept?: (id: number) => void;
  onReject?: (id: number) => void;
  onRemove?: (id: number) => void;
}

const ConnectionCard = ({ connection, onAccept, onReject, onRemove }: ConnectionCardProps) => {
  const { friend, status, is_sender } = connection;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          {friend.avatar_url ? (
            <img
              src={friend.avatar_url}
              alt={friend.name}
              className="h-12 w-12 rounded-full flex-shrink-0"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
              {friend.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900">{friend.name}</h3>
            <p className="text-sm text-gray-600 truncate">{friend.email}</p>
            {status === 'pending' && (
              <p className="text-xs text-gray-500 mt-1">
                {is_sender ? 'Request sent' : 'Pending your response'}
              </p>
            )}
          </div>
        </div>

        <div className="flex space-x-2 sm:flex-shrink-0">
          {status === 'pending' && !is_sender && onAccept && onReject && (
            <>
              <button
                onClick={() => onAccept(connection.id)}
                className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Accept
              </button>
              <button
                onClick={() => onReject(connection.id)}
                className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Reject
              </button>
            </>
          )}

          {((status === 'pending' && is_sender) || status === 'accepted') && onRemove && (
            <button
              onClick={() => onRemove(connection.id)}
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100"
            >
              {status === 'accepted' ? 'Remove' : 'Cancel'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectionCard;