'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Mail, Lock, Eye, EyeOff, User, Phone, CheckCircle, Loader2 } from 'lucide-react';
import { useUIStore, useAuthStore } from '@/lib/store';
import OtpModal from './OtpModal';
import toast from 'react-hot-toast';

export default function RegisterModal() {
  const router = useRouter();
  const { isRegisterModalOpen, toggleRegisterModal, toggleLoginModal, closeAllModals } = useUIStore();
  const { login, setLoading } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [redirectUrl, setRedirectUrl] = useState('/');
  
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingPhone, setPendingPhone] = useState('');

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.location?.search) {
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect');
        if (redirect) {
          setRedirectUrl(redirect);
        }
      }
    } catch (e) {
      // Ignore
    }
  }, []);

  const checkPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;
    setPasswordStrength(strength);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    checkPasswordStrength(e.target.value);
  };

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 1: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-green-500';
      default: return 'bg-gray-200';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email && !phone) {
      setError('Please provide either email or phone number');
      return;
    }

    if (!name || !password || !confirmPassword) {
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
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
      const formData = new URLSearchParams();
      formData.append('name', name);
      formData.append('email', email || '');
      formData.append('password', password);
      formData.append('password_confirmation', confirmPassword);
      if (phone) formData.append('phone', phone);
       
      const response = await fetch(`${apiUrl}/auth/register-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message || 
          data.email?.[0] || 
          data.phone?.[0] || 
          'Registration failed';
        throw new Error(errorMessage);
      }

      if (data.success && data.user_id && data.email) {
        setPendingPhone(data.email);
        setShowOtpModal(true);
        return;
      }

      if (data.user && data.token) {
        const userName = data.user?.name || 'there';
        login(data.user, data.token);
        
        // Save phone number to localStorage for later use
        if (data.user?.phone) {
          localStorage.setItem('user_phone', data.user.phone);
        } else if (phone) {
          localStorage.setItem('user_phone', phone);
        }
        
        const targetUrl = localStorage.getItem('authRedirect') || sessionStorage.getItem('authRedirect') || redirectUrl || '/';
        localStorage.removeItem('authRedirect');
        sessionStorage.removeItem('authRedirect');
        
        toast.success(`Account created successfully! Welcome, ${userName}!`);
        closeAllModals();
        resetForm();
        window.location.href = targetUrl;
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleOtpVerified = async (data?: { token: string; user: any }) => {
    toast.success('Account created successfully! Welcome!');
    setShowOtpModal(false);
    closeAllModals();
    resetForm();
    
    // Store auth data if available from OTP verification
    if (data?.token && data?.user) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Also store in zustand persist format for compatibility
      localStorage.setItem('auth-storage', JSON.stringify({
        state: {
          token: data.token,
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
          hasHydrated: true
        },
        version: 0
      }));
      
      document.cookie = `token=${data.token};path=/;max-age=${7*24*60*60};SameSite=Lax`;
      login(data.user, data.token);
      
      // Save phone number to localStorage for later use (post-ad form, profile, etc.)
      if (data.user?.phone) {
        localStorage.setItem('user_phone', data.user.phone);
      } else if (phone) {
        localStorage.setItem('user_phone', phone);
      }
      
      // Redirect to homepage for new users
      window.location.href = '/';
    } else {
      // Fallback to homepage if no auth data
      window.location.href = '/';
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setConfirmPassword('');
    setAgreeTerms(false);
    setError('');
    setShowOtpModal(false);
    setPendingPhone('');
    setPasswordStrength(0);
  };

  const handleClose = () => {
    closeAllModals();
    resetForm();
  };

  return (
    <div className={isRegisterModalOpen ? '' : 'hidden'}>
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4"
        onClick={handleClose}
      >
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[92vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Match homepage hero gradient */}
          <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 px-6 py-5">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">Create Account</h2>
                <p className="text-primary-100 text-sm mt-1">Join iList - it&apos;s free!</p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-center gap-2">
                  <X className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-base font-semibold text-gray-800 mb-2">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-14 pr-5 py-4 text-lg font-medium border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all text-gray-900 placeholder:text-base placeholder:font-normal placeholder:text-gray-400 bg-white"
                    style={{ height: '60px' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-800 mb-2">Email Address *</label>
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
                  />
                </div>
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-800 mb-2">Phone Number <span className="text-gray-400 font-normal">(optional)</span></label>
                <div className="relative">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    className="w-full pl-14 pr-5 py-4 text-lg font-medium border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all text-gray-900 placeholder:text-base placeholder:font-normal placeholder:text-gray-400 bg-white"
                    style={{ height: '60px' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-800 mb-2">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Create a strong password"
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
                {password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${passwordStrength >= level ? getStrengthColor() : 'bg-gray-200'}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-800 mb-2">Confirm Password *</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full pl-14 pr-12 py-4 text-lg font-medium border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all text-gray-900 placeholder:text-base placeholder:font-normal placeholder:text-gray-400 bg-white"
                    style={{ height: '60px' }}
                    required
                  />
                  {confirmPassword && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      {password === confirmPassword ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : (
                        <X className="w-6 h-6 text-red-400" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              <label className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors text-sm">
                <input 
                  type="checkbox" 
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-primary-600 rounded border-gray-300" 
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
                className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Create Account
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

            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-3 py-3 px-4 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-100 hover:border-gray-300 transition-all text-base font-medium text-gray-800 shadow-sm">
                <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Google</span>
              </button>
              <button className="flex items-center justify-center gap-3 py-3 px-4 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-100 hover:border-gray-300 transition-all text-base font-medium text-gray-800 shadow-sm">
                <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0">
                  <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Facebook</span>
              </button>
            </div>

            <p className="text-center mt-4 text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => {
                  closeAllModals();
                  toggleLoginModal();
                }}
                className="text-primary-600 hover:text-[#3a3f18] font-semibold"
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
