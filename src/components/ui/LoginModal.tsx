'use client';

import React, { useState, useRef, useEffect, ClipboardEvent, KeyboardEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Mail, Lock, Eye, EyeOff, Phone, Send, CheckCircle, Loader2 } from 'lucide-react';
import { useUIStore, useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

interface GoogleWindow {
  google?: {
    accounts?: {
      id?: {
        initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
        renderButton: (container: HTMLElement, config: object) => void;
      };
    };
  };
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '190991791068-p65o95kslmp106ohlbdafsdthg702tn3.apps.googleusercontent.com';

const isValidPhone = (phone: string): boolean => {
  if (!phone) return false;
  const length = phone.replace(/\s/g, '').length;
  return length >= 11 && length <= 14;
};

export default function LoginModal() {
  const router = useRouter();
  const { isLoginModalOpen, toggleLoginModal, toggleRegisterModal, closeAllModals } = useUIStore();
  const { login, setLoading } = useAuthStore();
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('/');

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.self === window.top && window.location?.search) {
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect');
        if (redirect) {
          setRedirectUrl(redirect);
        }
      }
    } catch (e) {
      // Ignore errors when in restricted context
    }
  }, []);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | React.ReactNode>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);
  
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState<string[]>(['', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [usedEmails, setUsedEmails] = useState<string[]>([]);
  const [rememberMe, setRememberMe] = useState(false);
  const [savedPasswords, setSavedPasswords] = useState<Record<string, string>>({});

  useEffect(() => {
    const savedEmails = localStorage.getItem('used-emails');
    if (savedEmails) setUsedEmails(JSON.parse(savedEmails));
    
    const savedPasswordsData = localStorage.getItem('saved-passwords');
    if (savedPasswordsData) setSavedPasswords(JSON.parse(savedPasswordsData));
    
    const savedRememberEmail = localStorage.getItem('remember-email');
    if (savedRememberEmail) {
      setEmail(savedRememberEmail);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOtp = async () => {
    if (!isValidPhone(phone)) {
      setError('Please enter a valid Nigerian phone number');
      return;
    }

    setOtpLoading(true);
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
      const response = await fetch(`${apiUrl}/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.phone?.[0] || 'Failed to send OTP');
      }

      setOtpSent(true);
      setCountdown(30);
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send OTP';
      setError(errorMessage);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');
    if (value && index < 3) {
      otpInputRefs.current[index + 1]?.focus();
    }
    if (newOtp.every((digit) => digit) && index === 3) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4);
    if (!/^\d+$/.test(pastedData)) return;
    const newOtp = pastedData.split('').concat(['', '', '', '']).slice(0, 4);
    setOtp(newOtp);
    if (newOtp.every((digit) => digit)) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleVerifyOtp = async (otpCode?: string) => {
    const code = otpCode || otp.join('');
    if (code.length !== 4) {
      setError('Please enter the 4-digit code');
      return;
    }

    setIsSubmitting(true);
    setLoading(true);

    if (typeof window !== 'undefined' && redirectUrl) {
      localStorage.setItem('authRedirect', redirectUrl);
      sessionStorage.setItem('authRedirect', redirectUrl);
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
      const response = await fetch(`${apiUrl}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ phone, otp: code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.otp?.[0] || 'Invalid OTP');
      }

      const userName = data.user?.name || 'there';
      
      // Store auth data in localStorage for persistence
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Also store in zustand persist format for compatibility
      localStorage.setItem('auth-storage', JSON.stringify({
        state: {
          token: data.token,
          user: data.user,
          isAuthenticated: true
        },
        version: 0
      }));
      
      // Also set cookie (API looks for this)
      document.cookie = `token=${data.token};path=/;max-age=${7*24*60*60}`;
      
      // Use login function which handles zustand persist
      login(data.user, data.token);
      
      toast.success(`Welcome back, ${userName}!`);
      setOtpVerified(true);
      closeAllModals();
      resetForm();
      
      // Full page redirect to ensure auth state is loaded
      window.scrollTo(0, 0);
      window.location.href = redirectUrl || '/';
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid verification code';
      setError(errorMessage);
      setOtp(['', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    await handleSendOtp();
  };

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

      // Handle unverified users - redirect to OTP verification
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
      
      // Store auth data in localStorage for persistence
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Also store in zustand persist format for compatibility
      localStorage.setItem('auth-storage', JSON.stringify({
        state: {
          token: data.token,
          user: data.user,
          isAuthenticated: true
        },
        version: 0
      }));
      
      // Also set cookie (API looks for this) - 24 hours to match token expiration
      const cookieMaxAge = 24 * 60 * 60; // 24 hours in seconds
      document.cookie = `token=${data.token};path=/;max-age=${cookieMaxAge};SameSite=Lax`;
      
      // Store token expiration time (24 hours from now)
      const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      localStorage.setItem('token_expires_at', tokenExpiresAt);
      
      // Use login function which handles zustand persist
      login(data.user, data.token);
      
      if (typeof window !== 'undefined' && email) {
        const usedEmails = JSON.parse(localStorage.getItem('used-emails') || '[]');
        if (!usedEmails.includes(email)) {
          usedEmails.push(email);
          localStorage.setItem('used-emails', JSON.stringify(usedEmails.slice(-5)));
        }
        
        if (rememberMe) {
          localStorage.setItem('remember-email', email);
          const savedPasswords = JSON.parse(localStorage.getItem('saved-passwords') || '{}');
          savedPasswords[email] = password;
          localStorage.setItem('saved-passwords', JSON.stringify(savedPasswords));
        } else {
          // Clear saved credentials if remember me is not checked
          const savedPasswords = JSON.parse(localStorage.getItem('saved-passwords') || '{}');
          delete savedPasswords[email];
          localStorage.setItem('saved-passwords', JSON.stringify(savedPasswords));
          localStorage.removeItem('remember-email');
        }
      }
      toast.success(`Welcome back, ${userName}!`);
      closeAllModals();
      resetForm();
      
      // Full page redirect to ensure auth state is loaded
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

  const resetForm = () => {
    setEmail('');
    setPhone('');
    setPassword('');
    setError('');
    setOtpSent(false);
    setOtp(['', '', '', '']);
    setOtpVerified(false);
    setCountdown(0);
  };

  const handleClose = () => {
    closeAllModals();
    resetForm();
  };

  const handleLoginMethodChange = (method: 'email' | 'phone') => {
    setLoginMethod(method);
    setError('');
    setOtpSent(false);
    setOtp(['', '', '', '']);
    setPhone('');
  };

  const handleFacebookLogin = async () => {
    setFacebookLoading(true);
    setError('');

    try {
      if (typeof window !== 'undefined' && redirectUrl) {
        localStorage.setItem('authRedirect', redirectUrl);
        sessionStorage.setItem('authRedirect', redirectUrl);
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
      const response = await fetch(`${apiUrl}/auth/facebook`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to initiate Facebook login');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No redirect URL received');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Facebook login failed';
      setError(errorMessage);
      setFacebookLoading(false);
    }
  };

  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '190991791068-p65o95kslmp106ohlbdafsdthg702tn3.apps.googleusercontent.com';
  const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || 'your_facebook_app_id';

  const handleFacebookCredential = async (response: any) => {
    setFacebookLoading(true);
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
      const res = await fetch(`${apiUrl}/auth/facebook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ access_token: response.accessToken }),
      });

      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('auth-storage', JSON.stringify({ state: { token: data.token, user: data.user, isAuthenticated: true }, version: 0 }));
        document.cookie = `token=${data.token};path=/;max-age=${24 * 60 * 60};SameSite=Lax`;
        login(data.user, data.token);
        toast.success(`Welcome, ${data.user?.name || 'User'}!`);
        closeAllModals();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Facebook login failed');
    } finally {
      setFacebookLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoginModalOpen) return;
    if (typeof window === 'undefined') return;

    const initGoogleButton = () => {
      const win = window as unknown as GoogleWindow;
      if (!win.google?.accounts?.id || !GOOGLE_CLIENT_ID) return;
      
      const container = document.getElementById('google-signin-button');
      if (!container) return;

      try {
        win.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredential,
        });

        container.innerHTML = '';
        win.google.accounts.id.renderButton(container, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'continue_with',
          shape: 'rectangular',
        });
      } catch (e) {
        console.error('Google button init failed:', e);
      }
    };

    const loadGoogleScript = () => {
      if (document.getElementById('google-script')) {
        setTimeout(initGoogleButton, 100);
        return;
      }
      
      const script = document.createElement('script');
      script.id = 'google-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setTimeout(initGoogleButton, 500);
      };
      document.head.appendChild(script);
    };

    loadGoogleScript();
  }, [isLoginModalOpen]);

  const handleGoogleCredential = async (response: { credential: string }) => {
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

localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('auth-storage', JSON.stringify({
          state: { token: data.token, user: data.user, isAuthenticated: true },
          version: 0
        }));
        window.scrollTo(0, 0);

      const cookieMaxAge = 24 * 60 * 60;
      document.cookie = `token=${data.token};path=/;max-age=${cookieMaxAge};SameSite=Lax`;

      login(data.user, data.token);
      toast.success(`Welcome, ${data.user?.name || 'User'}!`);
      closeAllModals();
      
      if (redirectUrl) {
        window.scrollTo(0, 0);
        window.location.href = redirectUrl;
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google login failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  if (!isLoginModalOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4"
        onClick={handleClose}
      >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[95vh] overflow-hidden flex flex-col z-[201]"
        onClick={(e) => e.stopPropagation()}
      >
          {/* Header - Match homepage hero gradient */}
          <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 px-6 py-5">
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

          <div className="p-6 flex-1 overflow-y-auto">
            {/* Login Method Toggle */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-5">
              <button
                type="button"
                onClick={() => handleLoginMethodChange('email')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  loginMethod === 'email' 
                    ? 'bg-primary-600 text-white shadow-sm font-semibold' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => handleLoginMethodChange('phone')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  loginMethod === 'phone' 
                    ? 'bg-primary-600 text-white shadow-sm font-semibold' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Phone
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm mb-4 flex items-center gap-2">
                <X className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {otpVerified && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-600 rounded-xl text-sm mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Login successful!
              </div>
            )}

            {/* Email Login Form */}
            {loginMethod === 'email' && (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        // Auto-fill password if email has saved credentials
                        if (savedPasswords[e.target.value]) {
                          setPassword(savedPasswords[e.target.value]);
                        }
                      }}
                      placeholder="Enter your email"
                      className="w-full pl-14 pr-5 py-4 text-lg font-medium border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all text-gray-900 placeholder:text-base placeholder:font-normal placeholder:text-gray-400 bg-white"
                      style={{ height: '60px' }}
                      required
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
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-14 pr-14 py-4 text-lg font-medium border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all text-gray-900 placeholder:text-base placeholder:font-normal placeholder:text-gray-400 bg-white"
                      style={{ height: '60px' }}
                      required
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
            )}

            {/* Phone Login Form */}
            {loginMethod === 'phone' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter phone number"
                      disabled={otpSent}
                      className="w-full pl-14 pr-5 py-5 text-xl font-bold border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all disabled:bg-gray-100 text-gray-900 placeholder:text-lg placeholder:font-normal placeholder:text-gray-400 bg-white"
                      style={{ height: '70px' }}
                    />
                  </div>
                  {!isValidPhone(phone) && phone.length > 0 && (
                    <p className="text-sm text-red-500 mt-2">Phone number must be 11-14 digits</p>
                  )}
                </div>

                {!otpSent ? (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpLoading || !isValidPhone(phone)}
                    className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send OTP Code
                  </button>
                ) : (
                  <>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                      <p className="text-sm text-green-700 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        OTP sent to {phone}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 text-center">Enter 4-digit code</label>
                      <div className="flex justify-center gap-2">
                        {otp.map((digit, index) => (
                          <input
                            key={index}
                            ref={(el) => { otpInputRefs.current[index] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            onPaste={handleOtpPaste}
                            disabled={isSubmitting}
                            className="w-12 h-12 text-center text-lg font-bold rounded-xl border-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none bg-gray-50 transition-all"
                          />
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleVerifyOtp()}
                      disabled={isSubmitting || otp.join('').length !== 4}
                      className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Verify & Login
                    </button>

                    <div className="text-center text-sm">
                      {countdown > 0 ? (
                        <p className="text-gray-500">Resend OTP in {countdown}s</p>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Resend OTP Code
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Social Login - Only show for email */}
            {loginMethod === 'email' && (
              <>
                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 bg-white text-xs text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div id="google-signin-button" className="w-full min-h-[46px]"></div>
                  <button 
                    onClick={handleFacebookLogin}
                    disabled={facebookLoading}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-100 hover:border-gray-300 transition-all disabled:opacity-50 text-base font-medium text-gray-800 shadow-sm"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0">
                      <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>{facebookLoading ? 'Loading...' : 'Continue with Facebook'}</span>
                  </button>
                </div>
              </>
            )}

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
