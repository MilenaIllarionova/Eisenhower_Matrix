import { create } from 'zustand';
import { authApi } from '../services/auth';
import { disconnectSocket } from '../services/socket';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isReady: boolean;
  init: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isReady: false,
  init: () => {
    const token = localStorage.getItem('matrix:token');
    const userJson = localStorage.getItem('matrix:user');
    set({
      token,
      user: userJson ? JSON.parse(userJson) : null,
      isReady: true,
    });
  },
  login: async (email, password) => {
    const data = await authApi.login(email, password);
    localStorage.setItem('matrix:token', data.token);
    localStorage.setItem('matrix:user', JSON.stringify(data.user));
    set({ token: data.token, user: data.user });
  },
  register: async (name, email, password) => {
    const data = await authApi.register(name, email, password);
    localStorage.setItem('matrix:token', data.token);
    localStorage.setItem('matrix:user', JSON.stringify(data.user));
    set({ token: data.token, user: data.user });
  },
  logout: () => {
    localStorage.removeItem('matrix:token');
    localStorage.removeItem('matrix:user');
    disconnectSocket();
    set({ token: null, user: null });
  },
}));
