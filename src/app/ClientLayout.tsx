'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { SWRConfig } from 'swr';
import { patchFedCmWidgetMode } from '@/lib/fedcm-patch';
import { Toaster, toast } from 'react-hot-toast';
import QueryProvider from '@/providers/QueryProvider';
import LoginModal from '@/components/ui/LoginModal';
import RegisterModal from '@/components/ui/RegisterModal';
import LocationModal from '@/components/ui/LocationModal';
import GoogleOneTap from '@/components/auth/GoogleOneTap';
import Preloader from '@/components/ui/Preloader';
import AuthProvider from '@/components/providers/AuthProvider';
import BottomNav from '@/components/ui/BottomNav';


interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();

  useEffect(() => {
    patchFedCmWidgetMode();
  }, []);

  const isAdminPage = pathname?.startsWith('/admin');

  const content = (
    <div className="min-h-screen flex flex-col">
      {isAdminPage ? (
        <>{children}</>
      ) : (
        <AuthProvider>
          <GoogleOneTap />
          <Preloader />
          {children}
          <div className="md:hidden h-12" />
          <BottomNav />
          <LoginModal />
          <RegisterModal />
          <LocationModal />
        </AuthProvider>
      )}
      <Toaster position="top-center">
        {(t: any) => (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '14px 16px',
              background: '#fff',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              fontSize: '14px',
              color: '#111827',
              width: '100%',
              maxWidth: '420px',
              margin: '0 auto',
              opacity: t.visible ? 1 : 0,
              transition: 'all 0.3s ease',
              pointerEvents: 'auto',
            }}
          >
            <div style={{ flex: 1, minWidth: 0, lineHeight: 1.4 }}>{t.message}</div>
            <button
              onClick={() => toast.dismiss(t.id)}
              style={{
                flexShrink: 0,
                padding: '4px',
                margin: '-4px',
                marginRight: '-8px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                borderRadius: '8px',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        )}
      </Toaster>
    </div>
  );

  return (
    <QueryProvider>
      <SWRConfig value={{ dedupingInterval: 5000, errorRetryCount: 2 }}>
        {content}
      </SWRConfig>
    </QueryProvider>
  );
}
