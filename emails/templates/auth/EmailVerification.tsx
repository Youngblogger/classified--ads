import { Link, Text } from '@react-email/components';
import EmailLayout from '../../components/EmailLayout';
import CTAButton from '../../components/CTAButton';
import SecurityNotice from '../../components/SecurityNotice';
import { COLORS, FONT, FONT_SIZE } from '../../utils/constants';
import type { EmailVerificationProps } from '../../utils/types';

export default function EmailVerification({
  recipientName = 'there',
  verificationLink,
  expiryMinutes = 30,
  previewText,
}: EmailVerificationProps) {
  return (
    <EmailLayout
      previewText={previewText || `Verify your email address to start using iList.`}
      showAppBar
      pageTitle="Security"
    >
      <Text style={{ fontSize: '22px', fontWeight: '700', color: COLORS.text, textAlign: 'center', margin: '0 0 6px', fontFamily: FONT.display }}>
        Verify your email
      </Text>

      <Text style={{ fontSize: '15px', lineHeight: '24px', color: COLORS.textSecondary, textAlign: 'center', margin: '0 0 24px', fontFamily: FONT.body }}>
        Hi {recipientName},
        <br /><br />
        Please confirm this email address to activate your account.
      </Text>

      <CTAButton href={verificationLink}>
        Verify Email Address
      </CTAButton>

      <Text style={{ fontSize: '13px', lineHeight: '20px', color: COLORS.textSecondary, textAlign: 'center', margin: '16px 0 0', fontFamily: FONT.body }}>
        This link expires in {expiryMinutes} minutes.
      </Text>

      <SecurityNotice>
        If you didn&apos;t create an account on iList, you can safely ignore this email.
      </SecurityNotice>
    </EmailLayout>
  );
}
