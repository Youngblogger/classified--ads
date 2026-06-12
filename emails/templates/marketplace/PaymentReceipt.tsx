import { Text } from '@react-email/components';
import EmailLayout from '../../components/EmailLayout';
import SectionCard from '../../components/SectionCard';
import InfoRow from '../../components/InfoRow';
import ReceiptTable from '../../components/ReceiptTable';
import { COLORS } from '../../utils/constants';
import type { PaymentReceiptProps } from '../../utils/types';

export default function PaymentReceipt({
  recipientName = 'there',
  receiptNumber,
  paymentMethod,
  date,
  amount,
  fees,
  total,
  walletBalance,
  items,
  previewText,
}: PaymentReceiptProps) {
  return (
    <EmailLayout
      previewText={previewText || `Receipt #${receiptNumber} for your iList payment`}
    >
      <Text style={{ fontSize: '24px', fontWeight: '700', color: COLORS.text, textAlign: 'center', margin: '0 0 8px' }}>
        Payment receipt 🧾
      </Text>

      <Text style={{ fontSize: '14px', lineHeight: '22px', color: COLORS.textSecondary, textAlign: 'center', margin: '0 0 24px' }}>
        Hi {recipientName},
        <br /><br />
        Thanks for your payment. Here&apos;s your receipt.
      </Text>

      <SectionCard>
        <InfoRow label="Receipt #" value={receiptNumber} bold />
        <InfoRow label="Date" value={date} />
        <InfoRow label="Payment Method" value={paymentMethod} />
      </SectionCard>

      {items && items.length > 0 && (
        <ReceiptTable items={items} total={total} fees={fees} />
      )}

      {!items && (
        <SectionCard>
          <InfoRow label="Amount" value={`₦${amount}`} bold />
          {fees && <InfoRow label="Fees" value={`₦${fees}`} />}
          <InfoRow label="Total" value={`₦${total}`} valueColor={COLORS.primary} bold />
          <InfoRow label="Wallet Balance" value={`₦${walletBalance}`} />
        </SectionCard>
      )}
    </EmailLayout>
  );
}
