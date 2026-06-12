import { Section, Text } from '@react-email/components';
import { ReactNode } from 'react';
import { COLORS, RADIUS, SHADOW, FONT, FONT_SIZE } from '../utils/constants';

interface SectionCardProps {
  children: ReactNode;
  title?: string;
  bgColor?: string;
  borderColor?: string;
}

export default function SectionCard({
  children,
  title,
  bgColor = COLORS.slate[50],
  borderColor = COLORS.slate[200],
}: SectionCardProps) {
  return (
    <Section
      style={{
        backgroundColor: bgColor,
        borderRadius: RADIUS.card,
        border: `1px solid ${borderColor}`,
        padding: '16px 20px',
        margin: '14px 0',
        boxShadow: SHADOW.card,
      }}
    >
      {title && (
        <Text
          style={{
            fontSize: FONT_SIZE.tiny.size,
            fontWeight: '700',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.04em',
            color: COLORS.slate[400],
            margin: '0 0 12px',
            fontFamily: FONT.body,
          }}
        >
          {title}
        </Text>
      )}
      {children}
    </Section>
  );
}
