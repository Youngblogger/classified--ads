import { Text } from '@react-email/components';
import EmailLayout from '../../components/EmailLayout';
import CTAButton from '../../components/CTAButton';
import SectionCard from '../../components/SectionCard';
import StatusBadge from '../../components/StatusBadge';
import { COLORS, FONT, FONT_SIZE } from '../../utils/constants';
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
      showAppBar
      pageTitle="Verification"
    >
      <StatusBadge status={isApproved ? 'success' : 'error'} label={isApproved ? 'Verified' : 'Not Verified'} />

      <Text style={{ fontSize: '22px', fontWeight: '700', color: COLORS.text, textAlign: 'center', margin: '16px 0 6px', fontFamily: FONT.display }}>
        {isApproved ? `${type} verified ✅` : `${type} verification`}
      </Text>

      <Text style={{ fontSize: '15px', lineHeight: '24px', color: COLORS.textSecondary, textAlign: 'center', margin: '0 0 20px', fontFamily: FONT.body }}>
        Hi {recipientName},
        <br /><br />
        {isApproved
          ? `Your ${type} has been verified.`
          : `Your ${type} verification was not approved.`}
      </Text>

      {!isApproved && reason && (
        <SectionCard title="Reason">
          <Text style={{ fontSize: '14px', lineHeight: '22px', color: COLORS.text, margin: '0', fontFamily: FONT.body }}>
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
