import { Column, Row, Section, Text } from '@react-email/components';
import { COLORS } from '../utils/constants';

interface ReceiptItem {
  name: string;
  price: string;
}

interface ReceiptTableProps {
  items: ReceiptItem[];
  total: string;
  fees?: string;
  currency?: string;
}

export default function ReceiptTable({ items, total, fees, currency = 'NGN' }: ReceiptTableProps) {
  return (
    <Section
      style={{
        borderRadius: '8px',
        border: `1px solid ${COLORS.gray[200]}`,
        overflow: 'hidden',
        margin: '12px 0',
      }}
    >
      <Section style={{ padding: '12px 16px', backgroundColor: COLORS.gray[50] }}>
        <Row>
          <Column>
            <Text style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: COLORS.gray[400], margin: '0' }}>
              Item
            </Text>
          </Column>
          <Column align="right">
            <Text style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: COLORS.gray[400], margin: '0' }}>
              Amount
            </Text>
          </Column>
        </Row>
      </Section>

      {items.map((item, i) => (
        <Row key={i} style={{ padding: '8px 16px' }}>
          <Column>
            <Text style={{ fontSize: '13px', color: COLORS.text, margin: '0', lineHeight: '20px' }}>
              {item.name}
            </Text>
          </Column>
          <Column align="right">
            <Text style={{ fontSize: '13px', fontWeight: '600', color: COLORS.text, margin: '0' }}>
              {item.price}
            </Text>
          </Column>
        </Row>
      ))}

      {fees && (
        <Row style={{ padding: '8px 16px', borderTop: `1px solid ${COLORS.gray[100]}` }}>
          <Column>
            <Text style={{ fontSize: '13px', color: COLORS.textSecondary, margin: '0' }}>
              Fees
            </Text>
          </Column>
          <Column align="right">
            <Text style={{ fontSize: '13px', color: COLORS.textSecondary, margin: '0' }}>
              {fees}
            </Text>
          </Column>
        </Row>
      )}

      <Row style={{ padding: '12px 16px', borderTop: `2px solid ${COLORS.gray[200]}`, backgroundColor: COLORS.gray[50] }}>
        <Column>
          <Text style={{ fontSize: '14px', fontWeight: '700', color: COLORS.text, margin: '0' }}>
            Total
          </Text>
        </Column>
        <Column align="right">
          <Text style={{ fontSize: '16px', fontWeight: '700', color: COLORS.primary, margin: '0' }}>
            {total}
          </Text>
        </Column>
      </Row>
    </Section>
  );
}
