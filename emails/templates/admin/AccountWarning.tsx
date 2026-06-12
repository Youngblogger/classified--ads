import { Link, Text } from '@react-email/components';
import EmailLayout from '../../components/EmailLayout';
import SectionCard from '../../components/SectionCard';
import StatusBadge from '../../components/StatusBadge';
import SecurityNotice from '../../components/SecurityNotice';
import { COLORS } from '../../utils/constants';
import type { AccountWarningProps } from '../../utils/types';

export default function AccountWarning({
  recipientName = 'there',
  reason,
  details,
  appealLink,
  warningType,
  previewText,
}: AccountWarningProps) {
  return (
    <EmailLayout
      previewText={previewText || `Important notice about your iList account`}
    >
      <StatusBadge status={warningType === 'final' ? 'error' : 'warning'} label={warningType === 'final' ? 'Final Warning' : 'Warning'} />

      <Text style={{ fontSize: '24px', fontWeight: '700', color: COLORS.text, textAlign: 'center', margin: '16px 0 8px' }}>
        Account notice
      </Text>

      <Text style={{ fontSize: '14px', lineHeight: '22px', color: COLORS.textSecondary, textAlign: 'center', margin: '0 0 24px' }}>
        Hi {recipientName},
        <br /><br />
        This is a {warningType === 'final' ? 'final ' : ''}warning regarding your iList account.
      </Text>

      <SectionCard title="REASON">
        <Text style={{ fontSize: '14px', lineHeight: '22px', color: COLORS.text, margin: '0' }}>
          {reason}
        </Text>
      </SectionCard>

      <SectionCard title="DETAILS">
        <Text style={{ fontSize: '13px', lineHeight: '20px', color: COLORS.text, margin: '0' }}>
          {details}
        </Text>
      </SectionCard>

      {appealLink && (
        <Text style={{ textAlign: 'center', margin: '16px 0' }}>
          <Link href={appealLink} style={{ color: COLORS.primary, fontSize: '14px', fontWeight: '600', textDecoration: 'underline' }}>
            Submit an Appeal
          </Link>
        </Text>
      )}

      <SecurityNotice icon={warningType === 'final' ? '🚨' : '⚠️'}>
        {warningType === 'final'
          ? 'This is your final warning. Further violations will result in account suspension.'
          : 'Please review our community guidelines to avoid further action.'}
      </SecurityNotice>
    </EmailLayout>
  );
}
