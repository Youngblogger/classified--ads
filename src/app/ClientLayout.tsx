'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { SWRConfig } from 'swr';
import { mutate as swrMutate } from 'swr';
import { patchFedCmWidgetMode } from '@/lib/fedcm-patch';
import { Toaster } from 'react-hot-toast';
import QueryProvider from '@/providers/QueryProvider';
import LoginModal from '@/components/ui/LoginModal';
import RegisterModal from '@/components/ui/RegisterModal';
import LocationModal from '@/components/ui/LocationModal';
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
    (window as any).__swrMutate = swrMutate;
  }, []);

  const isAdminPage = pathname?.startsWith('/admin');

  const content = isAdminPage ? (
    <>
      {children}
      <Toaster position="top-right" />
    </>
  ) : (
    <div className="min-h-screen flex flex-col">
      <AuthProvider>
        <Preloader />
        {children}
        <div className="md:hidden h-12" />
        <BottomNav />
        <LoginModal />
        <RegisterModal />
        <LocationModal />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '12px',
              padding: '16px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
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
