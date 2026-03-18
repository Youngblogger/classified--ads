'use client';

import { useState, useRef, useEffect, ClipboardEvent, KeyboardEvent } from 'react';
import Link from 'next/link';
import { X, Mail, Lock, Eye, EyeOff, Phone, Send, CheckCircle } from 'lucide-react';
import { useUIStore, useAuthStore } from '@/lib/store';

export default function LoginModal() {
  const { isLoginModalOpen, toggleLoginModal, toggleRegisterModal, closeAllModals } = useUIStore();
  const { login, setLoading } = useAuthStore();
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  // Phone OTP flow states
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState<string[]>(['', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOtp = async () => {
    if (!phone) {
      setError('Please enter your phone number');
      return;
    }

    setOtpLoading(true);
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
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
      setCountdown(60);
      
      // Focus first OTP input
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

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
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

      // Login successful
      if (data.token) {
        login(data.user, data.token);
      } else {
        // Fetch user data and login manually
        const meResponse = await fetch(`${apiUrl}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${data.token || data.user?.id}`,
            'Accept': 'application/json',
          },
        });
        const userData = await meResponse.json();
        login(userData, data.token);
      }

      setOtpVerified(true);
      closeAllModals();
      resetForm();
      
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

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
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

      if (!response.ok) {
        throw new Error(data.message || data.login?.[0] || 'Login failed');
      }

      login(data.user, data.token);
      closeAllModals();
      resetForm();
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
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${apiUrl}/auth/google`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to initiate Google login');
      }

      // Redirect to Google OAuth URL
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No redirect URL received');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Google login failed';
      setError(errorMessage);
      setGoogleLoading(false);
    }
  };

  return (
    <div className={isLoginModalOpen ? '' : 'hidden'}>
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={handleClose}
      >
        <div 
          className="bg-white rounded-2xl p-6 max-w-md w-full animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-dark">Welcome Back</h2>
            <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Login Method Toggle */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg mb-4">
            <button
              type="button"
              onClick={() => handleLoginMethodChange('email')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginMethod === 'email' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => handleLoginMethodChange('phone')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginMethod === 'phone' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Phone
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {otpVerified && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Login successful!
            </div>
          )}

          {/* Email Login Form */}
          {loginMethod === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4 text-primary-600 rounded" />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* Phone Login Form */}
          {loginMethod === 'phone' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    disabled={otpSent}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>
              </div>

              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={otpLoading || !phone}
                  className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  {otpLoading ? 'Sending...' : 'Send OTP'}
                </button>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
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
                          className="w-14 h-14 text-center text-xl font-bold rounded-xl border-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none bg-gray-50"
                          placeholder="-"
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleVerifyOtp()}
                    disabled={isSubmitting || otp.join('').length !== 4}
                    className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Logging in...' : 'Verify & Login'}
                  </button>

                  <div className="text-center">
                    {countdown > 0 ? (
                      <p className="text-gray-500 text-sm">Resend OTP in {countdown}s</p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        Resend OTP
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
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                  className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-sm font-medium">{googleLoading ? 'Loading...' : 'Google'}</span>
                </button>
                <button className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  <svg viewBox="0 0 24 24" className="w-5 h-5">
                    <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="text-sm font-medium">Facebook</span>
                </button>
              </div>
            </>
          )}

          <p className="text-center mt-6 text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={() => {
                closeAllModals();
                toggleRegisterModal();
              }}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
