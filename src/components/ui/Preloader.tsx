'use client';

import { useEffect } from 'react';

export default function Preloader() {
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = 'https://images.unsplash.com';
    document.head.appendChild(link);

    return () => {
      if (link.parentNode === document.head) {
        document.head.removeChild(link);
      }
    };
  }, []);

  return null;
}
