import { Link, Text } from '@react-email/components';
import EmailLayout from '../../components/EmailLayout';
import CTAButton from '../../components/CTAButton';
import StatusBadge from '../../components/StatusBadge';
import { COLORS } from '../../utils/constants';
import type { AdExpiredProps } from '../../utils/types';

export default function AdExpired({
  recipientName = 'there',
  adTitle,
  adSlug,
  repostLink,
  previewText,
}: AdExpiredProps) {
  return (
    <EmailLayout
      previewText={previewText || `Your ad "${adTitle}" has expired on iList`}
    >
      <StatusBadge status="warning" label="Expired" />

      <Text style={{ fontSize: '24px', fontWeight: '700', color: COLORS.text, textAlign: 'center', margin: '16px 0 8px' }}>
        Your ad has expired
      </Text>

      <Text style={{ fontSize: '14px', lineHeight: '22px', color: COLORS.textSecondary, textAlign: 'center', margin: '0 0 24px' }}>
        Hi {recipientName},
        <br /><br />
        Your ad <strong>"{adTitle}"</strong> has expired and is no longer visible to buyers.
      </Text>

      {repostLink && (
        <CTAButton href={repostLink}>
          Repost Your Ad
        </CTAButton>
      )}

      <Text style={{ fontSize: '13px', lineHeight: '20px', color: COLORS.textSecondary, textAlign: 'center', margin: '16px 0 0' }}>
        Or{' '}
        <Link href="https://classified-ads-nu.vercel.app/ads/create" style={{ color: COLORS.primary, textDecoration: 'underline' }}>
          create a new ad
        </Link>
      </Text>
    </EmailLayout>
  );
}
