import { Text } from '@react-email/components';
import EmailLayout from '../../components/EmailLayout';
import CTAButton from '../../components/CTAButton';
import SectionCard from '../../components/SectionCard';
import InfoRow from '../../components/InfoRow';
import StatusBadge from '../../components/StatusBadge';
import { COLORS, FONT, FONT_SIZE } from '../../utils/constants';
import type { AdBoostedProps } from '../../utils/types';

export default function AdBoosted({
  recipientName = 'there',
  adTitle,
  adSlug,
  plan,
  amount,
  walletBalance,
  expiryDate,
  transactionId,
  previewText,
}: AdBoostedProps) {
  return (
    <EmailLayout
      previewText={previewText || `Your ad "${adTitle}" is now boosted on iList`}
      showAppBar
      pageTitle="Boost"
    >
      <StatusBadge status="success" label="Boost Active" />

      <Text style={{ fontSize: '22px', fontWeight: '700', color: COLORS.text, textAlign: 'center', margin: '16px 0 6px', fontFamily: FONT.display }}>
        Ad boosted! 🚀
      </Text>

      <Text style={{ fontSize: '15px', lineHeight: '24px', color: COLORS.textSecondary, textAlign: 'center', margin: '0 0 20px', fontFamily: FONT.body }}>
        Hi {recipientName},
        <br />
        <strong style={{ color: COLORS.text }}>"{adTitle}"</strong> is now boosted and getting extra visibility.
      </Text>

      <SectionCard>
        <InfoRow label="Plan" value={plan} bold />
        <InfoRow label="Charged" value={`₦${amount}`} valueColor={COLORS.primary} bold />
        <InfoRow label="Expires" value={expiryDate} />
        <InfoRow label="Wallet" value={`₦${walletBalance}`} />
        <InfoRow label="Reference" value={transactionId} />
      </SectionCard>

      <CTAButton href={`https://classified-ads-nu.vercel.app/ads/${adSlug}`}>
        View Boosted Ad
      </CTAButton>
    </EmailLayout>
  );
}
