'use client';

import { useEffect, useState, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
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
import { useUIStore } from '@/lib/store';
import { logWatermarkDiagnostic } from '@/lib/watermark-diagnostics';
import { setWatermarkSettings } from '@/lib/image';
import RealtimeBootstrapper from '@/components/providers/RealtimeBootstrapper';


interface ClientLayoutProps {
  children: React.ReactNode;
}

function ClientLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [watermarkReady, setWatermarkReady] = useState(false);

  useEffect(() => {
    patchFedCmWidgetMode();
    logWatermarkDiagnostic();
    fetch('/api/admin/watermark').then(r => r.ok ? r.json() : null).then(j => {
      if (j?.data) {
        console.log('[Watermark] Settings loaded from API:', JSON.stringify({ enabled: j.data.enabled, type: j.data.type, hasLogo: !!j.data.logo_url }));
        setWatermarkSettings(j.data);
      } else {
        console.warn('[Watermark] API returned no data');
      }
    }).catch((err) => {
      console.warn('[Watermark] Failed to load settings — no watermark will be applied:', err);
    }).finally(() => {
      setWatermarkReady(true);
    });

    const onRejection = (event: PromiseRejectionEvent) => {
      console.error('[Unhandled Promise Rejection]', event.reason);
    };
    const onError = (event: ErrorEvent) => {
      console.error('[Uncaught Error]', event.error || event.message);
    };
    window.addEventListener('unhandledrejection', onRejection);
    window.addEventListener('error', onError);
    return () => {
      window.removeEventListener('unhandledrejection', onRejection);
      window.removeEventListener('error', onError);
    };
  }, []);

  // Restore redirect from middleware query params (backup for localStorage)
  useEffect(() => {
    const loginRedirect = searchParams?.get('login_redirect');
    const loginRequired = searchParams?.get('login');
    if (loginRedirect) {
      localStorage.setItem('authRedirect', loginRedirect);
      sessionStorage.setItem('authRedirect', loginRedirect);
    }
    if (loginRequired === 'required') {
      // Clean the URL by removing the query params
      const cleanUrl = window.location.pathname + window.location.search
        .replace(/[?&]login(_redirect=[^&]*|=[^&]*)/g, '')
        .replace(/^&/, '');
      window.history.replaceState(null, '', cleanUrl || window.location.pathname);
      // Open login modal after a brief delay to let auth init
      setTimeout(() => useUIStore.getState().toggleLoginModal(), 500);
    }
  }, [searchParams]);

  const isAdminPage = pathname?.startsWith('/admin');

  const content = (
    <div className="min-h-screen flex flex-col">
      {isAdminPage ? (
        <>{children}</>
      ) : (
        <AuthProvider>
          <GoogleOneTap />
          <Preloader />
          <RealtimeBootstrapper />
          {children}
          <div className="md:hidden h-12" />
          <BottomNav />
          <LoginModal />
          <RegisterModal />
          <LocationModal />
        </AuthProvider>
      )}
      <Toaster position="top-center">
        {(t: any) => {
          const isError = t.type === 'error';
          const isSuccess = t.type === 'success';
          return (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '12px 16px',
                background: '#fff',
                borderRadius: '12px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 6px 16px rgba(0,0,0,0.06)',
                fontSize: '14px',
                color: '#374151',
                width: '100%',
                maxWidth: '420px',
                margin: '0 auto',
                border: '1px solid #f3f4f6',
                borderLeft: `3px solid ${isError ? '#fca5a5' : isSuccess ? '#86efac' : '#e5e7eb'}`,
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
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  color: '#9ca3af',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#6b7280'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9ca3af'; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          );
        }}
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

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <Suspense fallback={null}>
      <ClientLayoutInner>{children}</ClientLayoutInner>
    </Suspense>
  );
}
