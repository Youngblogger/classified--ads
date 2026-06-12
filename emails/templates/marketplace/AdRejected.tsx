import { Link, Text } from '@react-email/components';
import EmailLayout from '../../components/EmailLayout';
import CTAButton from '../../components/CTAButton';
import SectionCard from '../../components/SectionCard';
import StatusBadge from '../../components/StatusBadge';
import { COLORS } from '../../utils/constants';
import type { AdRejectedProps } from '../../utils/types';

export default function AdRejected({
  recipientName = 'there',
  adTitle,
  reason,
  appealLink,
  previewText,
}: AdRejectedProps) {
  return (
    <EmailLayout
      previewText={previewText || `Your ad "${adTitle}" was not approved`}
    >
      <StatusBadge status="error" label="Not Approved" />

      <Text style={{ fontSize: '24px', fontWeight: '700', color: COLORS.text, textAlign: 'center', margin: '16px 0 8px' }}>
        Ad requires changes
      </Text>

      <Text style={{ fontSize: '14px', lineHeight: '22px', color: COLORS.textSecondary, textAlign: 'center', margin: '0 0 24px' }}>
        Hi {recipientName},
        <br /><br />
        Unfortunately, your ad <strong>"{adTitle}"</strong> couldn&apos;t be approved.
      </Text>

      <SectionCard title="REASON">
        <Text style={{ fontSize: '14px', lineHeight: '22px', color: COLORS.text, margin: '0' }}>
          {reason}
        </Text>
      </SectionCard>

      {appealLink && (
        <CTAButton href={appealLink} variant="secondary">
          Edit & Resubmit
        </CTAButton>
      )}

      <Text style={{ fontSize: '13px', lineHeight: '20px', color: COLORS.textSecondary, textAlign: 'center', margin: '16px 0 0' }}>
        Need clarification?{' '}
        <Link href="https://classified-ads-nu.vercel.app/support" style={{ color: COLORS.primary, textDecoration: 'underline' }}>
          Contact support
        </Link>
      </Text>
    </EmailLayout>
  );
}
