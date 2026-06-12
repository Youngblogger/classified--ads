import { Section, Text } from '@react-email/components';
import { ReactNode } from 'react';
import { COLORS } from '../utils/constants';

interface SecurityNoticeProps {
  icon?: string;
  children: ReactNode;
}

export default function SecurityNotice({ icon = '🔒', children }: SecurityNoticeProps) {
  return (
    <Section
      style={{
        backgroundColor: COLORS.gray[50],
        borderRadius: '8px',
        padding: '12px 16px',
        margin: '12px 0',
        border: `1px solid ${COLORS.gray[100]}`,
      }}
    >
      <Text
        style={{
          fontSize: '13px',
          lineHeight: '20px',
          color: COLORS.textSecondary,
          margin: '0',
        }}
      >
        {icon} {children}
      </Text>
    </Section>
  );
}
