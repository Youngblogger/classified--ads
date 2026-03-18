import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthState, Category, Location, Notification } from '@/types';
import { getCookie, setCookie, deleteCookie } from './cookies';

interface AuthStore extends AuthState {
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      
      login: (user, token) => {
        setCookie('token', token, 7);
        set({ user, token, isAuthenticated: true, isLoading: false });
      },
      
      logout: () => {
        // Clear ALL possible storage locations
        if (typeof window !== 'undefined') {
          // Clear cookies - try multiple approaches
          const cookies = document.cookie.split(';');
          for (let cookie of cookies) {
            const cookieName = cookie.trim().split('=')[0];
            document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Strict`;
            document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          }
          
          // Clear localStorage completely
          localStorage.clear();
          
          // Clear sessionStorage
          sessionStorage.clear();
        }
        
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      },
      
      setUser: (user) => set({ user }),
      
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token, 
        user: state.user ? {
          ...state.user,
          avatar: state.user.avatar,
          avatar_url: state.user.avatar_url || state.user.avatar,
        } : null, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

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
  categories: Category[];
  locations: Location[];
  notifications: NotificationItem[];
  unreadNotifications: number;
  selectedLocation: Location | null;
  setCategories: (categories: Category[]) => void;
  setLocations: (locations: Location[]) => void;
  setNotifications: (notifications: NotificationItem[]) => void;
  addNotification: (notification: NotificationItem) => void;
  setUnreadNotifications: (count: number) => void;
  incrementUnread: () => void;
  setSelectedLocation: (location: Location | null) => void;
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
      partialize: (state) => ({ selectedLocation: state.selectedLocation }),
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
