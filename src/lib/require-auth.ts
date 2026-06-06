import { useAuthStore, useUIStore } from './store';
import { useEffect } from 'react';

const REDIRECT_KEY = 'authRedirect';

export function saveRedirectPath(path?: string) {
  const target = path || (typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/');
  try {
    localStorage.setItem(REDIRECT_KEY, target);
    sessionStorage.setItem(REDIRECT_KEY, target);
  } catch {}
}

export function clearRedirectPath() {
  try {
    localStorage.removeItem(REDIRECT_KEY);
    sessionStorage.removeItem(REDIRECT_KEY);
  } catch {}
}

export function getRedirectPath(): string | null {
  try {
    return localStorage.getItem(REDIRECT_KEY) || sessionStorage.getItem(REDIRECT_KEY);
  } catch {
    return null;
  }
}

export function consumeRedirectPath(fallback = '/'): string {
  const path = getRedirectPath();
  clearRedirectPath();
  return path || fallback;
}

export function requireAuth(redirectPath?: string): boolean {
  const { isAuthenticated, hasHydrated } = useAuthStore.getState();

  if (!hasHydrated) return false;
  if (isAuthenticated) return true;

  saveRedirectPath(redirectPath);
  useUIStore.getState().toggleLoginModal();
  return false;
}

export function useRequireAuth(redirectPath?: string): boolean {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      saveRedirectPath(redirectPath);
      useUIStore.getState().toggleLoginModal();
    }
  }, [hasHydrated, isAuthenticated, redirectPath]);

  return isAuthenticated;
}
