// Cookie utilities for client-side
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
}

export function setCookie(name: string, value: string, days: number = 7): void {
  if (typeof document === 'undefined') return;
  
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;max-age=${days * 24 * 60 * 60};SameSite=Lax${isSecure ? ';Secure' : ''}`;
}

export function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  // Delete cookie with all possible attributes
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Strict`;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
}

// Local storage utilities
export function getStorage<T>(key: string): T | null {
  if (typeof localStorage === 'undefined') return null;
  
  const item = localStorage.getItem(key);
  if (!item) return null;
  
  try {
    return JSON.parse(item) as T;
  } catch {
    return null;
  }
}

export function setStorage<T>(key: string, value: T): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function removeStorage(key: string): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(key);
}

// Get auth token - checks both cookie and localStorage
export function getAuthToken(): string | null {
  // First try cookie (check both token and admin_token)
  const token = getCookie('token');
  if (token) return token;
  
  // Check admin_token cookie (set by admin login)
  const adminToken = getCookie('admin_token');
  if (adminToken) return adminToken;
  
  // Fall back to localStorage - check auth-storage (zustand persist)
  if (typeof localStorage !== 'undefined') {
    const authData = localStorage.getItem('auth-storage');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        if (parsed.state?.token) return parsed.state.token;
      } catch {}
    }
    
    // Also check admin_token key (set by admin login page)
    const adminLocalToken = localStorage.getItem('admin_token');
    if (adminLocalToken) return adminLocalToken;
    
    // Also check manual authToken key
    const manualToken = localStorage.getItem('authToken');
    if (manualToken) return manualToken;
  }
  
  return null;
}
