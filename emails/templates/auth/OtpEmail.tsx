import { Column, Row, Section, Text } from '@react-email/components';
import EmailLayout from '../../components/EmailLayout';
import SecurityNotice from '../../components/SecurityNotice';
import { COLORS, RADIUS, FONT, FONT_SIZE } from '../../utils/constants';
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
      showAppBar
      pageTitle="Verification"
    >
      <Text style={{ fontSize: '22px', fontWeight: '700', color: COLORS.text, textAlign: 'center', margin: '0 0 6px', fontFamily: FONT.display }}>
        Verification code
      </Text>

      <Text style={{ fontSize: '15px', lineHeight: '24px', color: COLORS.textSecondary, textAlign: 'center', margin: '0 0 20px', fontFamily: FONT.body }}>
        Hi {recipientName},
        <br />
        Enter this code to continue:
      </Text>

      <Section style={{ textAlign: 'center', margin: '24px 0 20px' }}>
        <Row style={{ display: 'inline-block' }}>
          {digits.map((digit, i) => (
            <Column
              key={i}
              style={{
                width: '48px',
                height: '56px',
                backgroundColor: COLORS.slate[50],
                borderRadius: RADIUS.card,
                border: `1px solid ${COLORS.slate[200]}`,
                textAlign: 'center',
                verticalAlign: 'middle',
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
                  fontFamily: FONT.body,
                }}
              >
                {digit}
              </Text>
            </Column>
          ))}
        </Row>
      </Section>

      <Text style={{ fontSize: '13px', lineHeight: '20px', color: COLORS.textSecondary, textAlign: 'center', margin: '0 0 16px', fontFamily: FONT.body }}>
        Code expires in {expiryMinutes} minutes. Never share this code.
      </Text>

      <SecurityNotice>
        If you didn&apos;t request this code, ignore this email.
      </SecurityNotice>
    </EmailLayout>
  );
}
