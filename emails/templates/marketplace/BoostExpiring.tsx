import { Link, Text } from '@react-email/components';
import EmailLayout from '../../components/EmailLayout';
import CTAButton from '../../components/CTAButton';
import StatusBadge from '../../components/StatusBadge';
import { COLORS, FONT, FONT_SIZE } from '../../utils/constants';
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
      showAppBar
      pageTitle="Boost"
    >
      <StatusBadge status="warning" label={daysLeft === 1 ? 'Expires Tomorrow' : `Expires in ${daysLeft} days`} />

      <Text style={{ fontSize: '22px', fontWeight: '700', color: COLORS.text, textAlign: 'center', margin: '16px 0 6px', fontFamily: FONT.display }}>
        Boost ending soon
      </Text>

      <Text style={{ fontSize: '15px', lineHeight: '24px', color: COLORS.textSecondary, textAlign: 'center', margin: '0 0 24px', fontFamily: FONT.body }}>
        Hi {recipientName},
        <br /><br />
        Your boost for <strong style={{ color: COLORS.text }}>"{adTitle}"</strong> expires {daysLeft === 1 ? 'tomorrow' : `in ${daysLeft} days`}.
      </Text>

      {renewLink && (
        <CTAButton href={renewLink}>
          Renew Boost
        </CTAButton>
      )}

      <Text style={{ fontSize: '13px', lineHeight: '20px', color: COLORS.textSecondary, textAlign: 'center', margin: '12px 0 0', fontFamily: FONT.body }}>
        <Link href="https://classified-ads-nu.vercel.app/help/boosting" style={{ color: COLORS.primary, textDecoration: 'underline' }}>
          How boosting works
        </Link>
      </Text>
    </EmailLayout>
  );
}
