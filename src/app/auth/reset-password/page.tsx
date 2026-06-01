'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Lock, Mail, Loader2, CheckCircle, XCircle, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExchanging, setIsExchanging] = useState(false);
  const [step, setStep] = useState<'request' | 'reset' | 'success' | 'error'>(code ? 'reset' : 'request');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (code) {
      exchangeCode(code);
    }
  }, [code]);

  async function exchangeCode(code: string) {
    setIsExchanging(true);
    setMessage('');
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        setStep('error');
        setMessage(error.message || 'Invalid or expired reset link. Please request a new one.');
      }
    } catch (err: any) {
      setStep('error');
      setMessage(err?.message || 'Failed to process reset link. Please try again.');
    } finally {
      setIsExchanging(false);
    }
  }

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      setStep('success');
      setMessage('Check your email for a password reset link.');
    } catch (err: any) {
      setMessage(err?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 8) {
      setMessage('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setMessage(updateError.message);
        return;
      }

      setStep('success');
      setMessage('Your password has been reset successfully.');
    } catch (err: any) {
      setMessage(err?.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-card p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">All Set!</h1>
            <p className="text-gray-500 mb-6">{message}</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-card p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Reset Failed</h1>
            <p className="text-gray-500 mb-6">{message}</p>
            <Link
              href="/auth/reset-password"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
            >
              Try Again
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-white">C</span>
            </div>
            <span className="text-2xl font-bold text-dark">Classified</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 'request' ? (
            <>
              <h1 className="text-2xl font-bold text-center text-dark mb-2">Reset Password</h1>
              <p className="text-gray-500 text-center mb-6">Enter your email to receive a reset link</p>

              {message && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {message}
                </div>
              )}

              <form onSubmit={handleRequestReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setMessage(''); }}
                      className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base font-medium text-gray-900 placeholder-gray-400 bg-white"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>

              <p className="text-center text-gray-500 text-sm mt-6">
                Remember your password?{' '}
                <Link href="/auth/login" className="text-primary-600 font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          ) : isExchanging ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
              <p className="text-gray-500">Verifying reset link...</p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-center text-dark mb-2">Set New Password</h1>
              <p className="text-gray-500 text-center mb-6">Enter your new password</p>

              {message && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {message}
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setMessage(''); }}
                      className="w-full pl-11 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base font-medium text-gray-900 placeholder-gray-400 bg-white"
                      placeholder="Min 8 characters"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Must contain: uppercase, lowercase, and number</p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || password.length < 8}
                  className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
