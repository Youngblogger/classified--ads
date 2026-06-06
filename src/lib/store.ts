import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, AuthState } from '@/types';
import { setCookie } from './cookies';
import { normalizeReviewerName } from './reviewerName';

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
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('just_logged_out');
        }
        setCookie('token', token, 7);
        
        set({ user, token, isAuthenticated: true, isLoading: false, hasHydrated: true });
      },
      
      logout: () => {
        if (typeof window !== 'undefined') {
          document.cookie = 'token=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax';
          document.cookie = 'ilist-supabase-auth-token=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax';
          
          localStorage.removeItem('user-auth-storage');
          localStorage.removeItem('authToken');
          localStorage.removeItem('ilist-supabase-auth');
          localStorage.removeItem('ilist-supabase-auth-code-verifier');
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
          const { authApi } = await import('./api');
          const result = await authApi.me();
          const userData = result?.data?.data || result?.data;
          if (userData?.id) {
            set({ user: userData });
          }
        } catch (e) {
          console.error('[Auth Store] refreshUser failed:', e);
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
        if (!state) return;

        // CRITICAL: If AuthProvider already established a valid session during
        // this page load, don't let stale persisted state overwrite it.
        // This prevents the race where getSession() resolves before persist
        // finishes rehydrating, then rehydration overwrites the auth state.
        const currentState = useAuthStore.getState();
        if (currentState.isAuthenticated && currentState.token) {
          // Signal hydration complete so AuthProvider can proceed
          currentState.setHasHydrated(true);
          return;
        }

        if (state.token) {
          try {
            const payload = JSON.parse(atob(state.token.split('.')[1]));
            if (payload.exp && payload.exp * 1000 < Date.now()) {
              useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
            }
          } catch {}
        }
        const raw = state.user;
        if (raw) {
          let user = { ...raw };
          let changed = false;
          if (normalizeReviewerName(user.name) !== user.name) {
            user.name = normalizeReviewerName(user.name);
            changed = true;
          }
          if (changed) useAuthStore.setState({ user });
        }
        state.setHasHydrated(true);
      },
    }
  )
);

// Export a function to get auth state directly
export const getAuthState = () => useAuthStore.getState();

// Resolves once Zustand persist finishes hydrating.
// Used by AuthProvider to avoid racing with persist rehydration.
let _hydrationResolve: (() => void) | null = null;
export const hydrationComplete = new Promise<void>((resolve) => {
  _hydrationResolve = resolve;
});

// Subscribe to the store and resolve the promise once hydrated
function onHydrated() {
  const resolve = _hydrationResolve;
  if (resolve) {
    _hydrationResolve = null;
    resolve();
  }
}
const unsubHydrate = useAuthStore.subscribe((state) => {
  if (state.hasHydrated) {
    unsubHydrate();
    onHydrated();
  }
});
// If already hydrated (e.g. re-render), resolve immediately
if (useAuthStore.getState().hasHydrated) {
  unsubHydrate();
  onHydrated();
}

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
