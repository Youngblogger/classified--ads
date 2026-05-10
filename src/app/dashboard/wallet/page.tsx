'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2, CreditCard } from 'lucide-react';

interface WalletTransaction {
  id: number;
  type: string;
  amount: string;
  balance_before: string;
  balance_after: string;
  description: string;
  status: string;
  payment_method: string;
  created_at: string;
}

interface Wallet {
  id: number;
  balance: string;
  pending_balance: string;
}

function formatCommas(value: string): string {
  const parts = value.replace(/[^\d.]/g, '').split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

export default function WalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [funding, setFunding] = useState(false);
  const [amount, setAmount] = useState('');

  const fetchWallet = async () => {
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 10000);

    try {
      setLoading(true);
      const res = await api.get('/wallet');
      clearTimeout(timeoutId);
      setWallet(res.data.wallet);
      setTransactions(res.data.transactions?.data || res.data.transactions || []);
    } catch {
      clearTimeout(timeoutId);
      setWallet({ id: 0, balance: '0.00', pending_balance: '0.00' });
      setTransactions([]);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verified = params.get('verified');
    const reference = params.get('reference');

    if (verified === 'true' && reference) {
      window.history.replaceState({}, '', '/dashboard/wallet');
      api.post('/wallet/verify', { reference })
        .then(() => {
          toast.success('Payment successful! Your wallet has been credited.');
          fetchWallet();
        })
        .catch(() => {
          toast.error('Payment verification failed');
        });
    } else {
      fetchWallet();
    }
  }, []);

  const handleFund = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawAmount = parseFloat(amount);
    if (!amount || rawAmount < 100) {
      toast.error('Minimum amount is ₦100');
      return;
    }

    setFunding(true);
    try {
      const res = await api.post('/wallet/fund', {
        amount: rawAmount,
        method: 'paystack',
      });

      if (res.data.authorization_url) {
        window.location.href = res.data.authorization_url;
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setFunding(false);
    }
  };

  const formatAmount = (amount: string | number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(Number(amount));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'text-green-600 bg-green-50';
      case 'withdrawal':
        return 'text-red-600 bg-red-50';
      case 'promotion':
        return 'text-purple-600 bg-purple-50';
      case 'refund':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      case 'processing':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-200 rounded-2xl h-32 animate-pulse"></div>
          <div className="bg-gray-200 rounded-2xl h-32 animate-pulse"></div>
          <div className="bg-gray-200 rounded-2xl h-32 animate-pulse"></div>
        </div>
        <div className="bg-gray-200 rounded-2xl h-64 animate-pulse"></div>
        <div className="bg-gray-200 rounded-2xl h-96 animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Wallet</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white">
          <p className="text-primary-100 text-sm font-medium mb-1">Available Balance</p>
          <p className="text-3xl font-bold">{formatAmount(wallet?.balance || 0)}</p>
          <p className="text-primary-200 text-sm mt-2">Ready to use</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <p className="text-gray-500 text-sm font-medium mb-1">Pending Balance</p>
          <p className="text-3xl font-bold text-gray-900">{formatAmount(wallet?.pending_balance || 0)}</p>
          <p className="text-gray-400 text-sm mt-2">Awaiting confirmation</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <p className="text-gray-500 text-sm font-medium mb-1">Total Transactions</p>
          <p className="text-3xl font-bold text-gray-900">{transactions.length}</p>
          <p className="text-gray-400 text-sm mt-2">All time</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Fund Wallet</h2>

        <form onSubmit={handleFund} className="space-y-4">
          <div>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Enter amount (min ₦100)"
              value={formatCommas(amount)}
              onChange={(e) => {
                const raw = e.target.value.replace(/,/g, '');
                if (raw === '' || /^\d*\.?\d*$/.test(raw)) {
                  setAmount(raw);
                }
              }}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <button
            type="submit"
            disabled={funding || !amount}
            className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {funding ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              'Fund wallet'
            )}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h2>

        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No transactions yet
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor(tx.type)}`}>
                    {tx.type === 'deposit' ? '+' : tx.type === 'withdrawal' ? '-' : '↺'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 capitalize">{tx.type}</p>
                    <p className="text-sm text-gray-500">{tx.description}</p>
                    <p className="text-xs text-gray-400">{new Date(tx.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${tx.type === 'deposit' || tx.type === 'refund' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'deposit' || tx.type === 'refund' ? '+' : '-'}{formatAmount(tx.amount)}
                  </p>
                  <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${getStatusColor(tx.status)}`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
