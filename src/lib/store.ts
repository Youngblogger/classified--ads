import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, AuthState } from '@/types';
import { setCookie } from './cookies';

interface AuthStore extends AuthState {
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  _hasHydrated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  updateAuth: (data: Partial<AuthState>) => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      hasHydrated: false,
      _hasHydrated: false,
      
      setHasHydrated: (state) => set({ hasHydrated: state }),
      
      login: (user, token) => {
        // Set cookie with 24h max-age (matches token expiration), secure flags
        setCookie('token', token, 1);
        
        set({ user, token, isAuthenticated: true, isLoading: false, hasHydrated: true });
      },
      
      logout: () => {
        if (typeof window !== 'undefined') {
          // Only clear USER auth cookies — NEVER touch admin tokens
          document.cookie = 'token=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
          
          localStorage.removeItem('user-auth-storage');
          localStorage.removeItem('authToken');
          sessionStorage.setItem('just_logged_out', 'true');
        }
        
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      },
      
      setUser: (user) => {
        set({ user });
      },
      
      setLoading: (isLoading) => set({ isLoading }),
      
      updateAuth: (data) => set(data),
      
      refreshUser: async () => {
        try {
          const { default: axios } = await import('axios');
          const { getCookie } = await import('./cookies');
          const token = getCookie('token') || get()?.token;
          if (!token) return;
          const res = await axios.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          });
          const userData = res.data?.data || res.data?.user || res.data;
          if (userData && userData.id) {
            set({ user: userData });
          }
        } catch {
          // ignore refresh errors
        }
      },
    }),
    {
      name: 'user-auth-storage',
      partialize: (state) => ({ 
        token: state.token, 
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        hasHydrated: state.hasHydrated
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          try {
            const payload = JSON.parse(atob(state.token.split('.')[1]));
            if (payload.exp && payload.exp * 1000 < Date.now()) {
              state.set({ user: null, token: null, isAuthenticated: false });
            }
          } catch {}
        }
        if (state?.user?.id && typeof state.user.id === 'string') {
          const numId = Math.abs(
            (state.user.id as string).split('').reduce((h, c) => ((h << 5) + h + c.charCodeAt(0)) | 0, 5381)
          ) || 1;
          state.set({ user: { ...state.user, id: numId } });
        }
        state?.setHasHydrated(true);
      },
    }
  )
);

// Export a function to get auth state directly
export const getAuthState = () => useAuthStore.getState();

// Global store for categories and locations
interface NotificationItem {
  id?: number;
  type: string;
  title: string;
  message: string;
  data?: any;
  is_read?: boolean;
  created_at?: string;
}

interface GlobalStore {
  categories: any[];
  locations: any[];
  notifications: NotificationItem[];
  unreadNotifications: number;
  selectedLocation: any | null;
  setCategories: (categories: any[]) => void;
  setLocations: (locations: any[]) => void;
  setNotifications: (notifications: NotificationItem[]) => void;
  addNotification: (notification: NotificationItem) => void;
  setUnreadNotifications: (count: number) => void;
  incrementUnread: () => void;
  setSelectedLocation: (location: any | null) => void;
}

export const useGlobalStore = create<GlobalStore>()(
  persist(
    (set) => ({
      categories: [],
      locations: [],
      notifications: [],
      unreadNotifications: 0,
      selectedLocation: null,
      
      setCategories: (categories) => set({ categories }),
      setLocations: (locations) => set({ locations }),
      setNotifications: (notifications) => set({ notifications }),
      addNotification: (notification) => set((state) => ({
        notifications: [notification, ...state.notifications],
        unreadNotifications: state.unreadNotifications + 1,
      })),
      setUnreadNotifications: (unreadNotifications) => set({ unreadNotifications }),
      incrementUnread: () => set((state) => ({ unreadNotifications: state.unreadNotifications + 1 })),
      setSelectedLocation: (selectedLocation) => set({ selectedLocation }),
    }),
    {
      name: 'ilist-global-storage',
      partialize: (state) => ({ selectedLocation: state.selectedLocation } as GlobalStore),
      storage: typeof window !== 'undefined' ? createJSONStorage(() => sessionStorage) : undefined,
    }
  )
);

// UI Store for modals and sidebars
interface UIStore {
  isMobileMenuOpen: boolean;
  isSearchOpen: boolean;
  isLocationModalOpen: boolean;
  isLoginModalOpen: boolean;
  isRegisterModalOpen: boolean;
  toggleMobileMenu: () => void;
  toggleSearch: () => void;
  toggleLocationModal: () => void;
  toggleLoginModal: () => void;
  toggleRegisterModal: () => void;
  closeAllModals: () => void;
}

export const useUIStore = create<UIStore>()((set) => ({
  isMobileMenuOpen: false,
  isSearchOpen: false,
  isLocationModalOpen: false,
  isLoginModalOpen: false,
  isRegisterModalOpen: false,
  
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  toggleLocationModal: () => set((state) => ({ isLocationModalOpen: !state.isLocationModalOpen })),
  toggleLoginModal: () => set((state) => ({ isLoginModalOpen: !state.isLoginModalOpen, isRegisterModalOpen: false })),
  toggleRegisterModal: () => set((state) => ({ isRegisterModalOpen: !state.isRegisterModalOpen, isLoginModalOpen: false })),
  closeAllModals: () => set({ 
    isMobileMenuOpen: false, 
    isSearchOpen: false, 
    isLocationModalOpen: false, 
    isLoginModalOpen: false, 
    isRegisterModalOpen: false 
  }),
}));
