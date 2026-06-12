import { Link, Text } from '@react-email/components';
import EmailLayout from '../../components/EmailLayout';
import SectionCard from '../../components/SectionCard';
import SecurityNotice from '../../components/SecurityNotice';
import StatusBadge from '../../components/StatusBadge';
import { COLORS, FONT, FONT_SIZE } from '../../utils/constants';
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
      showAppBar
      pageTitle="Security"
    >
      <StatusBadge status="success" label="Password Changed" />

      <Text style={{ fontSize: '22px', fontWeight: '700', color: COLORS.text, textAlign: 'center', margin: '16px 0 6px', fontFamily: FONT.display }}>
        Password updated ✅
      </Text>

      <Text style={{ fontSize: '15px', lineHeight: '24px', color: COLORS.textSecondary, textAlign: 'center', margin: '0 0 24px', fontFamily: FONT.body }}>
        Hi {recipientName},
        <br /><br />
        Your password was changed successfully.
      </Text>

      {(ipAddress || device || location) && (
        <SectionCard title="Change Details">
          {location && <Text style={{ fontSize: '14px', lineHeight: '22px', color: COLORS.text, margin: '0 0 4px', fontFamily: FONT.body }}>Location: {location}</Text>}
          {ipAddress && <Text style={{ fontSize: '14px', lineHeight: '22px', color: COLORS.text, margin: '0 0 4px', fontFamily: FONT.body }}>IP: {ipAddress}</Text>}
          {device && <Text style={{ fontSize: '14px', lineHeight: '22px', color: COLORS.text, margin: '0', fontFamily: FONT.body }}>Device: {device}</Text>}
        </SectionCard>
      )}

      <SecurityNotice>
        If you didn&apos;t make this change, please{' '}
        <Link href="https://classified-ads-nu.vercel.app/support" style={{ color: COLORS.primary, textDecoration: 'underline' }}>
          contact support
        </Link>
        {' '}immediately.
      </SecurityNotice>
    </EmailLayout>
  );
}
