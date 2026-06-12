import { Text } from '@react-email/components';
import EmailLayout from '../../components/EmailLayout';
import SectionCard from '../../components/SectionCard';
import InfoRow from '../../components/InfoRow';
import StatusBadge from '../../components/StatusBadge';
import { COLORS, FONT, FONT_SIZE } from '../../utils/constants';
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
      showAppBar
      pageTitle="Wallet"
    >
      <StatusBadge status="success" label="Deposit Successful" />

      <Text style={{ fontSize: '22px', fontWeight: '700', color: COLORS.text, textAlign: 'center', margin: '16px 0 6px', fontFamily: FONT.display }}>
        Wallet funded! 💰
      </Text>

      <Text style={{ fontSize: '15px', lineHeight: '24px', color: COLORS.textSecondary, textAlign: 'center', margin: '0 0 20px', fontFamily: FONT.body }}>
        Hi {recipientName},
        <br />
        Your wallet has been funded successfully.
      </Text>

      <SectionCard>
        <InfoRow label="Amount" value={`₦${amount}`} valueColor={COLORS.primary} bold />
        <InfoRow label="Method" value={method} />
        <InfoRow label="Date" value={date} />
        <InfoRow label="Transaction ID" value={transactionId} />
        <InfoRow label="New Balance" value={`₦${balance}`} bold />
      </SectionCard>
    </EmailLayout>
  );
}
