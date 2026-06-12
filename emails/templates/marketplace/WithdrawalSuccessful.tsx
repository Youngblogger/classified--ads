import { Text } from '@react-email/components';
import EmailLayout from '../../components/EmailLayout';
import SectionCard from '../../components/SectionCard';
import InfoRow from '../../components/InfoRow';
import StatusBadge from '../../components/StatusBadge';
import { COLORS } from '../../utils/constants';
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
    >
      <StatusBadge status="success" label="Withdrawal Complete" />

      <Text style={{ fontSize: '24px', fontWeight: '700', color: COLORS.text, textAlign: 'center', margin: '16px 0 8px' }}>
        Withdrawal processed ✅
      </Text>

      <Text style={{ fontSize: '14px', lineHeight: '22px', color: COLORS.textSecondary, textAlign: 'center', margin: '0 0 24px' }}>
        Hi {recipientName},
        <br /><br />
        Your withdrawal has been processed successfully.
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

      <Text style={{ fontSize: '13px', lineHeight: '20px', color: COLORS.textSecondary, textAlign: 'center', margin: '16px 0 0' }}>
        Funds should arrive in your bank account within 1-3 business days.
      </Text>
    </EmailLayout>
  );
}
