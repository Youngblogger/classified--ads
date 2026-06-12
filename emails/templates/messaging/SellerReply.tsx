import { Text } from '@react-email/components';
import EmailLayout from '../../components/EmailLayout';
import CTAButton from '../../components/CTAButton';
import SectionCard from '../../components/SectionCard';
import { COLORS } from '../../utils/constants';
import type { SellerReplyProps } from '../../utils/types';

export default function SellerReply({
  recipientName = 'there',
  sellerName,
  adTitle,
  adSlug,
  replyPreview,
  viewLink,
  previewText,
}: SellerReplyProps) {
  return (
    <EmailLayout
      previewText={previewText || `${sellerName} replied to your message about "${adTitle}"`}
    >
      <Text style={{ fontSize: '24px', fontWeight: '700', color: COLORS.text, textAlign: 'center', margin: '0 0 8px' }}>
        Seller replied 📬
      </Text>

      <Text style={{ fontSize: '14px', lineHeight: '22px', color: COLORS.textSecondary, textAlign: 'center', margin: '0 0 24px' }}>
        Hi {recipientName},
        <br /><br />
        <strong>{sellerName}</strong> has replied to your message about <strong>"{adTitle}"</strong>.
      </Text>

      <SectionCard title="REPLY PREVIEW">
        <Text style={{ fontSize: '14px', lineHeight: '22px', color: COLORS.text, margin: '0', fontStyle: 'italic' }}>
          "{replyPreview}"
        </Text>
      </SectionCard>

      <CTAButton href={viewLink}>
        View Conversation
      </CTAButton>
    </EmailLayout>
  );
}
