'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { Copy, Check, Loader2, Building2, CreditCard, Smartphone, Wallet } from 'lucide-react';

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

type PaymentMethod = 'card' | 'virtual_account' | 'ussd' | 'manual';

export default function WalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [funding, setFunding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('card');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [copied, setCopied] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchWallet = async () => {
    const timeoutId = setTimeout(() => {
      console.log('Wallet fetch timeout - forcing loading to false');
      setLoading(false);
    }, 10000);
    
    try {
      setLoading(true);
      const res = await api.get('/wallet');
      clearTimeout(timeoutId);
      setWallet(res.data.wallet);
      setTransactions(res.data.transactions?.data || res.data.transactions || []);
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error('Failed to fetch wallet:', error);
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
      api.post('/wallet/verify', { reference })
        .then(() => {
          toast.success('Payment successful! Your wallet has been credited.');
          window.history.replaceState({}, '', '/dashboard/wallet');
          fetchWallet();
        })
        .catch(() => {
          toast.error('Payment verification failed');
          window.history.replaceState({}, '', '/dashboard/wallet');
        });
    } else {
      fetchWallet();
    }
  }, []);

  const handleFund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) < 100) {
      toast.error('Minimum amount is ₦100');
      return;
    }

    setFunding(true);
    try {
      const apiMethod = method === 'manual' ? 'bank_transfer' : 'paystack';
      const res = await api.post('/wallet/fund', {
        amount: parseFloat(amount),
        method: apiMethod,
      });

      setPaymentDetails(res.data);
      setShowPaymentForm(true);
      
      if (method === 'card' && res.data.authorization_url) {
        window.location.href = res.data.authorization_url;
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setFunding(false);
    }
  };

  const handleVerify = async () => {
    if (!paymentDetails?.reference) return;
    
    if (method === 'manual' && selectedFile) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('reference', paymentDetails.reference);
        formData.append('proof', selectedFile);
        
        await api.post('/wallet/bank-transfer-proof', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
            }
          },
        });
        
        toast.success('Payment proof uploaded! Your transfer is pending admin approval.');
        setPaymentDetails(null);
        setShowPaymentForm(false);
        setAmount('');
        setSelectedFile(null);
        fetchWallet();
      } catch (error: any) {
        toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to upload proof');
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
      return;
    }
    
    try {
      const res = await api.post('/wallet/verify', { reference: paymentDetails.reference });
      toast.success('Wallet funded successfully!');
      setPaymentDetails(null);
      setShowPaymentForm(false);
      setAmount('');
      fetchWallet();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Verification failed');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(''), 2000);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'paystack':
        return 'Card';
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'manual':
        return 'Manual Transfer';
      default:
        return method || '-';
    }
  };

  const paymentMethods = [
    { 
      id: 'card', 
      name: 'Card Payment', 
      description: 'Pay with debit/credit card',
      icon: CreditCard,
      color: 'bg-blue-50 text-blue-600'
    },
    { 
      id: 'virtual_account', 
      name: 'Virtual Account', 
      description: 'Get instant account number',
      icon: Building2,
      color: 'bg-purple-50 text-purple-600'
    },
    { 
      id: 'ussd', 
      name: 'USSD', 
      description: 'Dial *bank code# to pay',
      icon: Smartphone,
      color: 'bg-green-50 text-green-600'
    },
    { 
      id: 'manual', 
      name: 'Bank Transfer', 
      description: 'Transfer to our bank account',
      icon: Wallet,
      color: 'bg-orange-50 text-orange-600'
    },
  ];

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Wallet</h1>
      </div>

      {/* Balance Cards */}
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

      {/* Fund Wallet */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Fund Wallet</h2>
        
        {!showPaymentForm ? (
          <form onSubmit={handleFund} className="space-y-4">
            {/* Amount Input */}
            <div>
              <input
                type="number"
                placeholder="Enter amount (min ₦100)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                min="100"
              />
            </div>

            {/* Payment Methods Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {paymentMethods.map((pm) => (
                <label
                  key={pm.id}
                  className={`
                    relative cursor-pointer rounded-xl border-2 p-4 transition-all
                    ${method === pm.id 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="method"
                    value={pm.id}
                    checked={method === pm.id}
                    onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                    className="sr-only"
                  />
                  <div className="flex flex-col items-center text-center">
                    <div className={`p-3 rounded-full ${pm.color} mb-2`}>
                      <pm.icon className="w-6 h-6" />
                    </div>
                    <p className="font-medium text-gray-900">{pm.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{pm.description}</p>
                  </div>
                  {method === pm.id && (
                    <div className="absolute top-2 right-2 w-4 h-4 bg-primary-500 rounded-full">
                      <div className="w-2 h-2 bg-white rounded-full absolute top-1 left-1"></div>
                    </div>
                  )}
                </label>
              ))}
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
                `Fund Wallet with ${formatAmount(amount || 0)}`
              )}
            </button>
          </form>
        ) : (
          /* Payment Details Display */
          <div className="space-y-4">
            {/* Card Payment - Redirect Message */}
            {method === 'card' && paymentDetails?.authorization_url && (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse"></div>
                <p className="text-lg font-medium">Redirecting to payment...</p>
                <p className="text-gray-500">If not redirected, click below</p>
                <a
                  href={paymentDetails.authorization_url}
                  className="inline-block mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg"
                >
                  Continue to Payment
                </a>
              </div>
            )}

            {/* Virtual Account */}
            {method === 'virtual_account' && paymentDetails?.bank_details && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-purple-900">Virtual Account Details</h3>
                </div>
                <p className="text-sm text-purple-700 mb-4">
                  Transfer to this account to fund your wallet. The account is unique to this transaction.
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-gray-500">Bank</span>
                    <span className="font-medium">{paymentDetails.bank_details.bank_name}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-gray-500">Account Number</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-lg">{paymentDetails.bank_details.account_number}</span>
                      <button
                        onClick={() => copyToClipboard(paymentDetails.bank_details.account_number, 'account')}
                        className="p-1 text-gray-400 hover:text-primary-600"
                      >
                        {copied === 'account' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-gray-500">Account Name</span>
                    <span className="font-medium">{paymentDetails.bank_details.account_name}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-gray-500">Amount</span>
                    <span className="font-bold text-purple-600">{formatAmount(paymentDetails.amount)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-gray-500">Reference</span>
                    <span className="font-mono text-sm">{paymentDetails.reference}</span>
                  </div>
                </div>
                <button
                  onClick={handleVerify}
                  className="w-full mt-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
                >
                  I&apos;ve Paid
                </button>
              </div>
            )}

            {/* USSD Payment */}
            {method === 'ussd' && paymentDetails?.ussd && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Smartphone className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-green-900">USSD Payment</h3>
                </div>
                <p className="text-sm text-green-700 mb-4">
                  Dial the USSD code below on your phone to complete payment.
                </p>
                <div className="text-center py-6 bg-white rounded-xl mb-4">
                  <p className="text-sm text-gray-500 mb-2">Dial this code</p>
                  <p className="text-3xl font-mono font-bold text-green-600">{paymentDetails.ussd.code}</p>
                  {paymentDetails.ussd.bank_name && (
                    <p className="text-sm text-gray-500 mt-2">{paymentDetails.ussd.bank_name}</p>
                  )}
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg mb-4">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-bold text-green-600">{formatAmount(paymentDetails.amount)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg mb-4">
                  <span className="text-gray-500">Reference</span>
                  <span className="font-mono text-sm">{paymentDetails.reference}</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleVerify}
                    className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                  >
                    Check & Verify Payment
                  </button>
                </div>
              </div>
            )}

            {/* Manual Bank Transfer */}
            {method === 'manual' && paymentDetails?.bank_details && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Wallet className="w-5 h-5 text-orange-600" />
                  <h3 className="font-semibold text-orange-900">Bank Transfer Details</h3>
                </div>
                <p className="text-sm text-orange-700 mb-4">
                  Transfer to the account below and upload your payment proof after transfer.
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-gray-500">Bank Name</span>
                    <span className="font-medium">{paymentDetails.bank_details.bank_name}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-gray-500">Account Number</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-lg">{paymentDetails.bank_details.account_number}</span>
                      <button
                        onClick={() => copyToClipboard(paymentDetails.bank_details.account_number, 'manual')}
                        className="p-1 text-gray-400 hover:text-orange-600"
                      >
                        {copied === 'manual' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-gray-500">Account Name</span>
                    <span className="font-medium">{paymentDetails.bank_details.account_name}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-gray-500">Amount</span>
                    <span className="font-bold text-orange-600">{formatAmount(paymentDetails.amount)}</span>
                  </div>
                </div>
                
                {/* Proof Upload */}
                <div className="mt-6 p-4 bg-white rounded-lg border-2 border-dashed border-orange-200">
                  <label className="block">
                    <span className="text-sm font-medium text-gray-700">Upload Payment Proof</span>
                    <span className="text-xs text-gray-500 block">(Screenshot or photo of transfer receipt)</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                    />
                  </label>
                  {selectedFile && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                      <Check className="w-4 h-4" />
                      <span>{selectedFile.name}</span>
                    </div>
                  )}
                </div>
                
                {uploadProgress > 0 && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-600 h-2 rounded-full transition-all" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 text-center">{uploadProgress}% uploaded</p>
                  </div>
                )}
                
                <button
                  onClick={handleVerify}
                  disabled={uploading || !selectedFile}
                  className="w-full mt-4 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    selectedFile ? 'Submit Payment Proof' : 'Select Payment Proof First'
                  )}
                </button>
              </div>
            )}

            <button
              onClick={() => {
                setShowPaymentForm(false);
                setPaymentDetails(null);
              }}
              className="w-full py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
            >
              Choose Different Method
            </button>
          </div>
        )}
      </div>



      {/* Transactions */}
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
                    <p className="text-xs text-gray-400">{formatDate(tx.created_at)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${tx.type === 'deposit' || tx.type === 'refund' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'deposit' || tx.type === 'refund' ? '+' : '-'}{formatAmount(tx.amount)}
                  </p>
                  <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${getStatusColor(tx.status)}`}>
                    {tx.status}
                  </span>
                  {tx.payment_method && (
                    <p className="text-xs text-gray-400 mt-1">
                      via {getPaymentMethodLabel(tx.payment_method)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
