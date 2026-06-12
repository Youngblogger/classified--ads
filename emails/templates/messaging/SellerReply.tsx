import { Text } from '@react-email/components';
import EmailLayout from '../../components/EmailLayout';
import CTAButton from '../../components/CTAButton';
import SectionCard from '../../components/SectionCard';
import { COLORS, FONT, FONT_SIZE } from '../../utils/constants';
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
      showAppBar
      pageTitle="Messages"
    >
      <Text style={{ fontSize: '22px', fontWeight: '700', color: COLORS.text, textAlign: 'center', margin: '0 0 6px', fontFamily: FONT.display }}>
        Seller replied 📬
      </Text>

      <Text style={{ fontSize: '15px', lineHeight: '24px', color: COLORS.textSecondary, textAlign: 'center', margin: '0 0 20px', fontFamily: FONT.body }}>
        Hi {recipientName},
        <br /><br />
        <strong style={{ color: COLORS.text }}>{sellerName}</strong> replied about <strong style={{ color: COLORS.text }}>"{adTitle}"</strong>.
      </Text>

      <SectionCard title="Reply Preview">
        <Text style={{ fontSize: '14px', lineHeight: '22px', color: COLORS.text, margin: '0', fontStyle: 'italic', fontFamily: FONT.body }}>
          "{replyPreview}"
        </Text>
      </SectionCard>

      <CTAButton href={viewLink}>
        View Conversation
      </CTAButton>
    </EmailLayout>
  );
}
