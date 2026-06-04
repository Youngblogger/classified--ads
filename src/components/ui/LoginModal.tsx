'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Mail, Lock, Eye, EyeOff, CheckCircle, Loader2 } from 'lucide-react';
import { useUIStore, useAuthStore } from '@/lib/store';
import { authApi } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

function hasStoredToken(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const authStorage = localStorage.getItem('user-auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      if (parsed?.state?.token) return true;
    }
  } catch {}
  return false;
}

export default function LoginModal({ forceRedirectUrl }: { forceRedirectUrl?: string } = {}) {
  const router = useRouter();
  const { isLoginModalOpen, toggleLoginModal, toggleRegisterModal, closeAllModals } = useUIStore();
  const { isAuthenticated, login, setLoading, hasHydrated } = useAuthStore();
  const [email, setEmail] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('/');

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        if (forceRedirectUrl && forceRedirectUrl !== '/') {
          setRedirectUrl(forceRedirectUrl);
          localStorage.setItem('authRedirect', forceRedirectUrl);
          sessionStorage.setItem('authRedirect', forceRedirectUrl);
          return;
        }
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect');
        if (redirect) {
          setRedirectUrl(redirect);
          localStorage.setItem('authRedirect', redirect);
          sessionStorage.setItem('authRedirect', redirect);
        } else {
          const storedRedirect = localStorage.getItem('authRedirect') || sessionStorage.getItem('authRedirect');
          if (storedRedirect) {
            setRedirectUrl(storedRedirect);
          }
        }
      }
    } catch (e) {}
  }, [forceRedirectUrl]);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | React.ReactNode>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);
  
  const [usedEmails, setUsedEmails] = useState<string[]>([]);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const savedEmails = localStorage.getItem('used-emails');
    if (savedEmails) setUsedEmails(JSON.parse(savedEmails));
    
    const savedRememberEmail = localStorage.getItem('remember-email');
    if (savedRememberEmail) {
      setEmail(savedRememberEmail);
      setRememberMe(true);
    }
  }, []);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setIsSubmitting(false);
      setLoading(false);
      return;
    }

    if (typeof window !== 'undefined' && redirectUrl) {
      localStorage.setItem('authRedirect', redirectUrl);
      sessionStorage.setItem('authRedirect', redirectUrl);
    }

    try {
      const result = await authApi.login(email, password);
      const data = (result.data as any)?.data;

      if (!data || !data.user || !data.token) {
        throw new Error('Invalid response from server');
      }

      login(data.user, data.token);

      const storedRedirect = localStorage.getItem('authRedirect') || sessionStorage.getItem('authRedirect');
      closeAllModals();
      if (storedRedirect && storedRedirect !== window.location.pathname) {
        localStorage.removeItem('authRedirect');
        sessionStorage.removeItem('authRedirect');
        router.push(storedRedirect);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setError('');
  };

  const handleClose = () => {
    closeAllModals();
    resetForm();
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');

    try {
      if (redirectUrl) {
        localStorage.setItem('authRedirect', redirectUrl);
        sessionStorage.setItem('authRedirect', redirectUrl);
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No redirect URL received');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google login failed');
      setGoogleLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setFacebookLoading(true);
    setError('');

    try {
      if (redirectUrl) {
        localStorage.setItem('authRedirect', redirectUrl);
        sessionStorage.setItem('authRedirect', redirectUrl);
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: { redirectTo: `${window.location.origin}/auth/facebook/callback` },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No redirect URL received');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Facebook login failed');
      setFacebookLoading(false);
    }
  };

  if (!isLoginModalOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center"
        onClick={handleClose}
      >
      <div 
        className="bg-white w-full h-full md:w-[90%] md:max-w-md md:max-h-[95vh] md:rounded-2xl flex flex-col z-[201] md:shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
          <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 px-4 py-4 md:px-6 md:py-5">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">Welcome Back!</h2>
                <p className="text-primary-100 text-sm mt-1">Sign in to continue to iList</p>
              </div>
              <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          <div className="p-4 md:p-6 flex-1 overflow-y-auto">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm mb-4 flex items-center gap-2">
                <X className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-base font-semibold text-gray-800 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-14 pr-5 py-4 text-lg font-medium border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all text-gray-900 placeholder:text-base placeholder:font-normal placeholder:text-gray-400 bg-white"
                    style={{ height: '60px' }}
                    required
                    autoComplete="email"
                    list="email-suggestions"
                  />
                  <datalist id="email-suggestions">
                    {usedEmails.map((e: string) => (
                      <option key={e} value={e} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-800 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                  {/* Dummy hidden input to trap browser autofill */}
                  <input type="password" aria-hidden="true" tabIndex={-1} autoComplete="off" className="absolute w-0 h-0 p-0 -z-10" style={{ left: '-9999px', position: 'absolute' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-14 pr-14 py-4 text-lg font-medium border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all text-gray-900 placeholder:text-base placeholder:font-normal placeholder:text-gray-400 bg-white"
                    style={{ height: '60px' }}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500 cursor-pointer" 
                  />
                  <span className="text-gray-600">Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-primary-600 hover:text-primary-700 font-medium">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Sign In
              </button>
            </form>

            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white text-xs text-gray-500">Or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-medium text-gray-700 w-full mb-3"
            >
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Continue with Google
            </button>

            <button 
              onClick={handleFacebookLogin}
              disabled={facebookLoading}
              className="flex items-center justify-center gap-1 py-2 px-3 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 w-full mb-4"
            >
              {facebookLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <svg viewBox="0 0 24 24" className="w-4 h-4">
                  <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              )}
              Continue with Facebook
            </button>

            <p className="text-center mt-4 text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <button
                onClick={() => {
                  closeAllModals();
                  toggleRegisterModal();
                }}
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                Sign up free
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
