'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

interface UseInfiniteScrollOptions {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
  delayMs?: number;
}

export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  threshold = 0.1,
  rootMargin = '200px',
  enabled = true,
  delayMs = 2800,
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [isDelaying, setIsDelaying] = useState(false);
  const lockedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trigger = useCallback(() => {
    if (lockedRef.current) return;
    if (!hasMore || isLoading || !enabled) return;

    lockedRef.current = true;
    setIsDelaying(true);

    timerRef.current = setTimeout(() => {
      setIsDelaying(false);
      onLoadMore();
      lockedRef.current = false;
    }, delayMs);
  }, [onLoadMore, hasMore, isLoading, enabled, delayMs]);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !isLoading && enabled && !lockedRef.current) {
        trigger();
      }
    },
    [trigger, hasMore, isLoading, enabled]
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold,
      rootMargin,
    });

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [handleObserver, threshold, rootMargin]);

  useEffect(() => {
    if (!isLoading) {
      lockedRef.current = false;
    }
  }, [isLoading]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { sentinelRef, isDelaying };
}
