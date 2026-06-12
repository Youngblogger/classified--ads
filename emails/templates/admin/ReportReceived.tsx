import { Text } from '@react-email/components';
import EmailLayout from '../../components/EmailLayout';
import SectionCard from '../../components/SectionCard';
import InfoRow from '../../components/InfoRow';
import StatusBadge from '../../components/StatusBadge';
import { COLORS, FONT, FONT_SIZE } from '../../utils/constants';
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
      showAppBar
      pageTitle="Admin"
    >
      <StatusBadge status="warning" label="New Report" />

      <Text style={{ fontSize: '22px', fontWeight: '700', color: COLORS.text, textAlign: 'center', margin: '16px 0 6px', fontFamily: FONT.display }}>
        Report received ⚠️
      </Text>

      <Text style={{ fontSize: '15px', lineHeight: '24px', color: COLORS.textSecondary, textAlign: 'center', margin: '0 0 20px', fontFamily: FONT.body }}>
        Hi {recipientName},
        <br />
        A new report requires review.
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
