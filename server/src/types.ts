// Shared types for the backend

export interface User {
  id: number;
  email: string;
  name: string;
  avatar_url: string | null;
  oauth_provider: string;
  oauth_id: string;
  created_at: Date;
}

export interface Connection {
  id: number;
  user_id: number;
  friend_id: number;
  status: 'pending' | 'accepted';
  created_at: Date;
}

export interface ConnectionWithUser extends Connection {
  friend: User;
}

// Express type extensions
declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      name: string;
      avatar_url: string | null;
    }
  }
}

export interface JWTPayload {
  userId: number;
  email: string;
}