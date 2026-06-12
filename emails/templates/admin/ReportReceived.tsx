import { Text } from '@react-email/components';
import EmailLayout from '../../components/EmailLayout';
import SectionCard from '../../components/SectionCard';
import InfoRow from '../../components/InfoRow';
import StatusBadge from '../../components/StatusBadge';
import { COLORS } from '../../utils/constants';
import type { ReportReceivedProps } from '../../utils/types';

export default function ReportReceived({
  recipientName = 'Admin',
  reportId,
  reportedItem,
  reason,
  reportedBy,
  previewText,
}: ReportReceivedProps) {
  return (
    <EmailLayout
      previewText={previewText || `New report #${reportId} on iList`}
    >
      <StatusBadge status="warning" label="New Report" />

      <Text style={{ fontSize: '24px', fontWeight: '700', color: COLORS.text, textAlign: 'center', margin: '16px 0 8px' }}>
        Report received ⚠️
      </Text>

      <Text style={{ fontSize: '14px', lineHeight: '22px', color: COLORS.textSecondary, textAlign: 'center', margin: '0 0 24px' }}>
        Hi {recipientName},
        <br /><br />
        A new report has been submitted and requires review.
      </Text>

      <SectionCard>
        <InfoRow label="Report ID" value={reportId} bold />
        <InfoRow label="Reported Item" value={reportedItem} />
        <InfoRow label="Reported By" value={reportedBy} />
        <InfoRow label="Reason" value={reason} />
      </SectionCard>
    </EmailLayout>
  );
}
