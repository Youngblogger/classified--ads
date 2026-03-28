'use client';

import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent, ChangeEvent } from 'react';
import { X, Phone, Mail, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface OtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  phone?: string;
  email?: string;
  onVerified: (data?: { token: string; user: any }) => void;
}

export default function OtpModal({ isOpen, onClose, phone = '', email = '', onVerified }: OtpModalProps) {
  const isEmailVerification = !!email;
  const targetValue = email || phone;
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [resending, setResending] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
      setResendTimer(30);
      setError('');
      setSuccess(false);
      setOtp(['', '', '', '', '', '']);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && resendTimer > 0 && !success) {
      const timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen, resendTimer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((digit: string) => digit) && index === 3) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('').concat(['', '', '', '']).slice(0, 4);
    setOtp(newOtp);
    setError('');

    const lastFilledIndex = newOtp.findIndex((d: string, i: number) => d !== '' && i === 3);
    inputRefs.current[Math.min(lastFilledIndex + 1, 3)]?.focus();

    if (newOtp.every((digit: string) => digit)) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleVerify = async (otpCode?: string) => {
    const code = otpCode || otp.join('');
    if (code.length !== 4) {
      setError('Please enter the 4-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
      const response = await fetch(`${apiUrl}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: isEmailVerification ? email : undefined,
          phone: isEmailVerification ? undefined : phone,
          otp: code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.otp?.[0] || 'Verification failed');
      }

      setSuccess(true);
      
      // Pass token and user data to callback if available
      setTimeout(() => {
        onVerified(data.token && data.user ? { token: data.token, user: data.user } : undefined);
      }, 1000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid verification code';
      setError(errorMessage);
      setOtp(['', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || resending) return;

    setResending(true);
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
      const response = await fetch(`${apiUrl}/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email: isEmailVerification ? email : undefined, phone: isEmailVerification ? undefined : phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend code');
      }

      setResendTimer(60);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resend code';
      setError(errorMessage);
    } finally {
      setResending(false);
    }
  };

  if (!isOpen) return null;

  const maskedTarget = targetValue.length > 4 
    ? '*'.repeat(targetValue.length - 4) + targetValue.slice(-4)
    : targetValue;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full animate-scale-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-dark">{isEmailVerification ? 'Verify Email' : 'Verify Phone'}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-dark mb-2">Verified!</h3>
            <p className="text-gray-500">Your phone number has been verified successfully.</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {isEmailVerification ? <Mail className="w-6 h-6 text-primary-600" /> : <Phone className="w-6 h-6 text-primary-600" />}
              </div>
              <p className="text-gray-600 mb-2">
                Enter the 4-digit code sent to
              </p>
              <p className="text-dark font-medium">{maskedTarget}</p>
            </div>

            <div className="flex justify-center gap-2 mb-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={loading}
                  className={`w-14 h-14 text-center text-xl font-bold rounded-xl border-2 transition-colors ${
                    error
                      ? 'border-red-300 bg-red-50 focus:border-red-500'
                      : 'border-gray-200 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
                  } outline-none`}
                />
              ))}
            </div>

            {error && (
              <div className="flex items-center justify-center gap-2 mb-4 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="text-center">
              {resendTimer > 0 ? (
                <p className="text-gray-500 text-sm">
                  Resend code in {resendTimer}s
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="flex items-center gap-2 mx-auto text-primary-600 hover:text-primary-700 font-medium"
                >
                  <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
                  {resending ? 'Sending...' : 'Resend Code'}
                </button>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-full mt-6 py-3 text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              Skip for now
            </button>
          </>
        )}
      </div>
    </div>
  );
}
