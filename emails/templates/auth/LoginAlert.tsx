import { Text } from '@react-email/components';
import EmailLayout from '../../components/EmailLayout';
import SectionCard from '../../components/SectionCard';
import CTAButton from '../../components/CTAButton';
import SecurityNotice from '../../components/SecurityNotice';
import { COLORS } from '../../utils/constants';
import type { LoginAlertProps } from '../../utils/types';

export default function LoginAlert({
  recipientName = 'there',
  ipAddress,
  device,
  location,
  time,
  previewText,
}: LoginAlertProps) {
  return (
    <EmailLayout
      previewText={previewText || `New sign-in to your iList account`}
    >
      <Text style={{ fontSize: '24px', fontWeight: '700', color: COLORS.text, textAlign: 'center', margin: '0 0 8px' }}>
        New sign-in detected
      </Text>

      <Text style={{ fontSize: '14px', lineHeight: '22px', color: COLORS.textSecondary, textAlign: 'center', margin: '0 0 24px' }}>
        Hi {recipientName},
        <br /><br />
        A new sign-in was detected on your iList account.
      </Text>

      <SectionCard title="SIGN-IN DETAILS">
        {location && (
          <Text style={{ fontSize: '13px', lineHeight: '20px', color: COLORS.text, margin: '0 0 4px' }}>
            Location: {location}
          </Text>
        )}
        <Text style={{ fontSize: '13px', lineHeight: '20px', color: COLORS.text, margin: '0 0 4px' }}>
          IP Address: {ipAddress}
        </Text>
        <Text style={{ fontSize: '13px', lineHeight: '20px', color: COLORS.text, margin: '0 0 4px' }}>
          Device: {device}
        </Text>
        <Text style={{ fontSize: '13px', lineHeight: '20px', color: COLORS.text, margin: '0' }}>
          Time: {time}
        </Text>
      </SectionCard>

      <CTAButton href="https://classified-ads-nu.vercel.app/account/security" variant="secondary">
        Review Account Activity
      </CTAButton>

      <SecurityNotice icon="⚠️">
        If this wasn&apos;t you, please change your password and{' '}
        <a href="https://classified-ads-nu.vercel.app/support" style={{ color: COLORS.primary }}>
          contact support
        </a>{' '}
        immediately.
      </SecurityNotice>
    </EmailLayout>
  );
}
