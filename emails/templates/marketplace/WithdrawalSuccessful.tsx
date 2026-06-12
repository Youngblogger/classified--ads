import { Text } from '@react-email/components';
import EmailLayout from '../../components/EmailLayout';
import SectionCard from '../../components/SectionCard';
import InfoRow from '../../components/InfoRow';
import StatusBadge from '../../components/StatusBadge';
import { COLORS, FONT, FONT_SIZE } from '../../utils/constants';
import type { WithdrawalSuccessProps } from '../../utils/types';

export default function WithdrawalSuccessful({
  recipientName = 'there',
  amount,
  bankName,
  accountNumber,
  accountName,
  balance,
  reference,
  estimatedArrival,
  previewText,
}: WithdrawalSuccessProps) {
  return (
    <EmailLayout
      previewText={previewText || `₦${amount} withdrawn from your iList wallet`}
      showAppBar
      pageTitle="Wallet"
    >
      <StatusBadge status="success" label="Withdrawal Complete" />

      <Text style={{ fontSize: '22px', fontWeight: '700', color: COLORS.text, textAlign: 'center', margin: '16px 0 6px', fontFamily: FONT.display }}>
        Withdrawal processed ✅
      </Text>

      <Text style={{ fontSize: '15px', lineHeight: '24px', color: COLORS.textSecondary, textAlign: 'center', margin: '0 0 20px', fontFamily: FONT.body }}>
        Hi {recipientName},
        <br />
        Your withdrawal has been processed.
      </Text>

      <SectionCard>
        <InfoRow label="Amount" value={`₦${amount}`} valueColor={COLORS.primary} bold />
        <InfoRow label="Bank" value={bankName} />
        <InfoRow label="Account Number" value={accountNumber} />
        <InfoRow label="Account Name" value={accountName} />
        <InfoRow label="Reference" value={reference} />
        <InfoRow label="Wallet Balance" value={`₦${balance}`} />
        {estimatedArrival && <InfoRow label="Estimated Arrival" value={estimatedArrival} />}
      </SectionCard>

      <Text style={{ fontSize: '13px', lineHeight: '20px', color: COLORS.textSecondary, textAlign: 'center', margin: '12px 0 0', fontFamily: FONT.body }}>
        Funds should arrive within 1–3 business days.
      </Text>
    </EmailLayout>
  );
}
