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

export const useAuthStore = create<AuthState>()(
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