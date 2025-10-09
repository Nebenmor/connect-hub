import axios from 'axios';
import { User, Connection } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with credentials
const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true, // Important for cookies
});

// Auth API
export const authAPI = {
  getGoogleAuthUrl: () => `${API_URL}/api/auth/google`,
  
  getCurrentUser: async (): Promise<User> => {
    const { data } = await api.get('/auth/me');
    return data;
  },
  
  logout: async () => {
    await api.post('/auth/logout');
  },
};

// Users API
export const usersAPI = {
  getAllUsers: async (): Promise<User[]> => {
    const { data } = await api.get('/users');
    return data;
  },
  
  getUserById: async (id: number): Promise<User> => {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },
  
  updateProfile: async (name: string, avatar_url?: string): Promise<User> => {
    const { data } = await api.put('/users/me', { name, avatar_url });
    return data;
  },
};

// Connections API
export const connectionsAPI = {
  getConnections: async (): Promise<Connection[]> => {
    const { data } = await api.get('/connections');
    return data;
  },
  
  sendConnectionRequest: async (userId: number): Promise<Connection> => {
    const { data } = await api.post(`/connections/${userId}`);
    return data;
  },
  
  acceptConnection: async (connectionId: number): Promise<Connection> => {
    const { data } = await api.put(`/connections/${connectionId}/accept`);
    return data;
  },
  
  deleteConnection: async (connectionId: number): Promise<void> => {
    await api.delete(`/connections/${connectionId}`);
  },
};

export default api;