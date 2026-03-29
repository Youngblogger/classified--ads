'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function setCookie(name: string, value: string, days: number) {
  if (typeof document === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined') {
      // Store referrer from URL to cookie
      const urlParams = new URLSearchParams(window.location.search);
      const refCode = urlParams.get('ref');
      if (refCode && !getCookie('referrer')) {
        setCookie('referrer', refCode, 30); // Store for 30 days
      }

      // Check if user just logged out - don't auto restore
      const justLoggedOut = sessionStorage.getItem('just_logged_out');
      if (justLoggedOut === 'true') {
        sessionStorage.removeItem('just_logged_out');
        return;
      }
      
      const authStorage = localStorage.getItem('auth-storage');
      let zustandAuth = null;
      if (authStorage) {
        try {
          zustandAuth = JSON.parse(authStorage);
        } catch (e) {
          console.error('Failed to parse auth-storage:', e);
        }
      }

      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');
      
      let tokenToRestore = null;
      let userToRestore = null;
      
      if (zustandAuth?.state?.token && zustandAuth?.state?.user) {
        tokenToRestore = zustandAuth.state.token;
        userToRestore = zustandAuth.state.user;
      } else if (storedToken && storedUser) {
        tokenToRestore = storedToken;
        userToRestore = JSON.parse(storedUser);
      }

      if (tokenToRestore && userToRestore) {
        // Validate token with backend and get fresh user data including avatar
        fetch('http://127.0.0.1:8000/api/auth/me', {
          headers: { Authorization: `Bearer ${tokenToRestore}` }
        })
        .then(res => {
          if (!res.ok) throw new Error('Invalid token');
          return res.json();
        })
        .then(userData => {
          // Merge with any additional fields needed
          const freshUser = {
            ...userData,
            full_avatar_url: userData.full_avatar_url || 
              (userData.avatar ? `http://127.0.0.1:8000/storage/${userData.avatar}` : null) ||
              userData.google_avatar ||
              userData.facebook_avatar,
          };
          useAuthStore.getState().login(freshUser, tokenToRestore);
        })
        .catch(() => {
          // Token invalid - clear auth data
          useAuthStore.getState().logout();
        });
      }
    }
  }, []);

  return <>{children}</>;
}
