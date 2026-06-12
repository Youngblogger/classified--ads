import { Link, Text } from '@react-email/components';
import EmailLayout from '../../components/EmailLayout';
import SectionCard from '../../components/SectionCard';
import SecurityNotice from '../../components/SecurityNotice';
import { COLORS } from '../../utils/constants';
import type { PasswordChangedProps } from '../../utils/types';

export default function PasswordChanged({
  recipientName = 'there',
  ipAddress,
  device,
  location,
  previewText,
}: PasswordChangedProps) {
  return (
    <EmailLayout
      previewText={previewText || `Your iList password has been changed`}
    >
      <Text style={{ fontSize: '24px', fontWeight: '700', color: COLORS.text, textAlign: 'center', margin: '0 0 8px' }}>
        Password changed
      </Text>

      <Text style={{ fontSize: '14px', lineHeight: '22px', color: COLORS.textSecondary, textAlign: 'center', margin: '0 0 24px' }}>
        Hi {recipientName},
        <br /><br />
        Your password was successfully changed.
      </Text>

      {(ipAddress || device || location) && (
        <SectionCard title="CHANGE DETAILS">
          {location && (
            <Text style={{ fontSize: '13px', lineHeight: '20px', color: COLORS.text, margin: '0 0 4px' }}>
              Location: {location}
            </Text>
          )}
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
        If you didn&apos;t make this change, please{' '}
        <Link href="https://classified-ads-nu.vercel.app/support" style={{ color: COLORS.primary, textDecoration: 'underline' }}>
          contact support
        </Link>
        {' '}immediately to secure your account.
      </SecurityNotice>
    </EmailLayout>
  );
}
