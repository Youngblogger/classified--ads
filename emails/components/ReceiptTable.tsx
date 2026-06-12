import { Column, Row, Section, Text } from '@react-email/components';
import { COLORS, RADIUS, FONT, FONT_SIZE } from '../utils/constants';

interface ReceiptItem {
  name: string;
  price: string;
}

interface ReceiptTableProps {
  items: ReceiptItem[];
  total: string;
  fees?: string;
}

export default function ReceiptTable({ items, total, fees }: ReceiptTableProps) {
  return (
    <Section
      style={{
        borderRadius: RADIUS.card,
        border: `1px solid ${COLORS.slate[200]}`,
        overflow: 'hidden',
        margin: '14px 0',
      }}
    >
      <Section style={{ padding: '10px 16px', backgroundColor: COLORS.slate[50] }}>
        <Row>
          <Column>
            <Text style={{
              fontSize: FONT_SIZE.tiny.size, fontWeight: '700', textTransform: 'uppercase' as const,
              letterSpacing: '0.05em', color: COLORS.slate[400], margin: '0', fontFamily: FONT.body,
            }}>
              Item
            </Text>
          </Column>
          <Column align="right">
            <Text style={{
              fontSize: FONT_SIZE.tiny.size, fontWeight: '700', textTransform: 'uppercase' as const,
              letterSpacing: '0.05em', color: COLORS.slate[400], margin: '0', fontFamily: FONT.body,
            }}>
              Amount
            </Text>
          </Column>
        </Row>
      </Section>

      {items.map((item, i) => (
        <Row key={i} style={{ padding: '8px 16px' }}>
          <Column>
            <Text style={{ fontSize: FONT_SIZE.body.size, color: COLORS.text, margin: '0', lineHeight: '20px', fontFamily: FONT.body }}>
              {item.name}
            </Text>
          </Column>
          <Column align="right">
            <Text style={{ fontSize: FONT_SIZE.body.size, fontWeight: '600', color: COLORS.text, margin: '0', fontFamily: FONT.body }}>
              {item.price}
            </Text>
          </Column>
        </Row>
      ))}

      {fees && (
        <Row style={{ padding: '8px 16px', borderTop: `1px solid ${COLORS.slate[100]}` }}>
          <Column>
            <Text style={{ fontSize: FONT_SIZE.body.size, color: COLORS.textSecondary, margin: '0', fontFamily: FONT.body }}>
              Fees
            </Text>
          </Column>
          <Column align="right">
            <Text style={{ fontSize: FONT_SIZE.body.size, color: COLORS.textSecondary, margin: '0', fontFamily: FONT.body }}>
              {fees}
            </Text>
          </Column>
        </Row>
      )}

      <Row style={{ padding: '12px 16px', borderTop: `2px solid ${COLORS.slate[200]}`, backgroundColor: COLORS.slate[50] }}>
        <Column>
          <Text style={{ fontSize: '15px', fontWeight: '700', color: COLORS.text, margin: '0', fontFamily: FONT.body }}>
            Total
          </Text>
        </Column>
        <Column align="right">
          <Text style={{ fontSize: '17px', fontWeight: '700', color: COLORS.primary, margin: '0', fontFamily: FONT.body }}>
            {total}
          </Text>
        </Column>
      </Row>
    </Section>
  );
}
