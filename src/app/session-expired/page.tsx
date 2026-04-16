'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Shield, Loader2 } from 'lucide-react';

export default function SessionExpiredPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(3);
  const [isAdmin] = useState(searchParams.get('admin') === 'true');

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push(isAdmin ? '/admin/login' : '/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, isAdmin]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center p-8 max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-6">
          <Shield className="w-10 h-10 text-slate-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Session Expired
        </h1>
        
        <p className="text-slate-600 mb-6">
          Please wait...
        </p>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
            <span className="text-slate-700 font-medium">
              Redirecting in {countdown}...
            </span>
          </div>
          
          <p className="text-slate-500 text-sm mb-4">
            Complete your login below
          </p>
          
          <Link
            href={isAdmin ? '/admin/login' : '/login'}
            className="inline-block w-full py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium transition-colors"
          >
            Continue to Login
          </Link>
        </div>
        
        <p className="text-slate-400 text-sm mt-6">
          Redirecting automatically...
        </p>
      </div>
    </div>
  );
}
