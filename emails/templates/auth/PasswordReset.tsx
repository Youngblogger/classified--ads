import { Link, Text } from '@react-email/components';
import EmailLayout from '../../components/EmailLayout';
import CTAButton from '../../components/CTAButton';
import SectionCard from '../../components/SectionCard';
import SecurityNotice from '../../components/SecurityNotice';
import { COLORS, FONT, FONT_SIZE } from '../../utils/constants';
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
      showAppBar
      pageTitle="Security"
    >
      <Text style={{ fontSize: '22px', fontWeight: '700', color: COLORS.text, textAlign: 'center', margin: '0 0 6px', fontFamily: FONT.display }}>
        Reset your password
      </Text>

      <Text style={{ fontSize: '15px', lineHeight: '24px', color: COLORS.textSecondary, textAlign: 'center', margin: '0 0 24px', fontFamily: FONT.body }}>
        Hi {recipientName},
        <br /><br />
        We received a request to reset your password. Click below to create a new one.
      </Text>

      <CTAButton href={resetLink}>
        Reset Password
      </CTAButton>

      <Text style={{ fontSize: '13px', lineHeight: '20px', color: COLORS.textSecondary, textAlign: 'center', margin: '16px 0', fontFamily: FONT.body }}>
        Link expires in {expiryMinutes} minutes.
      </Text>

      <Link href={resetLink} style={{ color: COLORS.primary, fontSize: '12px', wordBreak: 'break-all', textAlign: 'center', display: 'block', margin: '0 0 16px', fontFamily: FONT.body }}>
        {resetLink}
      </Link>

      {(ipAddress || device) && (
        <SectionCard title="Request Details">
          {ipAddress && <Text style={{ fontSize: '14px', lineHeight: '22px', color: COLORS.text, margin: '0 0 4px', fontFamily: FONT.body }}>IP: {ipAddress}</Text>}
          {device && <Text style={{ fontSize: '14px', lineHeight: '22px', color: COLORS.text, margin: '0', fontFamily: FONT.body }}>Device: {device}</Text>}
        </SectionCard>
      )}

      <SecurityNotice>
        If you didn&apos;t request this, please{' '}
        <Link href="https://classified-ads-nu.vercel.app/support" style={{ color: COLORS.primary, textDecoration: 'underline' }}>
          contact support
        </Link>
        {' '}immediately.
      </SecurityNotice>
    </EmailLayout>
  );
}
