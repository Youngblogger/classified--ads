'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, AlertCircle, Eye, EyeOff, Lock, Mail, LogOut } from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@ilist.com');
  const [password, setPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [alreadyAuthenticated, setAlreadyAuthenticated] = useState(false);
  const [attemptsInfo, setAttemptsInfo] = useState<string | null>(null);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('admin_token');
      const user = localStorage.getItem('admin_user');
      
      if (token && user) {
        try {
          const userData = JSON.parse(user);
          if (userData.role === 'admin') {
            setAlreadyAuthenticated(true);
            redirectTimerRef.current = setTimeout(() => {
              router.replace('/admin/ads-moderation');
            }, 2000);
            return;
          }
        } catch {}
      }
      setCheckingAuth(false);
    };

    checkAuth();

    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, [router]);

  const handleClearAuth = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin-auth-storage');
    if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    setAlreadyAuthenticated(false);
    setCheckingAuth(false);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-950 to-black">
        <div className="text-center">
          <Shield className="w-12 h-12 text-red-400 animate-pulse mx-auto" />
          <p className="text-gray-400 mt-4">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (alreadyAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-950 to-black">
        <div className="text-center max-w-md px-6">
          <Shield className="w-14 h-14 text-green-400 mx-auto" />
          <h2 className="text-xl font-bold text-white mt-4">Already Logged In</h2>
          <p className="text-gray-400 mt-2">You are already authenticated as admin. Redirecting to dashboard...</p>
          <div className="mt-6 flex gap-3 justify-center">
            <button
              onClick={() => router.replace('/admin/ads-moderation')}
              className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors"
            >
              Go to Dashboard
            </button>
            <button
              onClick={handleClearAuth}
              className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold rounded-xl transition-colors inline-flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Login as Different Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-950 to-black">
        <div className="text-center">
          <Shield className="w-12 h-12 text-red-400 animate-pulse mx-auto" />
          <p className="text-gray-400 mt-4">Verifying access...</p>
        </div>
      </div>
    );
  }

  const hashSecret = async (secret: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(secret);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAttemptsInfo(null);
    setLoading(true);

    try {
      const hashedSecret = secretKey ? await hashSecret(secretKey) : '';

      const response = await api.post('/secure-control-9ja/auth/login', {
        login: email,
        password: password,
        admin_secret: hashedSecret || undefined,
      });

      const resData = response?.data || response;
      const success = !!(resData?.success || resData?.token);
      const token = resData?.token || resData?.access_token || '';
      const user = resData?.user || null;

      if (success && token && user) {
        localStorage.setItem('admin_token', token);
        localStorage.setItem('admin_user', JSON.stringify(user));
        localStorage.setItem('admin-auth-storage', JSON.stringify({
          state: { user, token, isAuthenticated: true, isLoading: false, hasHydrated: true },
          version: 0
        }));
        
        router.replace('/admin/ads-moderation');
        return;
      }

      const errMsg = resData?.message || resData?.error || 'Login failed. Please try again.';
      const errCode = resData?.error_code || '';
      const retryAfter = resData?.retry_after;
      const attemptsRemaining = resData?.attempts_remaining;

      if (errCode === 'IP_NOT_ALLOWED') {
        setError('Access denied: Your IP address is not authorized.');
      } else if (errCode === 'INVALID_SECRET_KEY') {
        setError('Invalid admin secret key.');
      } else if (errCode === 'RATE_LIMITED' || retryAfter) {
        const minutes = Math.ceil((retryAfter || 60) / 60);
        setError(`Too many attempts. Please try again in ${minutes} minute(s).`);
      } else if (errMsg?.includes('Invalid credentials') || errMsg?.includes('Invalid admin credentials')) {
        setError(attemptsRemaining !== undefined 
          ? `Incorrect email or password. ${attemptsRemaining} attempt(s) remaining.`
          : 'Incorrect email or password');
      } else if (response?.status === 403 || response?.status === 401) {
        setError(errMsg || 'Access denied. Admin privileges required.');
      } else {
        setError(errMsg);
      }
    } catch (err: any) {
      const errData = err?.response?.data || err?.data || {};
      const errMsg = errData?.message || err?.message || 'Login failed. Please try again.';
      const retryAfter = errData?.retry_after;
      const attemptsRemaining = errData?.attempts_remaining;
      const errCode = errData?.error_code || '';

      if (errCode === 'RATE_LIMITED' || retryAfter) {
        const minutes = Math.ceil((retryAfter || 60) / 60);
        setError(`Too many attempts. Please try again in ${minutes} minute(s).`);
      } else if (errMsg?.includes('Invalid credentials') || errMsg?.includes('Invalid admin credentials')) {
        setError(attemptsRemaining !== undefined 
          ? `Incorrect email or password. ${attemptsRemaining} attempt(s) remaining.`
          : 'Incorrect email or password');
      } else if (err?.response?.status === 403 || err?.response?.status === 401) {
        setError(errMsg || 'Access denied. Admin privileges required.');
      } else {
        setError(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-950 to-black p-4">
      <div
        className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500"
      >
        <div className="rounded-2xl shadow-2xl border border-gray-800 bg-gray-900/60 backdrop-blur overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-3">
                <div className="p-3 rounded-full bg-red-500/10 border border-red-500/30">
                  <Lock className="w-8 h-8 text-red-400" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
              <p className="text-gray-400 text-sm mt-1">Secure login required</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              {error && (
                <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Admin email"
                  required
                  disabled={loading}
                  autoComplete="off"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Password"
                  required
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <input
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Admin Secret Key (optional)"
                disabled={loading}
                autoComplete="off"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Login to Dashboard
                  </>
                )}
              </button>
            </form>

            <p className="text-xs text-gray-500 text-center mt-6">
              Unauthorized access is strictly prohibited
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
