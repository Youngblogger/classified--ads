'use client';

import { usePathname } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import LoginModal from '@/components/ui/LoginModal';
import RegisterModal from '@/components/ui/RegisterModal';
import LocationModal from '@/components/ui/LocationModal';
import Preloader from '@/components/ui/Preloader';
import AuthProvider from '@/components/providers/AuthProvider';
import BottomNav from '@/components/ui/BottomNav';
import GoogleOneTap from '@/components/auth/GoogleOneTap';

interface ClientLayoutProps {
  children: React.ReactNode;
  fontFamily: string;
}

export default function ClientLayout({ children, fontFamily }: ClientLayoutProps) {
  const pathname = usePathname();

  const isAdminPage = pathname?.startsWith('/admin');

  if (isAdminPage) {
    return (
      <>
        {children}
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily }}>
      <AuthProvider>
        <Preloader />
        {children}
        <div className="md:hidden h-16" />
        <BottomNav />
        <GoogleOneTap />
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
}
