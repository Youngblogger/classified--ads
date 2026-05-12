'use client';

import { useState, useEffect } from 'react';
import { Shield, Smartphone, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

type TwoFactorStatus = 'disabled' | 'setting_up' | 'enabled';

export default function TwoFactorAuth() {
  const [status, setStatus] = useState<TwoFactorStatus>('disabled');
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [setupError, setSetupError] = useState('');

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const res = await authApi.me();
      const data = res.data?.data || res.data;
      const user = data?.user || data;
      if (user?.two_factor_enabled) {
        setStatus('enabled');
      }
    } catch {}
  };

  const handleSetup = async () => {
    setIsLoading(true);
    setSetupError('');
    try {
      const res = await authApi.setup2FA();
      setQrCode(res.data?.qr_code || '');
      setSecret(res.data?.secret || '');
      setStatus('setting_up');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to setup 2FA';
      setSetupError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnable = async () => {
    if (verificationCode.length < 6) {
      toast.error('Please enter a valid verification code');
      return;
    }
    setIsVerifying(true);
    try {
      await authApi.enable2FA(verificationCode);
      setStatus('enabled');
      setQrCode('');
      setSecret('');
      setVerificationCode('');
      toast.success('Two-factor authentication enabled');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid verification code');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDisable = async () => {
    if (!confirm('Disable two-factor authentication? Your account will be less secure.')) return;
    setIsDisabling(true);
    try {
      await authApi.disable2FA(verificationCode || '000000');
      setStatus('disabled');
      setVerificationCode('');
      toast.success('Two-factor authentication disabled');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to disable 2FA');
    } finally {
      setIsDisabling(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-indigo-100 rounded-xl">
          <Shield className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
          <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
        </div>
      </div>

      {status === 'disabled' && (
        <div>
          <p className="text-sm text-gray-600 mb-4">
            When enabled, you&apos;ll need to enter a verification code from your authenticator app 
            (e.g., Google Authenticator, Authy) in addition to your password.
          </p>
          <button
            onClick={handleSetup}
            disabled={isLoading}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Smartphone className="w-4 h-4" />}
            {isLoading ? 'Setting up...' : 'Enable 2FA'}
          </button>
        </div>
      )}

      {status === 'setting_up' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Scan this QR code with your authenticator app, then enter the verification code below.
          </p>
          {qrCode && (
            <div className="flex justify-center">
              <img src={qrCode} alt="2FA QR Code" className="w-48 h-48 border-2 border-gray-200 rounded-xl p-2" />
            </div>
          )}
          {secret && (
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">Or enter this secret key manually:</p>
              <p className="text-sm font-mono font-bold text-gray-900 select-all">{secret}</p>
            </div>
          )}
          {setupError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{setupError}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-center text-lg tracking-[0.5em] font-mono focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleEnable}
              disabled={isVerifying || verificationCode.length < 6}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {isVerifying ? 'Verifying...' : 'Verify & Enable'}
            </button>
            <button
              onClick={() => setStatus('disabled')}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {status === 'enabled' && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1 bg-green-100 rounded-full">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-green-700">Two-factor authentication is active</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            You&apos;ll be prompted for a verification code from your authenticator app when signing in.
          </p>
          <button
            onClick={handleDisable}
            disabled={isDisabling}
            className="px-5 py-2.5 border border-red-300 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isDisabling ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            {isDisabling ? 'Disabling...' : 'Disable 2FA'}
          </button>
        </div>
      )}
    </div>
  );
}
