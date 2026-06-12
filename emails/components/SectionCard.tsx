import { Section, Text } from '@react-email/components';
import { ReactNode } from 'react';
import { COLORS } from '../utils/constants';

interface SectionCardProps {
  children: ReactNode;
  title?: string;
  bgColor?: string;
  borderColor?: string;
}

export default function SectionCard({
  children,
  title,
  bgColor = COLORS.gray[50],
  borderColor = COLORS.gray[100],
}: SectionCardProps) {
  return (
    <Section
      style={{
        backgroundColor: bgColor,
        borderRadius: '8px',
        border: `1px solid ${borderColor}`,
        padding: '16px 20px',
        margin: '12px 0',
      }}
    >
      {title && (
        <Text
          style={{
            fontSize: '11px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: COLORS.gray[400],
            margin: '0 0 12px',
          }}
        >
          {title}
        </Text>
      )}
      {children}
    </Section>
  );
}
