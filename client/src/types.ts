// Frontend types

export interface User {
  id: number;
  email: string;
  name: string;
  avatar_url: string | null;
  oauth_provider: string;
  created_at: string;
}

export interface Connection {
  id: number;
  status: 'pending' | 'accepted';
  created_at: string;
  is_sender: boolean;
  friend: {
    id: number;
    email: string;
    name: string;
    avatar_url: string | null;
  };
}