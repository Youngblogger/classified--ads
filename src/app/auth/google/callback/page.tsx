'use client';

import { useEffect } from 'react';

export const dynamic = 'force-dynamic';

export default function GoogleCallbackPage() {
  useEffect(() => {
    const params = window.location.search;
    window.location.replace(`/auth/callback${params}`);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F7FA' }}>
      <p className="text-sm text-gray-500">Redirecting...</p>
    </div>
  );
}
