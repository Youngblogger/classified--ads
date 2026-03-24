'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  CreditCard, 
  Building2, 
  Smartphone, 
  Wallet, 
  Check, 
  Loader2, 
  Copy, 
  CheckCircle, 
  RefreshCw,
  AlertCircle,
  Clock,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { promotionsApi } from '@/lib/api';
import toast from 'react-hot-toast';

export type PaymentMethod = 'card' | 'bank' | 'ussd' | 'wallet';

interface PaymentMethodsProps {
  selectedMethod: PaymentMethod | null;
  onSelectMethod: (method: PaymentMethod) => void;
  walletBalance?: number;
  planPrice?: number;
  planId?: number;
  adId?: number;
  disabled?: boolean;
  onPaymentSuccess?: () => void;
  onPaymentError?: (error: string) => void;
}

interface CardDetails {
  cardNumber: string;
  expiry: string;
  cvv: string;
  cardHolder: string;
}

interface PaymentState {
  processing: boolean;
  error: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  paymentData: any;
}

const paymentMethods = [
  {
    id: 'card' as PaymentMethod,
    name: 'Card Payment',
    description: 'Pay with debit/credit card',
    icon: CreditCard,
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'bank' as PaymentMethod,
    name: 'Virtual Account',
    description: 'Get instant account number',
    icon: Building2,
    color: 'from-green-500 to-green-600',
  },
  {
    id: 'ussd' as PaymentMethod,
    name: 'USSD',
    description: 'Dial *bank code# to pay',
    icon: Smartphone,
    color: 'from-purple-500 to-purple-600',
  },
  {
    id: 'wallet' as PaymentMethod,
    name: 'Wallet',
    description: 'Pay from wallet balance',
    icon: Wallet,
    color: 'from-orange-500 to-orange-600',
  },
];

export default function PaymentMethods({ 
  selectedMethod, 
  onSelectMethod,
  walletBalance = 0,
  planPrice = 0,
  planId,
  adId,
  disabled = false,
  onPaymentSuccess,
  onPaymentError,
}: PaymentMethodsProps) {
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardHolder: '',
  });
  const [showCardForm, setShowCardForm] = useState(false);
  const [showCvv, setShowCvv] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const [paymentState, setPaymentState] = useState<PaymentState>({
    processing: false,
    error: null,
    status: 'pending',
    paymentData: null,
  });
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);

  const hasInsufficientWallet = walletBalance < planPrice;

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardInputChange = (field: keyof CardDetails, value: string) => {
    let formattedValue = value;
    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expiry') {
      formattedValue = formatExpiry(value);
    } else if (field === 'cvv') {
      formattedValue = value.replace(/[^0-9]/g, '').substring(0, 4);
    } else {
      formattedValue = value;
    }
    setCardDetails(prev => ({ ...prev, [field]: formattedValue }));
    setCardError(null);
  };

  const validateCard = (): boolean => {
    const cardNumber = cardDetails.cardNumber.replace(/\s/g, '');
    if (cardNumber.length < 16) {
      setCardError('Please enter a valid card number');
      return false;
    }
    if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiry)) {
      setCardError('Please enter a valid expiry date (MM/YY)');
      return false;
    }
    if (cardDetails.cvv.length < 3) {
      setCardError('Please enter a valid CVV');
      return false;
    }
    if (cardDetails.cardHolder.trim().length < 2) {
      setCardError('Please enter the card holder name');
      return false;
    }
    return true;
  };

  const handleCardPayment = async () => {
    if (paymentState.processing) return;
    if (!adId || !planId) {
      setCardError('Missing payment details');
      return;
    }

    setPaymentState({ processing: true, error: null, status: 'processing', paymentData: null });

    try {
      const response = await promotionsApi.buy({
        ad_id: adId,
        plan_id: planId,
        payment_method: 'card',
      });

      if (response.data.success) {
        setPaymentState({
          processing: false,
          error: null,
          status: 'processing',
          paymentData: response.data,
        });
        
        if (response.data.authorization_url) {
          window.location.href = response.data.authorization_url;
        } else if (response.data.payment?.reference) {
          pollPaymentStatus(response.data.payment.reference);
        }
      } else {
        throw new Error(response.data.message || 'Payment initialization failed');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to process card payment';
      setPaymentState({ processing: false, error: errorMsg, status: 'failed', paymentData: null });
      onPaymentError?.(errorMsg);
    }
  };

  const handleVirtualAccount = async () => {
    if (!adId || !planId) return;

    setPaymentState({ processing: true, error: null, status: 'processing', paymentData: null });

    try {
      const response = await promotionsApi.buy({
        ad_id: adId,
        plan_id: planId,
        payment_method: 'bank',
      });

      if (response.data.success) {
        setPaymentState({
          processing: false,
          error: null,
          status: 'processing',
          paymentData: response.data,
        });
      } else {
        throw new Error(response.data.message || 'Failed to create virtual account');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to create virtual account';
      setPaymentState({ processing: false, error: errorMsg, status: 'failed', paymentData: null });
    }
  };

  const handleUssdPayment = async () => {
    if (!adId || !planId) return;

    setPaymentState({ processing: true, error: null, status: 'processing', paymentData: null });

    try {
      const response = await promotionsApi.buy({
        ad_id: adId,
        plan_id: planId,
        payment_method: 'ussd',
      });

      if (response.data.success) {
        setPaymentState({
          processing: false,
          error: null,
          status: 'processing',
          paymentData: response.data,
        });
      } else {
        throw new Error(response.data.message || 'Failed to initiate USSD payment');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to initiate USSD payment';
      setPaymentState({ processing: false, error: errorMsg, status: 'failed', paymentData: null });
    }
  };

  const handleWalletPayment = async () => {
    if (!adId || !planId) return;

    setPaymentState({ processing: true, error: null, status: 'processing', paymentData: null });

    try {
      const response = await promotionsApi.buy({
        ad_id: adId,
        plan_id: planId,
        payment_method: 'wallet',
      });

      if (response.data.success) {
        setPaymentState({
          processing: false,
          error: null,
          status: 'completed',
          paymentData: response.data,
        });
        onPaymentSuccess?.();
        toast.success('Payment successful! Your ad is now promoted.');
      } else {
        throw new Error(response.data.message || 'Wallet payment failed');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to process wallet payment';
      setPaymentState({ processing: false, error: errorMsg, status: 'failed', paymentData: null });
      onPaymentError?.(errorMsg);
    }
  };

  const pollPaymentStatus = useCallback(async (reference: string) => {
    const poll = async () => {
      try {
        const res = await promotionsApi.verifyPayment(reference);
        if (res.data.success) {
          setPaymentState({
            processing: false,
            error: null,
            status: 'completed',
            paymentData: res.data,
          });
          onPaymentSuccess?.();
          toast.success('Payment successful! Your ad is now promoted.');
        }
      } catch (err) {
        // Continue polling
      }
    };
    
    const interval = setInterval(poll, 5000);
    setTimeout(() => clearInterval(interval), 120000);
  }, [onPaymentSuccess]);

  const checkBankPayment = async () => {
    if (!paymentState.paymentData?.payment?.reference) return;
    
    setCheckingPayment(true);
    try {
      const res = await promotionsApi.verifyPayment(paymentState.paymentData.payment.reference);
      if (res.data.success) {
        setPaymentState({
          processing: false,
          error: null,
          status: 'completed',
          paymentData: res.data,
        });
        onPaymentSuccess?.();
        toast.success('Payment received! Your ad is now promoted.');
      } else {
        toast.error('Payment not yet received. Please transfer to the account details above.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to check payment status');
    } finally {
      setCheckingPayment(false);
    }
  };

  const checkUssdPayment = async () => {
    if (!paymentState.paymentData?.payment?.reference) return;
    
    setCheckingPayment(true);
    try {
      const res = await promotionsApi.verifyPayment(paymentState.paymentData.payment.reference);
      if (res.data.success) {
        setPaymentState({
          processing: false,
          error: null,
          status: 'completed',
          paymentData: res.data,
        });
        onPaymentSuccess?.();
        toast.success('Payment successful! Your ad is now promoted.');
      } else {
        toast.error('Payment not yet received. Please complete the USSD transaction.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to check payment status');
    } finally {
      setCheckingPayment(false);
    }
  };

  useEffect(() => {
    if (selectedMethod === 'bank' && !paymentState.paymentData) {
      handleVirtualAccount();
    } else if (selectedMethod === 'ussd' && !paymentState.paymentData) {
      handleUssdPayment();
    }
  }, [selectedMethod, adId, planId]);

  useEffect(() => {
    if (paymentState.paymentData?.bank_details?.expires_at) {
      const updateTimeLeft = () => {
        const expires = new Date(paymentState.paymentData.bank_details.expires_at);
        const now = new Date();
        
        if (expires <= now) {
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
    }
  }, [paymentState.paymentData?.bank_details?.expires_at]);

  useEffect(() => {
    if (selectedMethod === 'bank' && paymentState.status === 'processing') {
      const interval = setInterval(checkBankPayment, 10000);
      return () => clearInterval(interval);
    }
  }, [selectedMethod, paymentState.status, paymentState.paymentData?.payment?.reference]);

  useEffect(() => {
    if (selectedMethod === 'ussd' && paymentState.status === 'processing') {
      const interval = setInterval(checkUssdPayment, 10000);
      return () => clearInterval(interval);
    }
  }, [selectedMethod, paymentState.status, paymentState.paymentData?.payment?.reference]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatAmount = (amt: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amt);
  };

  const handleProceed = () => {
    if (selectedMethod === 'card') {
      handleCardPayment();
    } else if (selectedMethod === 'bank') {
      handleVirtualAccount();
    } else if (selectedMethod === 'ussd') {
      handleUssdPayment();
    } else if (selectedMethod === 'wallet') {
      handleWalletPayment();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Select Payment Method</h2>
      
      <div className="space-y-3">
        {paymentMethods.map((method) => {
          const isSelected = selectedMethod === method.id;
          const isDisabled = disabled || (method.id === 'wallet' && hasInsufficientWallet);
          const Icon = method.icon;

          return (
            <button
              key={method.id}
              onClick={() => !isDisabled && onSelectMethod(method.id)}
              disabled={isDisabled}
              className={`
                w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50 shadow-sm' 
                  : isDisabled
                    ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }
              `}
            >
              <div className={`p-2 rounded-lg bg-gradient-to-r ${method.color} text-white`}>
                <Icon className="w-5 h-5" />
              </div>
              
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">{method.name}</p>
                <p className="text-sm text-gray-500">{method.description}</p>
              </div>
              
              {isSelected && (
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selectedMethod === 'wallet' && hasInsufficientWallet && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">
            Insufficient wallet balance. 
            <span className="font-medium"> Current: ₦{walletBalance.toLocaleString()} | Required: ₦{planPrice.toLocaleString()}</span>
          </p>
        </div>
      )}

      {selectedMethod && (
        <div className="mt-6 border-t border-gray-200 pt-6">
          {selectedMethod === 'card' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-500" />
                Card Payment
              </h3>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  You will be redirected to our secure payment page to enter your card details and complete the payment.
                </p>
              </div>

              {cardError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {cardError}
                </div>
              )}

              {paymentState.error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {paymentState.error}
                </div>
              )}

              <button
                onClick={handleProceed}
                disabled={paymentState.processing}
                className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {paymentState.processing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Pay {formatAmount(planPrice)}
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" />
                Secured Payment
              </p>
              
              {/* Payment Logos */}
              <div className="flex items-center justify-center gap-3 mt-3">
                {/* Visa */}
                <div className="h-8 px-2 bg-white border border-gray-200 rounded flex items-center justify-center">
                  <svg viewBox="0 0 40 24" className="h-4">
                    <rect width="40" height="24" rx="3" fill="#1A1F71"/>
                    <text x="20" y="16" fill="white" fontSize="10" fontWeight="bold" fontFamily="Arial" textAnchor="middle">VISA</text>
                  </svg>
                </div>
                {/* Mastercard */}
                <div className="h-8 px-2 bg-white border border-gray-200 rounded flex items-center justify-center">
                  <svg viewBox="0 0 32 24" className="h-4">
                    <circle cx="12" cy="12" r="10" fill="#EB001B"/>
                    <circle cx="20" cy="12" r="10" fill="#F79E1B"/>
                    <path d="M16 5a10 10 0 000 14 10 10 0 000-14z" fill="#FF5F00"/>
                  </svg>
                </div>
              </div>
            </div>
          )}

          {selectedMethod === 'bank' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-green-500" />
                Virtual Account Details
              </h3>

              {paymentState.processing && !paymentState.paymentData && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-2" />
                  <span className="text-gray-600">Creating virtual account...</span>
                </div>
              )}

              {paymentState.paymentData?.bank_details && (
                <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-600">Bank</span>
                    <span className="font-medium text-gray-900">{paymentState.paymentData.bank_details.bank_name}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-600">Account Name</span>
                    <span className="font-medium text-gray-900">{paymentState.paymentData.bank_details.account_name}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-600">Account Number</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-lg text-gray-900">
                        {paymentState.paymentData.bank_details.account_number}
                      </span>
                      <button
                        onClick={() => copyToClipboard(paymentState.paymentData.bank_details.account_number)}
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
                    <span className="font-bold text-lg text-green-600">{formatAmount(planPrice)}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>Expires in: </span>
                      <span className="font-medium text-gray-900">{timeLeft}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Waiting for payment... {checkingPayment && <Loader2 className="w-3 h-3 inline animate-spin ml-1" />}</span>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> Make sure to transfer exactly {formatAmount(planPrice)}. 
                  Any overpayment or underpayment may not be detected automatically.
                </p>
              </div>

              <button
                onClick={checkBankPayment}
                disabled={checkingPayment || paymentState.status === 'completed'}
                className="w-full py-3 px-4 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {checkingPayment ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Checking...
                  </>
                ) : (
                    <>
                    <CheckCircle className="w-5 h-5" />
                    I&apos;ve Made the Transfer
                  </>
                )}
              </button>
            </div>
          )}

          {selectedMethod === 'ussd' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-purple-500" />
                USSD Payment
              </h3>

              {paymentState.processing && !paymentState.paymentData && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-2" />
                  <span className="text-gray-600">Generating USSD code...</span>
                </div>
              )}

              {paymentState.paymentData?.ussd && (
                <div className="text-center py-6">
                  <p className="text-gray-600 mb-4">Dial the USSD code below on your phone to complete payment</p>
                  
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 mb-4">
                    <p className="text-2xl font-mono font-bold text-purple-700">
                      {paymentState.paymentData.ussd.code}
                    </p>
                  </div>

                  <div className="flex justify-center gap-4 text-sm text-gray-600 mb-4">
                    <span>Amount: <strong>{formatAmount(planPrice)}</strong></span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 p-3 bg-purple-50 text-purple-700 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span>Waiting for payment... {checkingPayment && <Loader2 className="w-3 h-3 inline animate-spin ml-1" />}</span>
              </div>

              <button
                onClick={checkUssdPayment}
                disabled={checkingPayment || paymentState.status === 'completed'}
                className="w-full py-3 px-4 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {checkingPayment ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Check Payment Status
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                Dial the USSD code and follow the prompts to complete your payment
              </p>
            </div>
          )}

          {selectedMethod === 'wallet' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-orange-500" />
                Wallet Payment
              </h3>

              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Wallet Balance</span>
                  <span className="font-bold text-gray-900">{formatAmount(walletBalance)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Amount Required</span>
                  <span className="font-bold text-gray-900">{formatAmount(planPrice)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                  <span className="text-gray-600">Balance After</span>
                  <span className="font-bold text-green-600">{formatAmount(walletBalance - planPrice)}</span>
                </div>
              </div>

              {hasInsufficientWallet ? (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  Insufficient wallet balance
                </div>
              ) : (
                <button
                  onClick={handleProceed}
                  disabled={paymentState.processing}
                  className="w-full py-3 px-4 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {paymentState.processing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Pay {formatAmount(planPrice)} from Wallet
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
