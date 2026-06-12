import { Link, Text } from '@react-email/components';
import EmailLayout from '../../components/EmailLayout';
import CTAButton from '../../components/CTAButton';
import SectionCard from '../../components/SectionCard';
import InfoRow from '../../components/InfoRow';
import StatusBadge from '../../components/StatusBadge';
import { COLORS, FONT, FONT_SIZE } from '../../utils/constants';
import type { AdPostedProps } from '../../utils/types';

export default function AdPosted({
  recipientName = 'there',
  adTitle,
  adSlug,
  category,
  price,
  expiresIn,
  previewText,
}: AdPostedProps) {
  return (
    <EmailLayout
      previewText={previewText || `Your ad "${adTitle}" has been posted on iList`}
      showAppBar
      pageTitle="My Ads"
    >
      <StatusBadge status="success" label="Ad Posted" />

      <Text style={{ fontSize: '22px', fontWeight: '700', color: COLORS.text, textAlign: 'center', margin: '16px 0 6px', fontFamily: FONT.display }}>
        Your ad is live! 🎉
      </Text>

      <Text style={{ fontSize: '15px', lineHeight: '24px', color: COLORS.textSecondary, textAlign: 'center', margin: '0 0 20px', fontFamily: FONT.body }}>
        Hi {recipientName},
        <br />
        Your ad is now visible to buyers.
      </Text>

      <SectionCard>
        <Text style={{ fontSize: '16px', fontWeight: '600', color: COLORS.text, margin: '0 0 12px', fontFamily: FONT.body }}>
          {adTitle}
        </Text>
        <InfoRow label="Category" value={category} />
        <InfoRow label="Price" value={`₦${price}`} valueColor={COLORS.primary} bold />
        <InfoRow label="Expires in" value={expiresIn} />
      </SectionCard>

      <CTAButton href={`https://classified-ads-nu.vercel.app/ads/${adSlug}`}>
        View Your Ad
      </CTAButton>

      <Text style={{ fontSize: '13px', lineHeight: '20px', color: COLORS.textSecondary, textAlign: 'center', margin: '12px 0 0', fontFamily: FONT.body }}>
        Want more visibility?{' '}
        <Link href={`https://classified-ads-nu.vercel.app/ads/${adSlug}/boost`} style={{ color: COLORS.primary, textDecoration: 'underline' }}>
          Boost this ad
        </Link>
      </Text>
    </EmailLayout>
  );
}
