import { Text } from '@react-email/components';
import { COLORS } from '../utils/constants';

interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info';
  label: string;
}

const colors: Record<string, { bg: string; text: string }> = {
  success: { bg: COLORS.successLight, text: COLORS.success },
  warning: { bg: COLORS.warningLight, text: COLORS.warning },
  error: { bg: COLORS.errorLight, text: COLORS.error },
  info: { bg: '#dbeafe', text: '#1d4ed8' },
};

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const { bg, text } = colors[status];

  return (
    <Text
      style={{
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '9999px',
        fontSize: '13px',
        fontWeight: '600',
        lineHeight: '20px',
        backgroundColor: bg,
        color: text,
        margin: '0',
      }}
    >
      {label}
    </Text>
  );
}
