'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, AlertCircle, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [attemptsInfo, setAttemptsInfo] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('authToken');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        try {
          const userData = JSON.parse(user);
          if (userData.role === 'admin') {
            window.location.href = '/admin/ads-moderation';
            return;
          }
        } catch {}
      }
      setCheckingAuth(false);
    };

    checkAuth();
  }, []);

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-950 to-black">
        <div className="text-center">
          <Shield className="w-12 h-12 text-red-400 animate-pulse mx-auto" />
          <p className="text-gray-400 mt-4">Verifying access...</p>
        </div>
      </div>
    );
  }

  const hashSecret = async (secret: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(secret);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAttemptsInfo(null);
    setLoading(true);

    try {
      const hashedSecret = secretKey ? await hashSecret(secretKey) : '';

      console.log('Attempting login with:', email);
      console.log('API URL:', 'http://localhost:8000/api');
      
      const response = await api.post('/secure-control-9ja/auth/login', {
        login: email,
        password: password,
        admin_secret: hashedSecret || undefined,
      }).catch(err => {
        console.error('API call failed:', err);
        console.error('Error details:', err.response);
        throw err;
      });

      console.log('Login response:', response);
      console.log('Response data:', response?.data);
      console.log('Response data success:', response?.data?.success);

      if (response?.data?.success) {
        const token = response.data.token;
        const user = response.data.user;
        
        localStorage.setItem('admin_token', token);
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('auth-storage', JSON.stringify({
          state: { user, token, isAuthenticated: true, isLoading: false, hasHydrated: true },
          version: 0
        }));
        
        window.location.href = '/admin/ads-moderation';
      }
    } catch (err: any) {
      console.error('Login error:', err);
      console.error('Error response:', err.response?.data);
      
      const errorCode = err.response?.data?.error_code;
      const errorMessage = err.response?.data?.message;
      const retryAfter = err.response?.data?.retry_after;
      
      if (errorCode === 'IP_NOT_ALLOWED') {
        setError('Access denied: Your IP address is not authorized.');
      } else if (errorCode === 'INVALID_SECRET_KEY') {
        setError('Invalid admin secret key.');
      } else if (errorCode === 'RATE_LIMITED') {
        const minutes = Math.ceil(retryAfter / 60);
        setError(`Too many attempts. Please try again in ${minutes} minute(s).`);
      } else if (retryAfter) {
        const minutes = Math.ceil(retryAfter / 60);
        setError(`Too many attempts. Please try again in ${minutes} minute(s).`);
      } else if (errorMessage?.includes('Invalid credentials') || errorMessage?.includes('Invalid admin credentials')) {
        const remaining = err.response?.data?.attempts_remaining;
        setError(remaining !== undefined 
          ? `Incorrect email or password. ${remaining} attempt(s) remaining.`
          : 'Incorrect email or password');
      } else if (err.response?.status === 403) {
        setError(errorMessage || 'Access denied. Admin privileges required.');
      } else {
        setError(errorMessage || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-950 to-black p-4">
      <div
        className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500"
      >
        <div className="rounded-2xl shadow-2xl border border-gray-800 bg-gray-900/60 backdrop-blur overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-3">
                <div className="p-3 rounded-full bg-red-500/10 border border-red-500/30">
                  <Lock className="w-8 h-8 text-red-400" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
              <p className="text-gray-400 text-sm mt-1">Secure login required</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Admin email"
                  required
                  disabled={loading}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Password"
                  required
                  disabled={loading}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <input
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Admin Secret Key (optional)"
                disabled={loading}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Login to Dashboard
                  </>
                )}
              </button>
            </form>

            <p className="text-xs text-gray-500 text-center mt-6">
              Unauthorized access is strictly prohibited
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
