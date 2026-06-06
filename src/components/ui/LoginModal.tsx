'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useUIStore, useAuthStore } from '@/lib/store';
import { authApi } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function LoginModal() {
  const { isLoginModalOpen, toggleRegisterModal, closeAllModals } = useUIStore();
  const [email, setEmail] = useState('');
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

    if (!email || !password) {
      setError('Please fill in all fields');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await authApi.login(email, password);
      const data = (result.data as any)?.data;

      if (!data || !data.user || !data.token) {
        throw new Error('Invalid response from server');
      }

      useAuthStore.getState().login(data.user, data.token);

      if (rememberMe && email) {
        localStorage.setItem('remember-email', email);
      } else {
        localStorage.removeItem('remember-email');
      }

      toast.success('Signed in successfully');
      closeAllModals();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
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

  const brandedRedirect = `${window.location.origin}/auth/callback`;

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: brandedRedirect },
      });

      if (error) {
        if (error.message?.includes('popup')) throw new Error('Popup was blocked. Please allow popups and try again.');
        if (error.message?.includes('cancelled')) throw new Error('Login cancelled. Please try again.');
        throw error;
      }
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Unable to start Google login. Please try again.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google login failed. Please try again.');
      setGoogleLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setFacebookLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: { redirectTo: brandedRedirect },
      });

      if (error) {
        if (error.message?.includes('popup')) throw new Error('Popup was blocked. Please allow popups and try again.');
        if (error.message?.includes('cancelled')) throw new Error('Login cancelled. Please try again.');
        throw error;
      }
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Unable to start Facebook login. Please try again.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Facebook login failed. Please try again.');
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
          <div className="px-5 pt-5 pb-3 border-b border-gray-100">
            <div className="flex items-center justify-center relative">
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900">Sign In</h2>
                <p className="text-sm text-gray-500 mt-0.5">Welcome back to iList</p>
              </div>
              <button onClick={handleClose} className="absolute right-0 p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="px-5 py-4 flex-1 overflow-y-auto">
            {error && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm mb-3 flex items-center gap-2">
                <X className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleEmailLogin} className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 text-sm font-medium border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all text-gray-900 placeholder:text-sm placeholder:font-normal placeholder:text-gray-400 bg-white"
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
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="password" aria-hidden="true" tabIndex={-1} autoComplete="off" className="absolute w-0 h-0 p-0 -z-10" style={{ left: '-9999px', position: 'absolute' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-3 text-sm font-medium border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all text-gray-900 placeholder:text-sm placeholder:font-normal placeholder:text-gray-400 bg-white"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 text-primary-600 rounded border-gray-300 focus:ring-primary-500 cursor-pointer"
                  />
                  <span className="text-gray-600">Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-primary-600 hover:text-primary-700 font-medium text-xs">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : 'Sign In'}
              </button>
            </form>

            <div className="relative my-4">
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
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-medium text-gray-700 w-full mb-2"
            >
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <svg viewBox="0 0 24 24" className="w-4 h-4">
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
              className="flex items-center justify-center gap-1 py-2.5 px-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 w-full mb-3"
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

            <p className="text-center text-sm text-gray-600">
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
