'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined') {
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
        // Validate token with backend
        fetch('http://127.0.0.1:8000/api/auth/me', {
          headers: { Authorization: `Bearer ${tokenToRestore}` }
        })
        .then(res => {
          if (!res.ok) throw new Error('Invalid token');
          return res.json();
        })
        .then(userData => {
          useAuthStore.getState().login(userData, tokenToRestore);
        })
        .catch(() => {
          // Token invalid - clear auth data
          useAuthStore.getState().logout();
        });
      }
    }
  }, []);

  if (!mounted) {
    return null;
  }

  return <>{children}</>;
}
