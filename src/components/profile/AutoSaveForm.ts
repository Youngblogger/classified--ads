'use client';

import { useEffect, useRef, useCallback } from 'react';

const DEBOUNCE_MS = 2000;
const DRAFT_KEY_PREFIX = 'form_draft_';

export function useAutoSave<T extends Record<string, any>>(
  formKey: string,
  formData: T,
  isActive: boolean = true,
) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>('');

  const saveDraft = useCallback(() => {
    const serialized = JSON.stringify(formData);
    if (serialized === lastSavedRef.current) return;
    try {
      localStorage.setItem(`${DRAFT_KEY_PREFIX}${formKey}`, serialized);
      lastSavedRef.current = serialized;
    } catch {
      // Storage full — silently fail
    }
  }, [formData, formKey]);

  useEffect(() => {
    if (!isActive) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(saveDraft, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [formData, isActive, saveDraft]);

  const restoreDraft = useCallback((): T | null => {
    try {
      const saved = localStorage.getItem(`${DRAFT_KEY_PREFIX}${formKey}`);
      if (saved) {
        lastSavedRef.current = saved;
        return JSON.parse(saved) as T;
      }
    } catch {
      // Ignore parse errors
    }
    return null;
  }, [formKey]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(`${DRAFT_KEY_PREFIX}${formKey}`);
      lastSavedRef.current = '';
    } catch {
      // Ignore
    }
  }, [formKey]);

  return { restoreDraft, clearDraft, saveDraft };
}
