import { useAuthStore, useUIStore } from './store';
import { useEffect } from 'react';

const REDIRECT_KEY = 'authRedirect';
const REDIRECT_GUARD_KEY = 'auth_redirect_executed';

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

// Session-scoped guard to prevent repeated redirects during auth bounce.
// Once a redirect has been executed in this tab session, further auth state
// transitions back to 'guest' will NOT re-trigger the redirect.
export function hasRedirectExecuted(): boolean {
  try {
    return sessionStorage.getItem(REDIRECT_GUARD_KEY) === 'true';
  } catch {
    return false;
  }
}

export function markRedirectExecuted(): void {
  try {
    sessionStorage.setItem(REDIRECT_GUARD_KEY, 'true');
  } catch {}
}

export function clearRedirectGuard(): void {
  try {
    sessionStorage.removeItem(REDIRECT_GUARD_KEY);
  } catch {}
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
