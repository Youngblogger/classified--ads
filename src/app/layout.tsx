import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import LoginModal from '@/components/ui/LoginModal';
import RegisterModal from '@/components/ui/RegisterModal';
import LocationModal from '@/components/ui/LocationModal';
import Preloader from '@/components/ui/Preloader';
import AuthProvider from '@/components/providers/AuthProvider';

export const metadata: Metadata = {
  title: {
    default: 'iList - Your Trusted Classified Marketplace',
    template: '%s | iList',
  },
  description: 'Buy and sell items locally on iList. Find great deals on electronics, vehicles, furniture, and more in your area.',
  keywords: ['classified ads', 'marketplace', 'buy and sell', 'local listings', 'secondhand'],
  authors: [{ name: 'iList Team' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'iList',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <Preloader />
          {children}
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
