'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Minus,
  Eye,
  RefreshCw,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { formatTransactionDescription } from '@/lib/transaction-utils';

interface Wallet {
  id: number;
  user?: {
    name: string;
    email: string;
  };
  owner_type?: string;
  balance: number;
  pending_balance?: number;
  transactions_count?: number;
  status: string;
}

interface Transaction {
  id: number;
  type: string;
  amount: number;
  balance_before?: number;
  balance_after?: number;
  description: string;
  status: string;
  created_at: string;
}

interface AdminWallet {
  id: number;
  balance: number;
  pending_balance: number;
  owner_type: string;
}

export default function WalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [adminWallet, setAdminWallet] = useState<AdminWallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWallet, setSelectedWallet] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [walletsRes, adminWalletRes] = await Promise.all([
        adminApi.getWallets().catch(() => ({ data: { data: [] } })),
        adminApi.getAdminWallet().catch(() => ({ data: { wallet: null } })),
      ]);
      setWallets((walletsRes.data as any)?.data ?? []);
      if ((adminWalletRes.data as any)?.wallet) {
        setAdminWallet((adminWalletRes.data as any).wallet);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (walletId: number) => {
    try {
      setLoadingTransactions(true);
      // Using getWallets with params if supported, otherwise just use wallets data
      const res = await adminApi.getWallets({ user_id: walletId.toString() });
      // For now, just show transactions from the API response if available
      setTransactions((res.data as any)?.transactions ?? []);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedWallet) {
      fetchTransactions(selectedWallet);
    }
  }, [selectedWallet]);

  const handleCredit = async (walletId: number) => {
    const amount = prompt('Enter amount to credit:');
    if (!amount || isNaN(Number(amount))) return;
    const description = prompt('Enter description:') || 'Admin credit';
    try {
      await adminApi.creditWallet(walletId, Number(amount), description);
      toast.success('Wallet credited');
      fetchData();
    } catch (error) {
      console.error('Failed to credit wallet:', error);
      toast.error('Failed to credit wallet');
    }
  };

  const handleDebit = async (walletId: number) => {
    const amount = prompt('Enter amount to debit:');
    if (!amount || isNaN(Number(amount))) return;
    const description = prompt('Enter description:') || 'Admin debit';
    try {
      await adminApi.debitWallet(walletId, Number(amount), description);
      toast.success('Wallet debited');
      fetchData();
    } catch (error) {
      console.error('Failed to debit wallet:', error);
      toast.error('Failed to debit wallet');
    }
  };

  const filteredWallets = wallets.filter(wallet =>
    (wallet.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (wallet.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalBalance = wallets.reduce((sum, w) => sum + (w.balance || 0), 0);
  const totalPending = wallets.reduce((sum, w) => sum + (w.pending_balance || 0), 0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Admin Wallet Section */}
      {adminWallet && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <DollarSign className="w-6 h-6" />
                Admin Wallet (Platform Revenue)
              </h2>
              <p className="text-white/80 text-sm mt-1">All payments are collected here</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">₦{Number(adminWallet.balance || 0).toLocaleString()}</p>
              <p className="text-white/80 text-sm">Available Balance</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Balance</p>
              <p className="text-2xl font-bold text-gray-900">₦{totalBalance.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Balance</p>
              <p className="text-2xl font-bold text-gray-900">₦{totalPending.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Wallets</p>
              <p className="text-2xl font-bold text-gray-900">{wallets.filter(w => w.status === 'active').length}</p>
            </div>
            <div className="p-3 bg-sky-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-sky-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search wallets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 w-full sm:w-80 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div></th>
                    <th className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div></th>
                    <th className="px-6 py-4"><div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div></th>
                    <th className="px-6 py-4"><div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div></th>
                    <th className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                          <div className="space-y-1">
                            <div className="h-4 w-24 bg-gray-200 rounded"></div>
                            <div className="h-3 w-32 bg-gray-100 rounded"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-6 w-14 bg-gray-200 rounded-full"></div></td>
                      <td className="px-6 py-4"><div className="h-8 w-20 bg-gray-200 rounded"></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : filteredWallets.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No wallets found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">User</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Balance</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Pending</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredWallets.map((wallet) => (
                    <tr
                      key={wallet.id}
                      className={`hover:bg-gray-50 cursor-pointer ${selectedWallet === wallet.id ? 'bg-sky-50' : ''}`}
                      onClick={() => setSelectedWallet(wallet.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-purple-500 flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {(wallet.user?.name || 'U').split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{wallet.user?.name || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">{wallet.user?.email || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">${Number(wallet.balance || 0).toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-amber-600">${Number(wallet.pending_balance || 0).toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          wallet.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {wallet.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleCredit(wallet.id); }}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg" 
                            title="Add Funds"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDebit(wallet.id); }}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" 
                            title="Deduct Funds"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Transactions</h3>
          </div>
          {loadingTransactions ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Select a wallet to view transactions
            </div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
              {transactions.map((tx) => (
                <div key={tx.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        tx.type === 'deposit' || tx.amount > 0 ? 'bg-green-100' :
                        tx.type === 'withdrawal' || tx.amount < 0 ? 'bg-red-100' :
                        'bg-blue-100'
                      }`}>
                        {tx.type === 'deposit' || tx.amount > 0 ? <Plus className="w-4 h-4 text-green-600" /> :
                         tx.type === 'withdrawal' || tx.amount < 0 ? <Minus className="w-4 h-4 text-red-600" /> :
                         <RefreshCw className="w-4 h-4 text-blue-600" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{formatTransactionDescription(tx.type, tx.status)}</p>
                        <p className="text-xs text-gray-500">{formatDate(tx.created_at)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        tx.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {tx.amount > 0 ? '+' : ''}{Number(tx.amount || 0).toFixed(2)}
                      </p>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        tx.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
