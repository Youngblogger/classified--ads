'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const DRAFT_KEY = 'post-ad-draft';
const DRAFT_TTL = 24 * 60 * 60 * 1000;

interface DraftImage {
  name: string;
  type: string;
  size: number;
  base64: string;
}

interface PostAdDraft {
  step: number;
  title: string;
  description: string;
  price: string;
  negotiable: boolean;
  categoryId: number | null;
  categoryBreadcrumb: string;
  locationId: number | null;
  locationBreadcrumb: string;
  selectedStateName: string;
  lgaId: string;
  condition: string;
  phone: string;
  whatsapp: string;
  sameAsPhone: boolean;
  selectedBrand: string;
  selectedModel: string;
  selectedConfig: string;
  attributes: Record<string, any>;
  images: DraftImage[];
  savedAt: number;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getDraft(): PostAdDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as PostAdDraft;
    if (Date.now() - draft.savedAt > DRAFT_TTL) {
      localStorage.removeItem(DRAFT_KEY);
      return null;
    }
    return draft;
  } catch {
    return null;
  }
}

function saveDraft(draft: Partial<PostAdDraft>) {
  if (typeof window === 'undefined') return;
  try {
    const existing = getDraft();
    const merged: PostAdDraft = {
      step: 1,
      title: '',
      description: '',
      price: '',
      negotiable: false,
      categoryId: null,
      categoryBreadcrumb: '',
      locationId: null,
      locationBreadcrumb: '',
      selectedStateName: '',
      lgaId: '',
      condition: '',
      phone: '',
      whatsapp: '',
      sameAsPhone: true,
      selectedBrand: '',
      selectedModel: '',
      selectedConfig: '',
      attributes: {},
      images: [],
      savedAt: Date.now(),
      ...existing,
      ...draft,
      savedAt: Date.now(),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(merged));
  } catch (e) {
    console.warn('Failed to save draft (storage full?):', e);
  }
}

export function clearPostAdDraft() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(DRAFT_KEY);
}

interface UsePostAdDraftReturn {
  draft: PostAdDraft | null;
  hasDraft: boolean;
  restoreDraft: () => void;
  saveDraftText: (data: Partial<Omit<PostAdDraft, 'images'>>) => void;
  saveDraftImages: (images: File[]) => Promise<void>;
  clearDraft: () => void;
}

export function usePostAdDraft(): UsePostAdDraftReturn {
  const [draft, setDraft] = useState<PostAdDraft | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const existing = getDraft();
    if (existing) {
      setDraft(existing);
      setHasDraft(true);
    }
  }, []);

  const restoreDraft = useCallback(() => {
    const existing = getDraft();
    if (existing) {
      setDraft(existing);
      setHasDraft(true);
    }
  }, []);

  const saveDraftText = useCallback((data: Partial<Omit<PostAdDraft, 'images'>>) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      saveDraft(data);
    }, 500);
  }, []);

  const saveDraftImages = useCallback(async (files: File[]) => {
    const existing = getDraft();
    const draftImages: DraftImage[] = [];

    for (const file of files) {
      try {
        const base64 = await fileToBase64(file);
        draftImages.push({
          name: file.name,
          type: file.type,
          size: file.size,
          base64,
        });
      } catch (e) {
        console.warn('Failed to encode image for draft:', e);
      }
    }

    if (draftImages.length > 0 || existing?.images?.length) {
      saveDraft({ images: draftImages.length > 0 ? draftImages : (existing?.images || []) });
    }
  }, []);

  const clearDraft = useCallback(() => {
    clearPostAdDraft();
    setDraft(null);
    setHasDraft(false);
  }, []);

  return {
    draft,
    hasDraft,
    restoreDraft,
    saveDraftText,
    saveDraftImages,
    clearDraft,
  };
}

export { getDraft, saveDraft, PostAdDraft };
