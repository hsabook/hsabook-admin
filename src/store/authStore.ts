import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserInfo {
  username: string;
  email: string;
  phone_number: string;
  full_name: string;
  avatar: string | null;
  description: string | null;
  role: string;
  rank: number;
  status: string;
}

interface AuthState {
  accessToken: string | null;
  userInfo: UserInfo | null;
  setAccessToken: (token: string) => void;
  setUserInfo: (info: UserInfo) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

// Explicitly declare the type to avoid TypeScript errors
const createStore: any = create;

export const useAuthStore = createStore(
  persist(
    (set) => ({
      accessToken: null,
      userInfo: null,
      isAuthenticated: false,
      setAccessToken: (token: string) => 
        set({ accessToken: token, isAuthenticated: true }),
      setUserInfo: (info: UserInfo) =>
        set({ userInfo: info }),
      logout: () => 
        set({ accessToken: null, userInfo: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);