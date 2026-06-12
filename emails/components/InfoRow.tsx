import { Column, Row, Text } from '@react-email/components';
import { COLORS } from '../utils/constants';

interface InfoRowProps {
  label: string;
  value: string;
  valueColor?: string;
  bold?: boolean;
}

export default function InfoRow({ label, value, valueColor, bold = false }: InfoRowProps) {
  return (
    <Row style={{ marginBottom: '6px' }}>
      <Column>
        <Text
          style={{
            fontSize: '13px',
            lineHeight: '20px',
            color: COLORS.textSecondary,
            margin: '0',
          }}
        >
          {label}
        </Text>
      </Column>
      <Column align="right">
        <Text
          style={{
            fontSize: '13px',
            lineHeight: '20px',
            color: valueColor || COLORS.text,
            fontWeight: bold ? '600' : '400',
            margin: '0',
          }}
        >
          {value}
        </Text>
      </Column>
    </Row>
  );
}
