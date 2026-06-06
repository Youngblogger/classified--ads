'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { SWRConfig } from 'swr';
import { patchFedCmWidgetMode } from '@/lib/fedcm-patch';
import { Toaster, ToastBar, toast } from 'react-hot-toast';
import { X } from 'lucide-react';
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
        position={isAdminPage ? 'top-right' : 'top-center'}
        toastOptions={{
          duration: 3000,
          style: {
            padding: 0,
            margin: 0,
            background: 'transparent',
            boxShadow: 'none',
            width: '100%',
            maxWidth: '100vw',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      >
        {(t: any) => (
          <ToastBar toast={t}>
            {({ icon, message }: { icon: React.ReactNode; message: React.ReactNode }) => (
              <div className={`flex items-start gap-3 px-4 py-3.5 bg-white border-b sm:border sm:rounded-xl sm:shadow-xl border-gray-100 w-full sm:max-w-md sm:mx-auto transition-all duration-300 ${
                t.visible ? 'animate-slide-down' : 'opacity-0 translate-y-[-8px]'
              }`}>
                <div className="flex-shrink-0 mt-0.5">{icon}</div>
                <div className="flex-1 min-w-0 text-sm text-gray-900 font-medium leading-snug">{message}</div>
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="flex-shrink-0 p-1 -mr-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            )}
          </ToastBar>
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
