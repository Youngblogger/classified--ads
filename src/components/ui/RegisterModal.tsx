'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Mail, Lock, Eye, EyeOff, User, Phone, CheckCircle, Loader2 } from 'lucide-react';
import { useUIStore, useAuthStore } from '@/lib/store';
import OtpModal from './OtpModal';
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
  
  const [googleLoading, setGoogleLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);
  const googleInitializedRef = useRef(false);
  
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
        
        toast.success('Account created successfully!');
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
      localStorage.setItem('user-auth-storage', JSON.stringify({
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
        throw new Error(data.message || 'Google sign up failed');
      }

      login(data.user, data.token);
      closeAllModals();
      
      if (redirectUrl) {
        window.scrollTo(0, 0);
        window.location.href = redirectUrl;
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign up failed');
    } finally {
      setGoogleLoading(false);
    }
  }, [login, redirectUrl, closeAllModals]);

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

  // Load Google script once on mount
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

  // Render Google sign-in button when modal opens
  useEffect(() => {
    if (!isRegisterModalOpen) return;

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
  }, [isRegisterModalOpen, handleGoogleCredential]);

  const handleClose = () => {
    closeAllModals();
    resetForm();
  };

  return (
    <div className={isRegisterModalOpen ? '' : 'hidden'}>
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-0 sm:p-4"
          onClick={handleClose}
        >
          <div 
            className="bg-white w-full h-full sm:w-[90%] sm:max-w-md sm:max-h-[95vh] sm:rounded-2xl flex flex-col sm:shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Match homepage hero gradient */}
            <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 px-6 py-5 shrink-0">
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

          <div className="p-6 overflow-y-auto flex-1">
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

            {/* Google Login */}
            <div className="mb-4">
              <div id="google-signin-button" className="w-full"></div>
              {googleLoading && (
                <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in with Google...
                </div>
              )}
            </div>

            {/* Facebook */}
            <div className="flex flex-col gap-2">
              <button 
                onClick={handleFacebookLogin}
                disabled={facebookLoading}
                className="flex items-center justify-center gap-3 py-3 px-4 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-100 hover:border-gray-300 transition-all text-base font-medium text-gray-800 shadow-sm disabled:opacity-50"
              >
                {facebookLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0">
                    <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                )}
                <span>Continue with Facebook</span>
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
