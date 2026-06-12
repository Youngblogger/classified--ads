import { Text } from '@react-email/components';
import EmailLayout from '../../components/EmailLayout';
import CTAButton from '../../components/CTAButton';
import SecurityNotice from '../../components/SecurityNotice';
import { COLORS } from '../../utils/constants';
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
    >
      <Text style={{ fontSize: '24px', fontWeight: '700', color: COLORS.text, textAlign: 'center', margin: '0 0 8px' }}>
        Verify your email
      </Text>

      <Text style={{ fontSize: '14px', lineHeight: '22px', color: COLORS.textSecondary, textAlign: 'center', margin: '0 0 24px' }}>
        Hi {recipientName},
        <br /><br />
        Thanks for signing up! Please verify your email address to get started.
      </Text>

      <CTAButton href={verificationLink}>
        Verify Email Address
      </CTAButton>

      <Text style={{ fontSize: '13px', lineHeight: '20px', color: COLORS.textSecondary, textAlign: 'center', margin: '16px 0 0' }}>
        This link expires in {expiryMinutes} minutes.
      </Text>

      <SecurityNotice>
        If you didn&apos;t create an account on iList, you can safely ignore this email.
      </SecurityNotice>
    </EmailLayout>
  );
}
