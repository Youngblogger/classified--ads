import { Text } from '@react-email/components';
import EmailLayout from '../../components/EmailLayout';
import CTAButton from '../../components/CTAButton';
import SectionCard from '../../components/SectionCard';
import { COLORS } from '../../utils/constants';
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
    >
      <Text style={{ fontSize: '24px', fontWeight: '700', color: COLORS.text, textAlign: 'center', margin: '0 0 8px' }}>
        New message 💬
      </Text>

      <Text style={{ fontSize: '14px', lineHeight: '22px', color: COLORS.textSecondary, textAlign: 'center', margin: '0 0 24px' }}>
        Hi {recipientName},
        <br /><br />
        <strong>{senderName}</strong> sent you a message about your ad <strong>"{adTitle}"</strong>.
      </Text>

      <SectionCard title="MESSAGE PREVIEW">
        <Text style={{ fontSize: '14px', lineHeight: '22px', color: COLORS.text, margin: '0', fontStyle: 'italic' }}>
          "{messagePreview}"
        </Text>
      </SectionCard>

      <CTAButton href={replyLink}>
        Reply to {senderName}
      </CTAButton>
    </EmailLayout>
  );
}
