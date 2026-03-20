'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, token } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check token from localStorage directly for initial render
    const stored = localStorage.getItem('auth-storage');
    let storedToken = token;
    if (!storedToken && stored) {
      try {
        const parsed = JSON.parse(stored);
        storedToken = parsed.state?.token || null;
      } catch {
        storedToken = null;
      }
    }
    
    if ((isAuthenticated && token) || (storedToken)) {
      router.push('/admin');
    }
  }, [isAuthenticated, token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting login with:', email);
      const response = await api.post('/auth/login', {
        login: email,
        password,
      });
      console.log('Login response:', response.data);
      console.log('User:', response.data.user);
      console.log('Token:', response.data.token);

      if (response.data.user && response.data.user.role === 'admin') {
        console.log('Calling login function...');
        login(response.data.user, response.data.token);
        console.log('Login complete, checking auth state...');
        
        // Wait for state update then redirect
        setTimeout(() => {
          console.log('Redirecting to /admin...');
          window.location.href = '/admin';
        }, 100);
      } else {
        setError('Access denied. Admin credentials required.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const errorCode = err.response?.data?.code;
      const errorMessage = err.response?.data?.message;
      
      if (errorCode === 'email_not_verified') {
        setError('Your email is not verified. Please check your inbox for the verification code.');
      } else if (errorCode === 'account_banned') {
        setError('Your account has been banned. Contact support for assistance.');
      } else if (errorCode === 'account_suspended') {
        setError('Your account has been suspended. Contact support for assistance.');
      } else if (errorMessage?.includes('Invalid credentials') || errorMessage?.includes('incorrect')) {
        setError('Incorrect email or password. Please try again.');
      } else {
        setError(errorMessage || 'Login failed. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
            <p className="text-gray-500 mt-2">Sign in to access the admin dashboard</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                placeholder="admin@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent pr-12"
                  placeholder="Enter your password"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-sky-600 hover:text-sky-700">
              Back to homepage
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}