import { Text } from '@react-email/components';
import EmailLayout from '../../components/EmailLayout';
import CTAButton from '../../components/CTAButton';
import SectionCard from '../../components/SectionCard';
import StatusBadge from '../../components/StatusBadge';
import { COLORS } from '../../utils/constants';
import type { VerificationStatusProps } from '../../utils/types';

export default function VerificationStatus({
  recipientName = 'there',
  status,
  type,
  reason,
  dashboardLink,
  previewText,
}: VerificationStatusProps) {
  const isApproved = status === 'approved';

  return (
    <EmailLayout
      previewText={previewText || `Your ${type} verification has been ${isApproved ? 'approved' : 'rejected'}`}
    >
      <StatusBadge status={isApproved ? 'success' : 'error'} label={isApproved ? 'Verified' : 'Not Verified'} />

      <Text style={{ fontSize: '24px', fontWeight: '700', color: COLORS.text, textAlign: 'center', margin: '16px 0 8px' }}>
        {isApproved ? `${type} verified ✅` : `${type} verification`}
      </Text>

      <Text style={{ fontSize: '14px', lineHeight: '22px', color: COLORS.textSecondary, textAlign: 'center', margin: '0 0 24px' }}>
        Hi {recipientName},
        <br /><br />
        {isApproved
          ? `Your ${type} has been verified successfully.`
          : `Your ${type} verification was not approved.`}
      </Text>

      {!isApproved && reason && (
        <SectionCard title="REASON">
          <Text style={{ fontSize: '14px', lineHeight: '22px', color: COLORS.text, margin: '0' }}>
            {reason}
          </Text>
        </SectionCard>
      )}

      {dashboardLink && (
        <CTAButton href={dashboardLink}>
          {isApproved ? 'Go to Dashboard' : 'Try Again'}
        </CTAButton>
      )}
    </EmailLayout>
  );
}
