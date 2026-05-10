'use client';

import { usePathname } from 'next/navigation';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import LoginModal from '@/components/ui/LoginModal';
import RegisterModal from '@/components/ui/RegisterModal';
import LocationModal from '@/components/ui/LocationModal';
import Preloader from '@/components/ui/Preloader';
import AuthProvider from '@/components/providers/AuthProvider';
import BottomNav from '@/components/ui/BottomNav';
import GoogleOneTap from '@/components/auth/GoogleOneTap';

const inter = Inter({ subsets: ['latin'], display: 'swap', weight: ['400', '500', '600', '700', '800'] });
const poppins = Poppins({ subsets: ['latin'], display: 'swap', weight: ['400', '500', '600', '700', '800'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  const isAdminPage = pathname?.startsWith('/admin');
  
  if (isAdminPage) {
    return (
      <html lang="en">
        <head>
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
          <title>iList Admin</title>
        </head>
        <body style={{ fontFamily: inter.style.fontFamily, margin: 0, padding: 0 }}>
          {children}
          <Toaster position="top-right" />
        </body>
      </html>
    );
  }
  
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="csrf-token" content={typeof window !== 'undefined' ? document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' : ''} />
      </head>
      <body className="min-h-screen flex flex-col" style={{ fontFamily: inter.style.fontFamily, margin: 0, padding: 0 }}>
        <AuthProvider>
          <GoogleOneTap />
          <Preloader />
          {children}
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
      </body>
    </html>
  );
}
