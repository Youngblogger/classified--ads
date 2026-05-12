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

// Get user auth token - ONLY checks user token sources
export function getUserToken(): string | null {
  const token = getCookie('token');
  if (token) return token;

  if (typeof localStorage !== 'undefined') {
    const authData = localStorage.getItem('user-auth-storage');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        if (parsed.state?.token) return parsed.state.token;
      } catch {}
    }
    const manualToken = localStorage.getItem('authToken');
    if (manualToken) return manualToken;
  }

  return null;
}

// Get admin auth token - ONLY checks admin token sources
export function getAdminToken(): string | null {
  const adminToken = getCookie('admin_token');
  if (adminToken) return adminToken;

  if (typeof localStorage !== 'undefined') {
    const adminData = localStorage.getItem('admin-auth-storage');
    if (adminData) {
      try {
        const parsed = JSON.parse(adminData);
        if (parsed.state?.token) return parsed.state.token;
      } catch {}
    }
    const adminLocalToken = localStorage.getItem('admin_token');
    if (adminLocalToken) return adminLocalToken;
  }

  return null;
}

// User-only token: never falls back to admin_token
export function getAuthToken(): string | null {
  return getUserToken();
}
