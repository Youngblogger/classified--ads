import { Text } from '@react-email/components';
import EmailLayout from '../../components/EmailLayout';
import SectionCard from '../../components/SectionCard';
import InfoRow from '../../components/InfoRow';
import StatusBadge from '../../components/StatusBadge';
import { COLORS } from '../../utils/constants';
import type { WalletFundedProps } from '../../utils/types';

export default function WalletFunded({
  recipientName = 'there',
  amount,
  method,
  balance,
  transactionId,
  date,
  previewText,
}: WalletFundedProps) {
  return (
    <EmailLayout
      previewText={previewText || `₦${amount} added to your iList wallet`}
    >
      <StatusBadge status="success" label="Deposit Successful" />

      <Text style={{ fontSize: '24px', fontWeight: '700', color: COLORS.text, textAlign: 'center', margin: '16px 0 8px' }}>
        Wallet funded! 💰
      </Text>

      <Text style={{ fontSize: '14px', lineHeight: '22px', color: COLORS.textSecondary, textAlign: 'center', margin: '0 0 24px' }}>
        Hi {recipientName},
        <br /><br />
        Your wallet has been successfully funded.
      </Text>

      <SectionCard>
        <InfoRow label="Amount" value={`₦${amount}`} valueColor={COLORS.primary} bold />
        <InfoRow label="Payment Method" value={method} />
        <InfoRow label="Date" value={date} />
        <InfoRow label="Transaction ID" value={transactionId} />
        <InfoRow label="New Balance" value={`₦${balance}`} bold />
      </SectionCard>
    </EmailLayout>
  );
}
