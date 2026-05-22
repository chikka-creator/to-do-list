import { create } from 'zustand';
import Cookies from 'js-cookie';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  initFromCookies: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isInitialized: false,

  setAuth: (user, token) => {
    Cookies.set('auth_token', token, { expires: 7 });
    Cookies.set('auth_user', JSON.stringify(user), { expires: 7 });
    set({ user, token, isAuthenticated: true });
  },

  clearAuth: () => {
    Cookies.remove('auth_token');
    Cookies.remove('auth_user');
    set({ user: null, token: null, isAuthenticated: false, isInitialized: true });
  },

  initFromCookies: () => {
    const token = Cookies.get('auth_token');
    const userStr = Cookies.get('auth_user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, token, isAuthenticated: true, isInitialized: true });
        return;
      } catch {
        Cookies.remove('auth_token');
        Cookies.remove('auth_user');
      }
    }
    set({ isInitialized: true });
  },
}));
