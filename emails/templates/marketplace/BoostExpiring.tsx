import { Link, Text } from '@react-email/components';
import EmailLayout from '../../components/EmailLayout';
import CTAButton from '../../components/CTAButton';
import StatusBadge from '../../components/StatusBadge';
import { COLORS } from '../../utils/constants';
import type { BoostExpiringProps } from '../../utils/types';

export default function BoostExpiring({
  recipientName = 'there',
  adTitle,
  adSlug,
  daysLeft,
  renewLink,
  previewText,
}: BoostExpiringProps) {
  return (
    <EmailLayout
      previewText={previewText || `Your boosted ad "${adTitle}" expires in ${daysLeft} days`}
    >
      <StatusBadge status="warning" label="Boost Expiring Soon" />

      <Text style={{ fontSize: '24px', fontWeight: '700', color: COLORS.text, textAlign: 'center', margin: '16px 0 8px' }}>
        Boost expiring {daysLeft === 1 ? 'tomorrow' : `in ${daysLeft} days`}
      </Text>

      <Text style={{ fontSize: '14px', lineHeight: '22px', color: COLORS.textSecondary, textAlign: 'center', margin: '0 0 24px' }}>
        Hi {recipientName},
        <br /><br />
        Your boost for <strong>"{adTitle}"</strong> will expire {daysLeft === 1 ? 'tomorrow' : `in ${daysLeft} days`}. Renew now to keep getting extra visibility.
      </Text>

      {renewLink && (
        <CTAButton href={renewLink}>
          Renew Boost
        </CTAButton>
      )}

      <Text style={{ fontSize: '13px', lineHeight: '20px', color: COLORS.textSecondary, textAlign: 'center', margin: '16px 0 0' }}>
        Not seeing results?{' '}
        <Link href="https://classified-ads-nu.vercel.app/help/boosting" style={{ color: COLORS.primary, textDecoration: 'underline' }}>
          Learn how boosting works
        </Link>
      </Text>
    </EmailLayout>
  );
}
