import { Text } from '@react-email/components';
import EmailLayout from '../../components/EmailLayout';
import CTAButton from '../../components/CTAButton';
import StatusBadge from '../../components/StatusBadge';
import { COLORS, FONT, FONT_SIZE } from '../../utils/constants';
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
      showAppBar
      pageTitle="Moderation"
    >
      <StatusBadge status="success" label="Approved" />

      <Text style={{ fontSize: '22px', fontWeight: '700', color: COLORS.text, textAlign: 'center', margin: '16px 0 6px', fontFamily: FONT.display }}>
        Ad approved ✅
      </Text>

      <Text style={{ fontSize: '15px', lineHeight: '24px', color: COLORS.textSecondary, textAlign: 'center', margin: '0 0 24px', fontFamily: FONT.body }}>
        Hi {recipientName},
        <br /><br />
        <strong style={{ color: COLORS.text }}>"{adTitle}"</strong> has been reviewed and approved. It&apos;s live for everyone to see.
      </Text>

      <CTAButton href={`https://classified-ads-nu.vercel.app/ads/${adSlug}`}>
        View Live Ad
      </CTAButton>
    </EmailLayout>
  );
}
