import { Text } from '@react-email/components';
import EmailLayout from '../../components/EmailLayout';
import CTAButton from '../../components/CTAButton';
import SectionCard from '../../components/SectionCard';
import { COLORS, FONT, FONT_SIZE } from '../../utils/constants';
import type { NewMessageProps } from '../../utils/types';

export default function NewMessage({
  recipientName = 'there',
  senderName,
  adTitle,
  adSlug,
  messagePreview,
  replyLink,
  previewText,
}: NewMessageProps) {
  return (
    <EmailLayout
      previewText={previewText || `${senderName} sent you a message about "${adTitle}"`}
      showAppBar
      pageTitle="Messages"
    >
      <Text style={{ fontSize: '22px', fontWeight: '700', color: COLORS.text, textAlign: 'center', margin: '0 0 6px', fontFamily: FONT.display }}>
        New message 💬
      </Text>

      <Text style={{ fontSize: '15px', lineHeight: '24px', color: COLORS.textSecondary, textAlign: 'center', margin: '0 0 20px', fontFamily: FONT.body }}>
        Hi {recipientName},
        <br /><br />
        <strong style={{ color: COLORS.text }}>{senderName}</strong> sent you a message about <strong style={{ color: COLORS.text }}>"{adTitle}"</strong>.
      </Text>

      <SectionCard title="Message Preview">
        <Text style={{ fontSize: '14px', lineHeight: '22px', color: COLORS.text, margin: '0', fontStyle: 'italic', fontFamily: FONT.body }}>
          "{messagePreview}"
        </Text>
      </SectionCard>

      <CTAButton href={replyLink}>
        Reply to {senderName}
      </CTAButton>
    </EmailLayout>
  );
}
