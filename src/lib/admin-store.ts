import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthState } from '@/types';
import { setCookie } from './cookies';

interface AdminAuthStore extends AuthState {
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  login: (admin: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
}

export const useAdminAuthStore = create<AdminAuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      hasHydrated: false,

      setHasHydrated: (state) => set({ hasHydrated: state }),

      login: (admin, token) => {
        setCookie('admin_token', token, 1);
        set({ user: admin, token, isAuthenticated: true, isLoading: false, hasHydrated: true });
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          document.cookie = 'admin_token=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
          localStorage.removeItem('admin-auth-storage');
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
          localStorage.removeItem('admin_last_activity');
        }
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      },

      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'admin-auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        hasHydrated: state.hasHydrated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export const getAdminAuthState = () => useAdminAuthStore.getState();
