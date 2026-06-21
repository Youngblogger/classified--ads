export const SUCCESS_STATUSES = ['success', 'successful', 'approved', 'confirmed', 'credited', 'completed'];
export const FAILED_STATUSES = ['failed', 'declined', 'rejected', 'expired'];

export function isSuccessStatus(status: string): boolean {
  return SUCCESS_STATUSES.includes(status.toLowerCase());
}

export function isFailedStatus(status: string): boolean {
  return FAILED_STATUSES.includes(status.toLowerCase());
}

export function isPendingStatus(status: string): boolean {
  return status.toLowerCase() === 'pending';
}

export function formatTransactionDescription(type: string, status: string): string {
  const s = status ? status.toLowerCase() : '';
  const isSuccess = isSuccessStatus(s);
  const isFailed = isFailedStatus(s);

  switch (type) {
    case 'deposit':
      if (isSuccess) return 'Wallet successfully funded';
      if (isFailed) return 'Wallet funding failed';
      return 'Wallet funding pending confirmation';
    case 'payment':
      if (isSuccess) return 'Boost payment successful';
      if (isFailed) return 'Boost payment failed';
      return 'Boost payment pending';
    case 'promotion':
      return 'Ad promotion boost';
    case 'refund':
      return 'Payment refund';
    case 'withdrawal':
      if (isSuccess) return 'Withdrawal to bank account';
      return 'Withdrawal request pending';
    default:
      return `${type.replace(/_/g, ' ')} transaction`;
  }
}

export function formatTransactionStatus(status: string): string {
  const lower = status.toLowerCase();
  if (SUCCESS_STATUSES.includes(lower)) return 'Successful';
  if (FAILED_STATUSES.includes(lower)) return 'Failed';
  if (['cancelled', 'canceled'].includes(lower)) return 'Cancelled';
  if (lower === 'refunded') return 'Refunded';
  if (lower === 'expired') return 'Expired';
  if (lower === 'pending') return 'Pending';
  return status.charAt(0).toUpperCase() + status.slice(1);
}
