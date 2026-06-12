import { Text } from '@react-email/components';
import EmailLayout from '../../components/EmailLayout';
import CTAButton from '../../components/CTAButton';
import StatusBadge from '../../components/StatusBadge';
import { COLORS } from '../../utils/constants';
import type { AdApprovedProps } from '../../utils/types';

export default function AdApproved({
  recipientName = 'there',
  adTitle,
  adSlug,
  previewText,
}: AdApprovedProps) {
  return (
    <EmailLayout
      previewText={previewText || `Your ad "${adTitle}" has been approved on iList`}
    >
      <StatusBadge status="success" label="Approved" />

      <Text style={{ fontSize: '24px', fontWeight: '700', color: COLORS.text, textAlign: 'center', margin: '16px 0 8px' }}>
        Ad approved ✅
      </Text>

      <Text style={{ fontSize: '14px', lineHeight: '22px', color: COLORS.textSecondary, textAlign: 'center', margin: '0 0 24px' }}>
        Hi {recipientName},
        <br /><br />
        Great news! Your ad <strong>"{adTitle}"</strong> has been reviewed and approved. It&apos;s now visible to everyone on iList.
      </Text>

      <CTAButton href={`https://classified-ads-nu.vercel.app/ads/${adSlug}`}>
        View Live Ad
      </CTAButton>
    </EmailLayout>
  );
}
