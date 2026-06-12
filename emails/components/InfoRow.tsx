import { Column, Row, Text } from '@react-email/components';
import { COLORS, FONT, FONT_SIZE } from '../utils/constants';

interface InfoRowProps {
  label: string;
  value: string;
  valueColor?: string;
  bold?: boolean;
}

export default function InfoRow({ label, value, valueColor, bold = false }: InfoRowProps) {
  return (
    <Row style={{ marginBottom: '5px' }}>
      <Column>
        <Text
          style={{
            fontSize: FONT_SIZE.body.size,
            lineHeight: '22px',
            color: COLORS.textSecondary,
            margin: '0',
            fontFamily: FONT.body,
          }}
        >
          {label}
        </Text>
      </Column>
      <Column align="right">
        <Text
          style={{
            fontSize: FONT_SIZE.body.size,
            lineHeight: '22px',
            color: valueColor || COLORS.text,
            fontWeight: bold ? '600' : '400',
            margin: '0',
            fontFamily: FONT.body,
          }}
        >
          {value}
        </Text>
      </Column>
    </Row>
  );
}
