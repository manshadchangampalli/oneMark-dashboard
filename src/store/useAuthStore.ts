import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AdminUser } from '@/types/auth';

interface AuthState {
  admin:           AdminUser | null;
  accessToken:     string | null;
  isAuthenticated: boolean;
  setAuth:         (admin: AdminUser, token: string) => void;
  setToken:        (token: string) => void;
  setAdmin:        (admin: AdminUser) => void;
  clear:           () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      admin:           null,
      accessToken:     null,
      isAuthenticated: false,
      setAuth: (admin, token) => set({ admin, accessToken: token, isAuthenticated: true }),
      setToken: (token)        => set({ accessToken: token }),
      setAdmin: (admin)        => set({ admin }),
      clear:    ()             => set({ admin: null, accessToken: null, isAuthenticated: false }),
    }),
    {
      name: 'dashboard-auth',
      partialize: (s) => ({ admin: s.admin, accessToken: s.accessToken, isAuthenticated: s.isAuthenticated }),
    },
  ),
);
