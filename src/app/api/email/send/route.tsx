import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '../../../../../emails/utils/send';
import Welcome from '../../../../../emails/templates/auth/Welcome';
import EmailVerification from '../../../../../emails/templates/auth/EmailVerification';
import OtpEmail from '../../../../../emails/templates/auth/OtpEmail';
import PasswordReset from '../../../../../emails/templates/auth/PasswordReset';
import PasswordChanged from '../../../../../emails/templates/auth/PasswordChanged';
import LoginAlert from '../../../../../emails/templates/auth/LoginAlert';
import AdPosted from '../../../../../emails/templates/marketplace/AdPosted';
import AdApproved from '../../../../../emails/templates/marketplace/AdApproved';
import AdRejected from '../../../../../emails/templates/marketplace/AdRejected';
import AdExpired from '../../../../../emails/templates/marketplace/AdExpired';
import AdBoosted from '../../../../../emails/templates/marketplace/AdBoosted';
import BoostExpiring from '../../../../../emails/templates/marketplace/BoostExpiring';
import PaymentReceipt from '../../../../../emails/templates/marketplace/PaymentReceipt';
import WalletFunded from '../../../../../emails/templates/marketplace/WalletFunded';
import WithdrawalSuccessful from '../../../../../emails/templates/marketplace/WithdrawalSuccessful';
import NewMessage from '../../../../../emails/templates/messaging/NewMessage';
import SellerReply from '../../../../../emails/templates/messaging/SellerReply';
import ReportReceived from '../../../../../emails/templates/admin/ReportReceived';
import AccountWarning from '../../../../../emails/templates/admin/AccountWarning';
import VerificationStatus from '../../../../../emails/templates/admin/VerificationStatus';

const templateMap: Record<string, (props: Record<string, unknown>) => React.ReactElement> = {
  Welcome: (props) => <Welcome {...(props as Record<string, string>)} />,
  EmailVerification: (props) => <EmailVerification verificationLink="https://example.com/verify" {...(props as Record<string, string>)} />,
  OtpEmail: (props) => <OtpEmail otp="123456" {...(props as Record<string, string>)} />,
  PasswordReset: (props) => <PasswordReset resetLink="https://example.com/reset" ipAddress="192.168.1.1" device="Chrome on Windows" {...(props as Record<string, string>)} />,
  PasswordChanged: (props) => <PasswordChanged ipAddress="192.168.1.1" device="Chrome on Windows" location="Lagos, NG" {...(props as Record<string, string>)} />,
  LoginAlert: (props) => <LoginAlert ipAddress="192.168.1.1" device="Chrome on Windows" location="Lagos, NG" time="June 11, 2026 3:42 PM" {...(props as Record<string, string>)} />,
  AdPosted: (props) => <AdPosted adTitle="iPhone 14 Pro Max 256GB" adSlug="iphone-14-pro-max" category="Electronics" price="850,000" expiresIn="30 days" {...(props as Record<string, string>)} />,
  AdApproved: (props) => <AdApproved adTitle="iPhone 14 Pro Max 256GB" adSlug="iphone-14-pro-max" {...(props as Record<string, string>)} />,
  AdRejected: (props) => <AdRejected adTitle="iPhone 14 Pro Max 256GB" reason="Images do not meet quality standards. Please upload clear, well-lit photos." appealLink="https://example.com/edit" {...(props as Record<string, string>)} />,
  AdExpired: (props) => <AdExpired adTitle="iPhone 14 Pro Max 256GB" adSlug="iphone-14-pro-max" repostLink="https://example.com/repost" {...(props as Record<string, string>)} />,
  AdBoosted: (props) => <AdBoosted adTitle="iPhone 14 Pro Max 256GB" adSlug="iphone-14-pro-max" plan="Gold - 7 Days" amount="3,500" walletBalance="12,000" expiryDate="June 18, 2026" transactionId="TXN-123456789" {...(props as Record<string, string>)} />,
  BoostExpiring: (props) => <BoostExpiring adTitle="iPhone 14 Pro Max 256GB" adSlug="iphone-14-pro-max" daysLeft={1} renewLink="https://example.com/renew" {...(props as Record<string, string>)} />,
  PaymentReceipt: (props) => <PaymentReceipt receiptNumber="RCP-20260611-001" paymentMethod="Paystack - Card" date="June 11, 2026" amount="3,500" total="3,500" walletBalance="12,000" {...(props as Record<string, string>)} />,
  WalletFunded: (props) => <WalletFunded amount="50,000" method="Paystack - Transfer" balance="62,000" transactionId="TXN-123456789" date="June 11, 2026" {...(props as Record<string, string>)} />,
  WithdrawalSuccessful: (props) => <WithdrawalSuccessful amount="20,000" bankName="GTBank" accountNumber="0123456789" accountName="John Doe" balance="42,000" reference="WDR-123456" estimatedArrival="June 14, 2026" {...(props as Record<string, string>)} />,
  NewMessage: (props) => <NewMessage senderName="Sarah" adTitle="iPhone 14 Pro Max 256GB" adSlug="iphone-14-pro-max" messagePreview="Hi, is this still available? I'm interested and would like to come see it today." replyLink="https://example.com/messages" {...(props as Record<string, string>)} />,
  SellerReply: (props) => <SellerReply sellerName="John" adTitle="iPhone 14 Pro Max 256GB" adSlug="iphone-14-pro-max" replyPreview="Yes, it's still available! You can come by anytime after 4pm today." viewLink="https://example.com/messages" {...(props as Record<string, string>)} />,
  ReportReceived: (props) => <ReportReceived reportId="RPT-20260611-001" reportedItem="iPhone 14 Pro Max 256GB" reason="Suspicious pricing" reportedBy="user@example.com" recipientName="Admin" {...(props as Record<string, string>)} />,
  AccountWarning: (props) => <AccountWarning reason="Inappropriate ad content" details="Your ad 'iPhone 14 Pro Max 256GB' was reported for having misleading pricing. Please update your listing to reflect the actual price." warningType="first" appealLink="https://example.com/appeal" {...(props as Record<string, string>)} />,
  VerificationStatus: (props) => <VerificationStatus status="approved" type="Identity" dashboardLink="https://example.com/dashboard" {...(props as Record<string, string>)} />,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { template, to, subject, props } = body;

    if (!template || !to || !subject) {
      return NextResponse.json(
        { error: 'Missing required fields: template, to, subject' },
        { status: 400 }
      );
    }

    const componentFn = templateMap[template];

    if (!componentFn) {
      return NextResponse.json(
        { error: `Unknown template: ${template}` },
        { status: 400 }
      );
    }

    const react = componentFn(props || {});

    const result = await sendEmail({
      to,
      subject,
      react,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
