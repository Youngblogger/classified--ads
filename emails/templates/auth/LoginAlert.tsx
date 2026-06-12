import { Link, Text } from '@react-email/components';
import EmailLayout from '../../components/EmailLayout';
import SectionCard from '../../components/SectionCard';
import CTAButton from '../../components/CTAButton';
import SecurityNotice from '../../components/SecurityNotice';
import StatusBadge from '../../components/StatusBadge';
import { COLORS, FONT, FONT_SIZE } from '../../utils/constants';
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
      showAppBar
      pageTitle="Security"
    >
      <StatusBadge status="warning" label="New Sign-in" />

      <Text style={{ fontSize: '22px', fontWeight: '700', color: COLORS.text, textAlign: 'center', margin: '16px 0 6px', fontFamily: FONT.display }}>
        New sign-in detected
      </Text>

      <Text style={{ fontSize: '15px', lineHeight: '24px', color: COLORS.textSecondary, textAlign: 'center', margin: '0 0 24px', fontFamily: FONT.body }}>
        Hi {recipientName},
        <br /><br />
        A new sign-in was detected on your account.
      </Text>

      <SectionCard title="Sign-in Details">
        {location && <Text style={{ fontSize: '14px', lineHeight: '22px', color: COLORS.text, margin: '0 0 4px', fontFamily: FONT.body }}>Location: {location}</Text>}
        <Text style={{ fontSize: '14px', lineHeight: '22px', color: COLORS.text, margin: '0 0 4px', fontFamily: FONT.body }}>IP: {ipAddress}</Text>
        <Text style={{ fontSize: '14px', lineHeight: '22px', color: COLORS.text, margin: '0 0 4px', fontFamily: FONT.body }}>Device: {device}</Text>
        <Text style={{ fontSize: '14px', lineHeight: '22px', color: COLORS.text, margin: '0', fontFamily: FONT.body }}>Time: {time}</Text>
      </SectionCard>

      <CTAButton href="https://classified-ads-nu.vercel.app/account/security" variant="secondary">
        Review Activity
      </CTAButton>

      <SecurityNotice icon="⚠️">
        Wasn&apos;t you?{' '}
        <Link href="https://classified-ads-nu.vercel.app/support" style={{ color: COLORS.primary }}>
          Secure your account
        </Link>
      </SecurityNotice>
    </EmailLayout>
  );
}
