export interface BaseEmailProps {
  previewText?: string;
  recipientName?: string;
}

export interface AuthEmailProps extends BaseEmailProps {
  otp?: string;
  verificationLink?: string;
  resetLink?: string;
  expiryMinutes?: number;
  ipAddress?: string;
  device?: string;
  location?: string;
}

export interface WelcomeEmailProps extends BaseEmailProps {}

export interface EmailVerificationProps extends BaseEmailProps {
  verificationLink: string;
  expiryMinutes?: number;
}

export interface OtpEmailProps extends BaseEmailProps {
  otp: string;
  expiryMinutes?: number;
}

export interface PasswordResetProps extends BaseEmailProps {
  resetLink: string;
  expiryMinutes?: number;
  ipAddress?: string;
  device?: string;
}

export interface PasswordChangedProps extends BaseEmailProps {
  ipAddress?: string;
  device?: string;
  location?: string;
}

export interface LoginAlertProps extends BaseEmailProps {
  ipAddress: string;
  device: string;
  location?: string;
  time: string;
}

export interface AdPostedProps extends BaseEmailProps {
  adTitle: string;
  adSlug: string;
  category: string;
  price: string;
  expiresIn: string;
}

export interface AdApprovedProps extends BaseEmailProps {
  adTitle: string;
  adSlug: string;
}

export interface AdRejectedProps extends BaseEmailProps {
  adTitle: string;
  reason: string;
  appealLink?: string;
}

export interface AdExpiredProps extends BaseEmailProps {
  adTitle: string;
  adSlug: string;
  repostLink?: string;
}

export interface AdBoostedProps extends BaseEmailProps {
  adTitle: string;
  adSlug: string;
  plan: string;
  amount: string;
  walletBalance: string;
  expiryDate: string;
  transactionId: string;
}

export interface BoostExpiringProps extends BaseEmailProps {
  adTitle: string;
  adSlug: string;
  daysLeft: number;
  renewLink?: string;
}

export interface PaymentReceiptProps extends BaseEmailProps {
  receiptNumber: string;
  paymentMethod: string;
  date: string;
  amount: string;
  fees?: string;
  total: string;
  walletBalance: string;
  items?: Array<{ name: string; price: string }>;
}

export interface WalletFundedProps extends BaseEmailProps {
  amount: string;
  method: string;
  balance: string;
  transactionId: string;
  date: string;
}

export interface WithdrawalSuccessProps extends BaseEmailProps {
  amount: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  balance: string;
  reference: string;
  estimatedArrival?: string;
}

export interface NewMessageProps extends BaseEmailProps {
  senderName: string;
  adTitle: string;
  adSlug: string;
  messagePreview: string;
  replyLink: string;
}

export interface SellerReplyProps extends BaseEmailProps {
  sellerName: string;
  adTitle: string;
  adSlug: string;
  replyPreview: string;
  viewLink: string;
}

export interface ReportReceivedProps extends BaseEmailProps {
  reportId: string;
  reportedItem: string;
  reason: string;
  reportedBy: string;
}

export interface AccountWarningProps extends BaseEmailProps {
  reason: string;
  details: string;
  appealLink?: string;
  warningType: 'first' | 'final';
}

export interface VerificationStatusProps extends BaseEmailProps {
  status: 'approved' | 'rejected';
  type: string;
  reason?: string;
  dashboardLink?: string;
}

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
  from?: string;
  replyTo?: string;
}

export interface EmailLog {
  id: string;
  to: string;
  subject: string;
  status: 'sent' | 'failed';
  error?: string;
  sentAt: Date;
}
