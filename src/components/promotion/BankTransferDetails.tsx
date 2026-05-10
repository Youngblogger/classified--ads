import { useState, useEffect, useCallback } from 'react';
import { Copy, RefreshCw, Building2, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { promotionsApi } from '@/lib/api';

interface BankDetails {
  account_number: string;
  account_name: string;
  bank_name: string;
  reference: string;
  expires_at: string;
}

interface BankTransferDetailsProps {
  bankDetails: BankDetails;
  amount: number;
  reference: string;
  paymentId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function BankTransferDetails({
  bankDetails,
  amount,
  reference,
  paymentId,
  onSuccess,
  onCancel,
}: BankTransferDetailsProps) {
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<'pending' | 'paid' | 'expired'>('pending');
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const updateTimeLeft = () => {
      if (!bankDetails.expires_at) return;
      
      const expires = new Date(bankDetails.expires_at);
      const now = new Date();
      
      if (expires <= now) {
        setStatus('expired');
        setTimeLeft('Expired');
        return;
      }

      const diff = expires.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000);
    return () => clearInterval(interval);
  }, [bankDetails.expires_at]);

  const checkPaymentStatus = useCallback(async () => {
    if (status !== 'pending') return;

    try {
      setChecking(true);
      const response = await promotionsApi.verifyPayment(reference);

      if (response.data.success) {
        setStatus('paid');
        onSuccess();
      }
    } catch (err) {
      // Silently handle - still pending
    } finally {
      setChecking(false);
    }
  }, [reference, status, onSuccess]);

  useEffect(() => {
    const pollInterval = setInterval(checkPaymentStatus, 10000);
    return () => clearInterval(pollInterval);
  }, [checkPaymentStatus]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleResend = async () => {
    // Resend functionality - handled by backend
  };

  const formatAmount = (amt: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amt);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <Building2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Bank Transfer</h2>
        <p className="text-gray-500 mt-1">Transfer {formatAmount(amount)} to complete payment</p>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
          <span className="text-gray-600">Bank</span>
          <span className="font-medium text-gray-900">{bankDetails.bank_name}</span>
        </div>
        
        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
          <span className="text-gray-600">Account Name</span>
          <span className="font-medium text-gray-900">{bankDetails.account_name}</span>
        </div>
        
        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
          <span className="text-gray-600">Account Number</span>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-lg text-gray-900">
              {bankDetails.account_number}
            </span>
            <button
              onClick={() => copyToClipboard(bankDetails.account_number)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              {copied ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-gray-500" />
              )}
            </button>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Amount</span>
          <span className="font-bold text-lg text-green-600">{formatAmount(amount)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-gray-500">
          <Clock className="w-4 h-4" />
          <span>Expires in: </span>
          <span className={`font-medium ${status === 'expired' ? 'text-red-500' : 'text-gray-900'}`}>
            {timeLeft}
          </span>
        </div>
        
        {status !== 'expired' && (
          <button
            onClick={handleResend}
            disabled={resending}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
          >
            <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
            <span>Resend</span>
          </button>
        )}
      </div>

      {status === 'expired' ? (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <span>This account has expired. Please request a new one.</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span>Waiting for payment... {checking && <Loader2 className="w-3 h-3 inline animate-spin ml-1" />}</span>
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-sm text-yellow-800">
          <strong>Important:</strong> Make sure to transfer exactly {formatAmount(amount)}. 
          Any overpayment or underpayment may not be detected automatically.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
        >
          Cancel
        </button>
        <button
          onClick={checkPaymentStatus}
          disabled={checking || status === 'paid'}
          className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium disabled:opacity-50"
        >
          {checking ? 'Checking...' : 'I\'ve Paid'}
        </button>
      </div>
    </div>
  );
}
