import { CheckCircle, XCircle, Clock, AlertCircle, Loader2, ExternalLink } from 'lucide-react';

interface PaymentStatusProps {
  status: 'pending' | 'completed' | 'failed' | 'processing';
  message?: string;
  amount?: number;
  reference?: string;
  promotionName?: string;
  onViewPromotions?: () => void;
  onTryAgain?: () => void;
}

const statusConfig = {
  pending: {
    icon: Clock,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    title: 'Payment Pending',
  },
  processing: {
    icon: Loader2,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    title: 'Processing Payment',
  },
  completed: {
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    title: 'Payment Successful',
  },
  failed: {
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    title: 'Payment Failed',
  },
};

export default function PaymentStatus({
  status,
  message,
  amount,
  reference,
  promotionName,
  onViewPromotions,
  onTryAgain,
}: PaymentStatusProps) {
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const formatAmount = (amt: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amt);
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      <div className={`p-4 rounded-full ${config.bgColor} mb-4`}>
        {status === 'processing' ? (
          <StatusIcon className={`w-12 h-12 ${config.color} animate-spin`} />
        ) : (
          <StatusIcon className={`w-12 h-12 ${config.color}`} />
        )}
      </div>

      <h2 className={`text-xl font-semibold ${config.color} mb-2`}>
        {config.title}
      </h2>

      {message && (
        <p className="text-gray-600 text-center max-w-md mb-4">
          {message}
        </p>
      )}

      {status === 'completed' && promotionName && (
        <div className={`w-full max-w-md p-4 ${config.bgColor} border ${config.borderColor} rounded-xl mb-4`}>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Promotion</span>
            <span className="font-medium text-gray-900">{promotionName}</span>
          </div>
          {amount && (
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-600">Amount Paid</span>
              <span className="font-medium text-gray-900">{formatAmount(amount)}</span>
            </div>
          )}
        </div>
      )}

      {reference && (
        <div className="text-sm text-gray-500 mb-4">
          Reference: <span className="font-mono">{reference}</span>
        </div>
      )}

      {status === 'completed' ? (
        <div className="flex flex-col gap-3 w-full max-w-md">
          <button
            onClick={onViewPromotions}
            className="w-full py-3 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            View My Promotions
          </button>
        </div>
      ) : status === 'failed' ? (
        <div className="flex flex-col gap-3 w-full max-w-md">
          <button
            onClick={onTryAgain}
            className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
          >
            Try Again
          </button>
        </div>
      ) : status === 'pending' ? (
        <div className="flex flex-col gap-3 w-full max-w-md">
          <p className="text-sm text-gray-500 text-center">
            Please complete your payment to activate the promotion.
          </p>
        </div>
      ) : null}

      {status === 'processing' && (
        <div className="flex items-center gap-2 text-gray-500 mt-4">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Please wait while we confirm your payment...</span>
        </div>
      )}
    </div>
  );
}
