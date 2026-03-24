'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, CheckCircle, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

interface OtpFormData {
  email: string;
  otp: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
}

const getFriendlyError = (errors: any, field: keyof FormErrors): string => {
  if (!errors || !errors[field]) return '';
  
  const fieldErrors = errors[field];
  const error = Array.isArray(fieldErrors) ? fieldErrors[0] : fieldErrors;
  
  if (!error) return '';

  if (field === 'email') {
    if (error.includes('already') || error.includes('taken')) {
      return 'This email is already registered. Try logging in instead.';
    }
    if (error.includes('valid') || error.includes('format')) {
      return 'Please enter a valid email address';
    }
    if (error.includes('required')) {
      return 'Email is required';
    }
  }
  
  if (field === 'name') {
    if (error.includes('required')) {
      return 'Full name is required';
    }
    if (error.includes('max')) {
      return 'Name is too long';
    }
  }
  
  if (field === 'password') {
    if (error.includes('min') || error.includes('at least')) {
      return 'Password must be at least 8 characters';
    }
    if (error.includes('mixed') || error.includes('uppercase') || error.includes('lowercase')) {
      return 'Password needs uppercase and lowercase letters';
    }
    if (error.includes('numbers') || error.includes('number')) {
      return 'Password must contain at least one number';
    }
    if (error.includes('confirmed') || error.includes('match')) {
      return 'Passwords do not match';
    }
    if (error.includes('required')) {
      return 'Password is required';
    }
  }
  
  if (field === 'password_confirmation') {
    if (error.includes('confirmed') || error.includes('match')) {
      return 'Passwords do not match';
    }
  }
  
  return error;
};

const hasAnyError = (errors: FormErrors): boolean => {
  return !!(errors.name || errors.email || errors.password || errors.password_confirmation);
};

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [otpData, setOtpData] = useState<OtpFormData>({
    email: '',
    otp: '',
  });
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [timer, setTimer] = useState<number | null>(null);
  const otpInputRefs = useState<HTMLInputElement[]>([]);
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setFormErrors({});
    
    if (!formData.name.trim()) {
      setFormErrors({ name: 'Full name is required' });
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!formData.email.trim()) {
      setFormErrors({ email: 'Email is required' });
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!formData.password) {
      setFormErrors({ password: 'Password is required' });
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (formData.password !== formData.password_confirmation) {
      setFormErrors({ password_confirmation: 'Passwords do not match' });
      toast.error('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/auth/register-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.errors) {
          const friendlyErrors: FormErrors = {
            name: getFriendlyError(data.errors, 'name'),
            email: getFriendlyError(data.errors, 'email'),
            password: getFriendlyError(data.errors, 'password'),
            password_confirmation: getFriendlyError(data.errors, 'password_confirmation'),
          };
          setFormErrors(friendlyErrors);
          
          if (hasAnyError(friendlyErrors)) {
            toast.error('Please fix the errors below');
          }
        } else {
          toast.error(data.message || 'Registration failed. Please try again.');
        }
        return;
      }
      
      setFormErrors({});
      toast.success('Registration successful! Please check your email for the verification code.');
      setOtpData({ email: formData.email, otp: '' });
      setOtpDigits(['', '', '', '', '', '']);
      setStep('verify');
      
      setResendCooldown(60);
      const cooldownTimer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(cooldownTimer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      setTimer(300);
      const expiryTimer = setInterval(() => {
        setTimer((prev) => {
          if (prev !== null && prev <= 1) {
            clearInterval(expiryTimer);
            return null;
          }
          return prev !== null ? prev - 1 : null;
        });
      }, 1000);
      
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newDigits = [...otpDigits];
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newDigits[index + i] = digit;
        }
      });
      setOtpDigits(newDigits);
      
      // Focus last filled or next empty
      const nextIndex = Math.min(index + digits.length, 5);
      const input = document.getElementById(`otp-${nextIndex}`);
      if (input) input.focus();
      return;
    }
    
    if (!/^\d*$/.test(value)) return;
    
    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };
  
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };
  
  const handleVerify = async () => {
    const otp = otpDigits.join('');
    if (otp.length !== 6) {
      toast.error('Please enter all 6 digits');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: otpData.email,
          otp: otp,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        toast.error(data.message || 'Verification failed');
        
        // Clear OTP on error
        setOtpDigits(['', '', '', '', '', '']);
        const firstInput = document.getElementById('otp-0');
        if (firstInput) firstInput.focus();
        return;
      }
      
      toast.success('Email verified successfully!');
      
      // Auto login
      login(data.user, data.token);
      
      // Redirect to home
      setTimeout(() => {
        router.push('/');
      }, 1000);
      
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: otpData.email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        toast.error(data.message || 'Failed to resend OTP');
        return;
      }
      
      toast.success('New verification code sent!');
      setResendCooldown(60);
      
      const cooldownTimer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(cooldownTimer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Reset expiry timer
      setTimer(300);
      
    } catch (error) {
      console.error('Resend error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-white">C</span>
            </div>
            <span className="text-2xl font-bold text-dark">Classified</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 'register' ? (
            <>
              <h1 className="text-2xl font-bold text-center text-dark mb-2">Create Account</h1>
              <p className="text-gray-500 text-center mb-6">Join our marketplace today</p>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (formErrors.name) setFormErrors({ ...formErrors, name: undefined });
                      }}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        formErrors.name ? 'border-red-500 bg-red-50' : 'border-gray-200'
                      }`}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  {formErrors.name && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (formErrors.email) setFormErrors({ ...formErrors, email: undefined });
                      }}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        formErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-200'
                      }`}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  {formErrors.email && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        if (formErrors.password) setFormErrors({ ...formErrors, password: undefined });
                      }}
                      className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        formErrors.password ? 'border-red-500 bg-red-50' : 'border-gray-200'
                      }`}
                      placeholder="Min 8 chars, uppercase, lowercase, number"
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
                  {formErrors.password ? (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {formErrors.password}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">Must contain: uppercase, lowercase, and number</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.password_confirmation}
                      onChange={(e) => {
                        setFormData({ ...formData, password_confirmation: e.target.value });
                        if (formErrors.password_confirmation) setFormErrors({ ...formErrors, password_confirmation: undefined });
                      }}
                      className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        formErrors.password_confirmation ? 'border-red-500 bg-red-50' : 'border-gray-200'
                      }`}
                      placeholder="••••••••"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {formErrors.password_confirmation && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {formErrors.password_confirmation}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>

              <p className="text-center text-gray-500 text-sm mt-6">
                Already have an account?{' '}
                <Link href="/login" className="text-primary-600 font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep('register')}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to registration
              </button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-primary-600" />
                </div>
                <h1 className="text-2xl font-bold text-dark mb-2">Verify Your Email</h1>
                <p className="text-gray-500">
                  We&apos;ve sent a 6-digit code to<br />
                  <span className="font-medium text-dark">{otpData.email}</span>
                </p>
              </div>

              <div className="flex justify-center gap-2 mb-6">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              <button
                onClick={handleVerify}
                disabled={isLoading || otpDigits.join('').length !== 6}
                className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Verify Email'}
              </button>

              <div className="mt-6 text-center">
                {timer !== null && timer > 0 && (
                  <p className="text-sm text-gray-500 mb-2">
                    Code expires in <span className="font-medium text-primary-600">{formatTime(timer)}</span>
                  </p>
                )}
                
                <button
                  onClick={handleResend}
                  disabled={isLoading || resendCooldown > 0}
                  className="text-sm text-gray-500 hover:text-primary-600 disabled:opacity-50"
                >
                  {resendCooldown > 0 ? (
                    `Resend code in ${resendCooldown}s`
                  ) : (
                    'Resend verification code'
                  )}
                </button>
              </div>

              <div className="mt-6 p-4 bg-amber-50 rounded-xl">
                <div className="flex gap-2 text-amber-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">
                    Check your spam folder if you don&apos;t receive the email within a few minutes.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          By creating an account, you agree to our{' '}
          <Link href="#" className="text-primary-600 hover:underline">Terms of Service</Link>
          {' '}and{' '}
          <Link href="#" className="text-primary-600 hover:underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
