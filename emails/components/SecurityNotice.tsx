import { Section, Text } from '@react-email/components';
import { ReactNode } from 'react';
import { COLORS, RADIUS, FONT, FONT_SIZE } from '../utils/constants';

interface SecurityNoticeProps {
  icon?: string;
  children: ReactNode;
}

export default function SecurityNotice({ icon = '🔒', children }: SecurityNoticeProps) {
  return (
    <Section
      style={{
        backgroundColor: COLORS.slate[50],
        borderRadius: RADIUS.card,
        padding: '12px 16px',
        margin: '14px 0',
        border: `1px solid ${COLORS.slate[200]}`,
      }}
    >
      <Text
        style={{
          fontSize: FONT_SIZE.small.size,
          lineHeight: '20px',
          color: COLORS.textSecondary,
          margin: '0',
          fontFamily: FONT.body,
        }}
      >
        {icon} {children}
      </Text>
    </Section>
  );
}
