import { render } from '@react-email/render';
import { NextRequest, NextResponse } from 'next/server';
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

const templates: Record<string, (props?: Record<string, string>) => React.ReactElement> = {
  Welcome: (props) => <Welcome {...props} />,
  EmailVerification: (props) => <EmailVerification verificationLink="https://example.com/verify" {...props} />,
  OtpEmail: (props) => <OtpEmail otp="123456" {...props} />,
  PasswordReset: (props) => <PasswordReset resetLink="https://example.com/reset" ipAddress="192.168.1.1" device="Chrome on Windows" {...props} />,
  PasswordChanged: (props) => <PasswordChanged ipAddress="192.168.1.1" device="Chrome on Windows" location="Lagos, NG" {...props} />,
  LoginAlert: (props) => <LoginAlert ipAddress="192.168.1.1" device="Chrome on Windows" location="Lagos, NG" time="June 11, 2026 3:42 PM" {...props} />,
  AdPosted: (props) => <AdPosted adTitle="iPhone 14 Pro Max 256GB" adSlug="iphone-14-pro-max" category="Electronics" price="850,000" expiresIn="30 days" {...props} />,
  AdApproved: (props) => <AdApproved adTitle="iPhone 14 Pro Max 256GB" adSlug="iphone-14-pro-max" {...props} />,
  AdRejected: (props) => <AdRejected adTitle="iPhone 14 Pro Max 256GB" reason="Images do not meet quality standards. Please upload clear, well-lit photos." appealLink="https://example.com/edit" {...props} />,
  AdExpired: (props) => <AdExpired adTitle="iPhone 14 Pro Max 256GB" adSlug="iphone-14-pro-max" repostLink="https://example.com/repost" {...props} />,
   AdBoosted: (props) => <AdBoosted adTitle="iPhone 14 Pro Max 256GB" adSlug="iphone-14-pro-max" plan="Gold - 7 Days" amount="3,500" walletBalance="12,000" expiryDate="June 28, 2026" transactionId="WLB20260621ABCDEFGHIJ" {...props} />,
  BoostExpiring: (props) => <BoostExpiring adTitle="iPhone 14 Pro Max 256GB" adSlug="iphone-14-pro-max" daysLeft={1} renewLink="https://example.com/renew" {...props} />,
   PaymentReceipt: (props) => <PaymentReceipt receiptNumber="ILR-20260621-A9KX4P00" paymentMethod="Paystack - Card" date="June 21, 2026" amount="3,500" total="3,500" walletBalance="12,000" {...props} />,
   WalletFunded: (props) => <WalletFunded amount="50,000" method="Paystack - Transfer" balance="62,000" transactionId="ILT-20260621-A9KX4P00" date="June 21, 2026" {...props} />,
   WithdrawalSuccessful: (props) => <WithdrawalSuccessful amount="20,000" bankName="GTBank" accountNumber="0123456789" accountName="John Doe" balance="42,000" reference="ILB-20260621-A9KX4P00" estimatedArrival="June 24, 2026" {...props} />,
  NewMessage: (props) => <NewMessage senderName="Sarah" adTitle="iPhone 14 Pro Max 256GB" adSlug="iphone-14-pro-max" messagePreview="Hi, is this still available? I'm interested and would like to come see it today." replyLink="https://example.com/messages" {...props} />,
  SellerReply: (props) => <SellerReply sellerName="John" adTitle="iPhone 14 Pro Max 256GB" adSlug="iphone-14-pro-max" replyPreview="Yes, it's still available! You can come by anytime after 4pm today." viewLink="https://example.com/messages" {...props} />,
  ReportReceived: (props) => <ReportReceived reportId="RPT-20260611-001" reportedItem="iPhone 14 Pro Max 256GB" reason="Suspicious pricing" reportedBy="user@example.com" recipientName="Admin" {...props} />,
  AccountWarning: (props) => <AccountWarning reason="Inappropriate ad content" details="Your ad 'iPhone 14 Pro Max 256GB' was reported for having misleading pricing. Please update your listing to reflect the actual price." warningType="first" appealLink="https://example.com/appeal" {...props} />,
  VerificationStatus: (props) => <VerificationStatus status="approved" type="Identity" dashboardLink="https://example.com/dashboard" {...props} />,
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const templateName = searchParams.get('template') || 'Welcome';
  const format = searchParams.get('format') || 'html';

  const templateFn = templates[templateName];

  if (!templateFn) {
    return NextResponse.json(
      { error: `Template "${templateName}" not found`, available: Object.keys(templates) },
      { status: 404 }
    );
  }

  try {
    const component = templateFn({ recipientName: 'John' });
    const html = await render(component);

    // Replace production URLs with local origin for preview
    const origin = new URL(request.url).origin;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://classified-ads-nu.vercel.app';
    const localHtml = html.replace(new RegExp(appUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), origin);

    if (format === 'html') {
      return new NextResponse(localHtml, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    return NextResponse.json({ html: localHtml });
  } catch (error) {
    console.error('Preview render error:', error);
    return NextResponse.json({ error: 'Failed to render template' }, { status: 500 });
  }
}
