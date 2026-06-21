'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Mail, Lock, Eye, EyeOff, CheckCircle, Loader2, Search, Plus, Shield } from 'lucide-react';
import { useUIStore, useAuthStore } from '@/lib/store';
import { authApi } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import OtpModal from './OtpModal';
import toast from 'react-hot-toast';

export default function RegisterModal() {
  const { isRegisterModalOpen, toggleLoginModal, closeAllModals } = useUIStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [googleLoading, setGoogleLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingPhone, setPendingPhone] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password || !confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!agreeTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    setIsSubmitting(true);

    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('ilist-supabase-auth');
        sessionStorage.clear();
      }
      const displayName = email ? email.split('@')[0] : 'User';
      const result = await authApi.register(displayName, email || '', password, pendingPhone || undefined);
      const regData = result?.data?.data;

      if (regData?.user && regData?.session) {
        useAuthStore.getState().login(
          {
            id: regData.user.id,
            email: regData.user.email,
            name: regData.user.user_metadata?.full_name || regData.user.email?.split('@')[0] || 'User',
            avatar_url: regData.user.user_metadata?.avatar_url || null,
          } as any,
          regData.session.access_token,
        );
        if (regData.autoLogin) {
          toast.success('Account exists, logging you in!');
        } else {
          toast.success('Account created successfully!');
        }
        closeAllModals();
        resetForm();
      } else if (regData?.user && !regData?.session) {
        toast.success(regData.autoLogin ? 'Account exists, logging you in!' : 'Account created! Check your email to verify.');
        closeAllModals();
        resetForm();
      } else if (regData?.autoLogin === false && regData?.message) {
        setError(regData.message);
      } else {
        throw new Error('Registration failed. Please try again.');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpVerified = (_data?: { token: string; user: any }) => {
    toast.success('Account created successfully!');
    setShowOtpModal(false);
    closeAllModals();
    resetForm();
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setAgreeTerms(false);
    setError('');
    setShowOtpModal(false);
    setPendingPhone('');
  };

  const getRedirectUrl = () => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/auth/callback`;
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: getRedirectUrl() },
      });

      if (error) {
        if (error.message?.includes('popup')) throw new Error('Popup was blocked. Please allow popups and try again.');
        if (error.message?.includes('cancelled')) throw new Error('Sign up cancelled. Please try again.');
        throw error;
      }
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Unable to start Google sign up. Please try again.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign up failed. Please try again.');
      setGoogleLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setFacebookLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: { redirectTo: getRedirectUrl() },
      });

      if (error) {
        if (error.message?.includes('popup')) throw new Error('Popup was blocked. Please allow popups and try again.');
        if (error.message?.includes('cancelled')) throw new Error('Sign up cancelled. Please try again.');
        throw error;
      }
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Unable to start Facebook sign up. Please try again.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Facebook sign up failed. Please try again.');
      setFacebookLoading(false);
    }
  };

  const handleClose = () => {
    closeAllModals();
    resetForm();
  };

  if (!isRegisterModalOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-[200] p-0 sm:p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white w-full sm:max-w-2xl lg:max-w-4xl sm:rounded-2xl rounded-t-2xl flex flex-col lg:flex-row z-[201] sm:shadow-2xl overflow-hidden max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Branding Panel - Desktop (lg+) */}
        <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 p-8 flex-col justify-between">
          <div>
            <Image src="/icons/iList-white.png" alt="iList" width={100} height={32} className="h-8 w-auto" priority />
            <h3 className="text-white font-bold text-2xl mt-8">Join iList Today</h3>
            <p className="text-primary-100 text-sm mt-2 leading-relaxed">
              Create your free account and start buying and selling on Nigeria&apos;s trusted marketplace.
            </p>
          </div>

          <div className="space-y-5 mt-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center shrink-0">
                <Search className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">Find Anything</p>
                <p className="text-primary-200 text-xs">Browse millions of listings near you</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center shrink-0">
                <Plus className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">Sell Everything</p>
                <p className="text-primary-200 text-xs">Post free ads and reach buyers instantly</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">Shop Safely</p>
                <p className="text-primary-200 text-xs">Trusted by thousands of Nigerians</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Branding Strip - Tablet */}
          <div className="hidden sm:flex lg:hidden bg-gradient-to-r from-primary-600 to-primary-700 px-5 py-3 items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold">i</span>
            </div>
            <div>
              <p className="text-white text-sm font-medium">Nigeria&apos;s Trusted Marketplace</p>
              <p className="text-primary-200 text-xs">Buy &amp; sell locally for free</p>
            </div>
          </div>

          {/* Header */}
          <div className="px-5 pt-5 pb-3 border-b border-gray-100 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Create Account</h2>
                <p className="text-sm text-gray-500 mt-0.5">Start buying &amp; selling on iList</p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="px-5 py-4 overflow-y-auto flex-1">
            {error && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm mb-3 flex items-center gap-2">
                <X className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 text-sm font-medium border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all text-gray-900 placeholder:text-sm placeholder:font-normal placeholder:text-gray-400 bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="password" aria-hidden="true" tabIndex={-1} autoComplete="off" className="absolute w-0 h-0 p-0 -z-10" style={{ left: '-9999px', position: 'absolute' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
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

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Confirm Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full pl-10 pr-10 py-3 text-sm font-medium border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all text-gray-900 placeholder:text-sm placeholder:font-normal placeholder:text-gray-400 bg-white"
                    required
                    autoComplete="new-password"
                  />
                  {confirmPassword && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {password === confirmPassword ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              <label className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors text-xs">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-3.5 h-3.5 mt-0.5 text-primary-600 rounded border-gray-300"
                />
                <span className="text-gray-600">
                  I agree to the{' '}
                  <Link href="/terms" className="text-primary-600 font-medium underline">Terms</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-primary-600 font-medium underline">Privacy Policy</Link>
                </span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Create Account
                  </>
                )}
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
              Already have an account?{' '}
              <button
                onClick={() => {
                  closeAllModals();
                  toggleLoginModal();
                }}
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      <OtpModal
        isOpen={showOtpModal}
        email={pendingPhone}
        onClose={() => {
          setShowOtpModal(false);
          closeAllModals();
          resetForm();
        }}
        phone={pendingPhone}
        onVerified={handleOtpVerified}
      />
    </div>
  );
}
