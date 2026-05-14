'use client';

import { useState, useEffect, useRef } from 'react';

type ScrollDirection = 'up' | 'down' | null;

interface UseScrollDirectionOptions {
  threshold?: number;
  throttleMs?: number;
}

export function useScrollDirection({
  threshold = 10,
  throttleMs = 100,
}: UseScrollDirectionOptions = {}): {
  direction: ScrollDirection;
  isAtTop: boolean;
  scrollY: number;
} {
  const [direction, setDirection] = useState<ScrollDirection>(null);
  const [isAtTop, setIsAtTop] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      setTimeout(() => {
        const currentScrollY = window.scrollY;
        const diff = currentScrollY - lastScrollY.current;

        setIsAtTop(currentScrollY < 10);

        if (Math.abs(diff) > threshold) {
          setDirection(diff > 0 ? 'down' : 'up');
        }

        lastScrollY.current = currentScrollY;
        setScrollY(currentScrollY);
        ticking.current = false;
      }, throttleMs);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold, throttleMs]);

  return { direction, isAtTop, scrollY };
}
