import { Hr } from '@react-email/components';
import { COLORS } from '../utils/constants';

interface DividerProps {
  spacing?: string;
}

export default function Divider({ spacing = '16px 0' }: DividerProps) {
  return (
    <Hr
      style={{
        borderColor: COLORS.gray[200],
        margin: spacing,
      }}
    />
  );
}
