import { Link, Text } from '@react-email/components';
import EmailLayout from '../../components/EmailLayout';
import CTAButton from '../../components/CTAButton';
import SectionCard from '../../components/SectionCard';
import SecurityNotice from '../../components/SecurityNotice';
import { COLORS } from '../../utils/constants';
import type { PasswordResetProps } from '../../utils/types';

export default function PasswordReset({
  recipientName = 'there',
  resetLink,
  expiryMinutes = 30,
  ipAddress,
  device,
  previewText,
}: PasswordResetProps) {
  return (
    <EmailLayout
      previewText={previewText || `Reset your iList password`}
    >
      <Text style={{ fontSize: '24px', fontWeight: '700', color: COLORS.text, textAlign: 'center', margin: '0 0 8px' }}>
        Reset your password
      </Text>

      <Text style={{ fontSize: '14px', lineHeight: '22px', color: COLORS.textSecondary, textAlign: 'center', margin: '0 0 24px' }}>
        Hi {recipientName},
        <br /><br />
        We received a request to reset your password. Click the button below to create a new one.
      </Text>

      <CTAButton href={resetLink}>
        Reset Password
      </CTAButton>

      <Text style={{ fontSize: '13px', lineHeight: '20px', color: COLORS.textSecondary, textAlign: 'center', margin: '16px 0 0' }}>
        This link expires in {expiryMinutes} minutes.
        <br />
        If the button doesn&apos;t work, copy and paste this URL into your browser:
      </Text>

      <Link href={resetLink} style={{ color: COLORS.primary, fontSize: '12px', wordBreak: 'break-all', textAlign: 'center', display: 'block', margin: '8px 0' }}>
        {resetLink}
      </Link>

      {(ipAddress || device) && (
        <SectionCard title="REQUEST DETAILS">
          {ipAddress && (
            <Text style={{ fontSize: '13px', lineHeight: '20px', color: COLORS.text, margin: '0 0 4px' }}>
              IP Address: {ipAddress}
            </Text>
          )}
          {device && (
            <Text style={{ fontSize: '13px', lineHeight: '20px', color: COLORS.text, margin: '0' }}>
              Device: {device}
            </Text>
          )}
        </SectionCard>
      )}

      <SecurityNotice>
        If you didn&apos;t request a password reset, please{' '}
        <Link href="https://classified-ads-nu.vercel.app/support" style={{ color: COLORS.primary, textDecoration: 'underline' }}>
          contact support
        </Link>
        {' '}immediately.
      </SecurityNotice>
    </EmailLayout>
  );
}
