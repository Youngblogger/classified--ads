'use client';

import { usePathname } from 'next/navigation';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import LoginModal from '@/components/ui/LoginModal';
import RegisterModal from '@/components/ui/RegisterModal';
import LocationModal from '@/components/ui/LocationModal';
import Preloader from '@/components/ui/Preloader';
import AuthProvider from '@/components/providers/AuthProvider';
import BottomNav from '@/components/ui/BottomNav';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Check if we're on an admin page
  const isAdminPage = pathname?.startsWith('/admin');
  
  // For admin pages, render without frontend-specific components
  if (isAdminPage) {
    return (
      <html lang="en">
        <head>
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
          <title>iList Admin</title>
        </head>
        <body style={{ fontFamily: 'Inter, system-ui, sans-serif', margin: 0, padding: 0 }}>
          {children}
          <Toaster position="top-right" />
        </body>
      </html>
    );
  }
  
  // For frontend pages, render with all modals and components
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen flex flex-col" style={{ fontFamily: 'Inter, system-ui, sans-serif', margin: 0, padding: 0 }}>
        <AuthProvider>
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
