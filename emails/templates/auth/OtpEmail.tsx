import { Column, Row, Section, Text } from '@react-email/components';
import EmailLayout from '../../components/EmailLayout';
import SecurityNotice from '../../components/SecurityNotice';
import { COLORS } from '../../utils/constants';
import type { OtpEmailProps } from '../../utils/types';

export default function OtpEmail({
  recipientName = 'there',
  otp,
  expiryMinutes = 10,
  previewText,
}: OtpEmailProps) {
  const digits = otp?.split('') ?? [];

  return (
    <EmailLayout
      previewText={previewText || `Your iList verification code`}
      headerVariant="compact"
    >
      <Text style={{ fontSize: '24px', fontWeight: '700', color: COLORS.text, textAlign: 'center', margin: '0 0 8px' }}>
        Verification code
      </Text>

      <Text style={{ fontSize: '14px', lineHeight: '22px', color: COLORS.textSecondary, textAlign: 'center', margin: '0 0 24px' }}>
        Hi {recipientName},
        <br /><br />
        Enter this code to complete your verification:
      </Text>

      <Section style={{ textAlign: 'center', margin: '24px 0' }}>
        <Row style={{ display: 'inline-block' }}>
          {digits.map((digit, i) => (
            <Column
              key={i}
              style={{
                width: '48px',
                height: '56px',
                backgroundColor: COLORS.gray[50],
                borderRadius: '10px',
                border: `1px solid ${COLORS.gray[200]}`,
                textAlign: 'center',
                verticalAlign: 'middle',
                marginRight: i < digits.length - 1 ? '8px' : '0',
              }}
            >
              <Text
                style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: COLORS.text,
                  letterSpacing: '4px',
                  margin: '0',
                  lineHeight: '56px',
                }}
              >
                {digit}
              </Text>
            </Column>
          ))}
        </Row>
      </Section>

      <Text style={{ fontSize: '13px', lineHeight: '20px', color: COLORS.textSecondary, textAlign: 'center', margin: '0' }}>
        This code expires in {expiryMinutes} minutes. Never share this code with anyone.
      </Text>

      <SecurityNotice>
        If you didn&apos;t request this code, you can safely ignore this email.
      </SecurityNotice>
    </EmailLayout>
  );
}
