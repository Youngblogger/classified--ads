'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { SWRConfig } from 'swr';
import { patchFedCmWidgetMode } from '@/lib/fedcm-patch';
import { Toaster } from 'react-hot-toast';
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
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            background: '#fff',
            color: '#111827',
            fontSize: '14px',
            padding: '14px 16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />
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
