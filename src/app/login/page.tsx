'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { X, Mail, Lock, Eye, EyeOff, Loader2, ChevronLeft } from 'lucide-react';
import { useAuthStore, useUIStore } from '@/lib/store';
import toast from 'react-hot-toast';

interface GoogleWindow {
  google?: {
    accounts?: {
      id?: {
        initialize: (config: {
          client_id: string;
          callback: (response: { credential: string }) => void;
          context?: string;
          ux_mode?: string;
          auto_select?: boolean;
          use_fedcm_for_prompt?: boolean;
        }) => void;
        renderButton: (container: HTMLElement, config: object) => void;
        prompt: (momentListener?: (res: any) => void) => void;
        disableAutoSelect: () => void;
        cancel: () => void;
      };
    };
  };
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '190991791068-p65o95kslmp106ohlbdafsdthg702tn3.apps.googleusercontent.com';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, login, setLoading } = useAuthStore();
  const { toggleRegisterModal } = useUIStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | React.ReactNode>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [usedEmails, setUsedEmails] = useState<string[]>([]);
  const googleInitializedRef = useRef(false);

  const redirectUrl = searchParams.get('redirect') || '/';

  useEffect(() => {
    if (redirectUrl && redirectUrl !== '/') {
      localStorage.setItem('authRedirect', redirectUrl);
      sessionStorage.setItem('authRedirect', redirectUrl);
    }
  }, [redirectUrl]);

  useEffect(() => {
    const savedEmails = localStorage.getItem('used-emails');
    if (savedEmails) setUsedEmails(JSON.parse(savedEmails));
    const savedRememberEmail = localStorage.getItem('remember-email');
    if (savedRememberEmail) {
      setEmail(savedRememberEmail);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectUrl);
    }
  }, [isAuthenticated, redirectUrl, router]);

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

    localStorage.setItem('authRedirect', redirectUrl);
    sessionStorage.setItem('authRedirect', redirectUrl);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
      const formData = new URLSearchParams();
      formData.append('login', email);
      formData.append('password', password);

      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: formData,
      });

      const data = await response.json();

      if (data.requires_verification) {
        router.push(`/auth/verify?email=${encodeURIComponent(data.email || email)}&user_id=${data.user_id}&from_login=true`);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        if (data.code === 'email_not_verified') {
          setError(
            <span>
              Please verify your email first.{' '}
              <a
                href={`/auth/verify?email=${encodeURIComponent(data.email || email)}`}
                className="text-primary-600 font-semibold hover:underline"
              >
                Verify now
              </a>
            </span>
          );
          setIsSubmitting(false);
          setLoading(false);
          return;
        }
        throw new Error(data.message || data.login?.[0] || 'Login failed');
      }

      const userName = data.user?.name || 'there';

      login(data.user, data.token);

      if (email) {
        const usedEmails = JSON.parse(localStorage.getItem('used-emails') || '[]');
        if (!usedEmails.includes(email)) {
          usedEmails.push(email);
          localStorage.setItem('used-emails', JSON.stringify(usedEmails.slice(-5)));
        }
        if (rememberMe) {
          localStorage.setItem('remember-email', email);
        } else {
          localStorage.removeItem('remember-email');
        }
      }

      window.scrollTo(0, 0);
      window.location.href = redirectUrl || '/';
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid credentials';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleGoogleCredential = useCallback(async (response: { credential: string }) => {
    setGoogleLoading(true);
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
      const res = await fetch(`${apiUrl}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Google login failed');
      }

      login(data.user, data.token);

      if (redirectUrl) {
        window.scrollTo(0, 0);
        window.location.href = redirectUrl;
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google login failed');
    } finally {
      setGoogleLoading(false);
    }
  }, [login, redirectUrl]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (document.getElementById('google-gsi-script')) return;

    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    type GoogleId = NonNullable<NonNullable<NonNullable<GoogleWindow['google']>['accounts']>['id']>;
    const renderButton = (gw: GoogleId) => {
      const container = document.getElementById('google-signin-button');
      if (container) {
        container.innerHTML = '';
        gw.renderButton(container, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left',
        });
      }
    };

    const gw = (window as unknown as GoogleWindow).google?.accounts?.id;
    if (!gw) {
      const retry = setTimeout(() => {
        const gw2 = (window as unknown as GoogleWindow).google?.accounts?.id;
        if (gw2) {
          if (!googleInitializedRef.current) {
            googleInitializedRef.current = true;
            gw2.initialize({
              client_id: GOOGLE_CLIENT_ID,
              callback: handleGoogleCredential,
              auto_select: false,
              use_fedcm_for_prompt: false,
            });
          }
          renderButton(gw2);
        }
      }, 1000);
      return () => clearTimeout(retry);
    }

    if (!googleInitializedRef.current) {
      googleInitializedRef.current = true;
      gw.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
        auto_select: false,
        use_fedcm_for_prompt: false,
      });
    }
    renderButton(gw);
  }, [handleGoogleCredential]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="p-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 px-6 py-5">
            <h2 className="text-2xl font-bold text-white">Welcome Back!</h2>
            <p className="text-primary-100 text-sm mt-1">Sign in to continue to iList</p>
          </div>

          <div className="p-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm mb-4 flex items-center gap-2">
                <X className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="mb-3">
              <div id="google-signin-button" className="w-full"></div>
              {googleLoading && (
                <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in with Google...
                </div>
              )}
            </div>

            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white text-xs text-gray-500">Or sign in with email</span>
              </div>
            </div>

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
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <p className="text-center mt-4 text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <button
                onClick={toggleRegisterModal}
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                Sign up free
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
