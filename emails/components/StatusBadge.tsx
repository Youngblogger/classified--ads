import { Text } from '@react-email/components';
import { COLORS, RADIUS, FONT, FONT_SIZE } from '../utils/constants';

interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info';
  label: string;
}

const colors: Record<string, { bg: string; text: string }> = {
  success: { bg: COLORS.successLight, text: COLORS.primaryDarker },
  warning: { bg: COLORS.warningLight, text: '#92400E' },
  error: { bg: COLORS.errorLight, text: '#991B1B' },
  info: { bg: '#DBEAFE', text: '#1E40AF' },
};

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const { bg, text } = colors[status];

  return (
    <Text
      style={{
        display: 'inline-block',
        padding: '4px 14px',
        borderRadius: RADIUS.badge,
        fontSize: FONT_SIZE.small.size,
        fontWeight: '600',
        lineHeight: '20px',
        backgroundColor: bg,
        color: text,
        margin: '0',
        fontFamily: FONT.body,
      }}
    >
      {label}
    </Text>
  );
}
