'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ResponsiveHeader from '@/components/home/ResponsiveHeader';
import Footer from '@/components/layout/Footer';
import LoginModal from '@/components/ui/LoginModal';
import { useUIStore, useAuthStore } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const urlRedirect = searchParams.get('redirect') || '/';
  const redirectUrl = typeof window !== 'undefined' ? (localStorage.getItem('authRedirect') || sessionStorage.getItem('authRedirect') || urlRedirect) : urlRedirect;
  const [mounted, setMounted] = useState(false);
  const { toggleLoginModal, isLoginModalOpen } = useUIStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) {
      toggleLoginModal();
      if (typeof window !== 'undefined' && urlRedirect) {
        localStorage.setItem('authRedirect', urlRedirect);
        sessionStorage.setItem('authRedirect', urlRedirect);
      }
    } else {
      const redirect = localStorage.getItem('authRedirect') || sessionStorage.getItem('authRedirect') || '/';
      localStorage.removeItem('authRedirect');
      sessionStorage.removeItem('authRedirect');
      router.push(redirect);
    }
  }, []);

  useEffect(() => {
    if (mounted && isAuthenticated) {
      const redirect = localStorage.getItem('authRedirect') || sessionStorage.getItem('authRedirect') || '/';
      localStorage.removeItem('authRedirect');
      sessionStorage.removeItem('authRedirect');
      router.push(redirect);
    }
  }, [isAuthenticated, mounted, router]);

  const handleModalClose = () => {
    router.push('/');
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <ResponsiveHeader />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
            <p className="text-gray-600 mb-4">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <ResponsiveHeader />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <p className="text-gray-600 mb-4">Please wait...</p>
          <p className="text-sm text-gray-500">Complete your login below</p>
        </div>
      </main>
      <Footer />
      <LoginModal forceRedirectUrl={redirectUrl} />
    </div>
  );
}
