'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useUIStore, useAuthStore } from '@/lib/store';

const DELAYED_PROMPT_DELAY = 15000;
const STORAGE_KEY = 'delayed_auth_prompt_shown';

export function useDelayedAuthPrompt() {
  const { isLoginModalOpen, toggleLoginModal } = useUIStore();
  const { isAuthenticated } = useAuthStore();
  const shown = useRef(false);

  const canShowPrompt = useCallback(() => {
    if (typeof window === 'undefined') return false;
    
    if (isAuthenticated) return false;
    if (isLoginModalOpen) return false;
    if (shown.current) return false;
    if (localStorage.getItem(STORAGE_KEY) === 'true') return false;
    if (localStorage.getItem('google_prompt_dismissed') === 'true') return false;
    
    return true;
  }, [isAuthenticated, isLoginModalOpen]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!canShowPrompt()) return;

    const timer = setTimeout(() => {
      if (canShowPrompt()) {
        shown.current = true;
        localStorage.setItem(STORAGE_KEY, 'true');
        toggleLoginModal();
      }
    }, DELAYED_PROMPT_DELAY);

    return () => clearTimeout(timer);
  }, [canShowPrompt, toggleLoginModal]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleUserActivity = () => {
      if (canShowPrompt()) {
        shown.current = true;
      }
    };

    window.addEventListener('click', handleUserActivity);
    window.addEventListener('scroll', handleUserActivity);

    return () => {
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
    };
  }, [canShowPrompt]);
}

export function resetDelayedAuthPrompt() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('google_prompt_dismissed');
  }
}