import { Column, Hr, Link, Row, Section, Text } from '@react-email/components';
import { BRAND, COLORS, FONT, FONT_SIZE } from '../utils/constants';

interface EmailFooterProps {
  preferencesUrl?: string;
  unsubscribeUrl?: string;
}

export default function EmailFooter({ preferencesUrl, unsubscribeUrl }: EmailFooterProps) {
  const year = new Date().getFullYear();

  return (
    <Section style={{ padding: '0 0 32px' }}>
      <Hr style={{ borderColor: COLORS.slate[200], margin: '0 0 24px' }} />

      <Row>
        <Column align="center">
          <Text
            style={{
              fontSize: FONT_SIZE.tiny.size,
              lineHeight: '18px',
              color: COLORS.slate[400],
              textAlign: 'center',
              margin: '0 0 4px',
              fontFamily: FONT.body,
            }}
          >
            Need help? Visit{' '}
            <Link href={BRAND.supportUrl} style={{ color: COLORS.primary, textDecoration: 'underline' }}>
              our Help Center
            </Link>
          </Text>

          <Text
            style={{
              fontSize: FONT_SIZE.tiny.size,
              lineHeight: '18px',
              color: COLORS.slate[400],
              textAlign: 'center',
              margin: '0 0 8px',
              fontFamily: FONT.body,
            }}
          >
            {BRAND.address}
          </Text>

          <Text
            style={{
              fontSize: '11px',
              lineHeight: '16px',
              color: COLORS.slate[400],
              textAlign: 'center',
              margin: '0',
              fontFamily: FONT.body,
            }}
          >
            {BRAND.copyright}
          </Text>

          {(preferencesUrl || unsubscribeUrl) && (
            <Text
              style={{
                fontSize: '11px',
                lineHeight: '16px',
                color: COLORS.slate[400],
                textAlign: 'center',
                margin: '8px 0 0',
                fontFamily: FONT.body,
              }}
            >
              {preferencesUrl && (
                <Link href={preferencesUrl} style={{ color: COLORS.slate[400], textDecoration: 'underline', marginRight: '12px' }}>
                  Email Preferences
                </Link>
              )}
              {unsubscribeUrl && (
                <Link href={unsubscribeUrl} style={{ color: COLORS.slate[400], textDecoration: 'underline' }}>
                  Unsubscribe
                </Link>
              )}
            </Text>
          )}

          <Text
            style={{
              fontSize: '11px',
              lineHeight: '16px',
              color: COLORS.slate[300],
              textAlign: 'center',
              margin: '12px 0 0',
              fontFamily: FONT.body,
            }}
          >
            This email was sent to you because you have an account with {BRAND.name}.
            If you didn&apos;t request this email, you can safely ignore it.
          </Text>
        </Column>
      </Row>
    </Section>
  );
}
