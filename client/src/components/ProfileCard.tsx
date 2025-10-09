import { User } from '../types';

interface ProfileCardProps {
  user: User;
}

const ProfileCard = ({ user }: ProfileCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center space-x-6 mb-6">
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.name}
            className="h-24 w-24 rounded-full"
          />
        ) : (
          <div className="h-24 w-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
          <p className="text-gray-600">{user.email}</p>
        </div>
      </div>

      <div className="border-t pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="mt-1 text-gray-900">{user.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Member Since</p>
            <p className="mt-1 text-gray-900">
              {new Date(user.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">OAuth Provider</p>
            <p className="mt-1 text-gray-900 capitalize">{user.oauth_provider}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;