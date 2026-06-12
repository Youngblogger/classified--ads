import { Column, Hr, Img, Link, Row, Section, Text } from '@react-email/components';
import { BRAND, COLORS } from '../utils/constants';

interface EmailFooterProps {
  preferencesUrl?: string;
  unsubscribeUrl?: string;
}

export default function EmailFooter({ preferencesUrl, unsubscribeUrl }: EmailFooterProps) {
  const year = new Date().getFullYear();

  return (
    <Section style={{ padding: '0 0 32px' }}>
      <Hr style={{ borderColor: COLORS.gray[200], margin: '0 0 24px' }} />

      <Row>
        <Column align="center">
          <Row style={{ marginBottom: '16px' }}>
            <Column align="center">
              <Link href={BRAND.twitter} style={{ margin: '0 8px', display: 'inline-block' }}>
                <Img src={`${BRAND.website}/icons/x.svg`} alt="X" width="20" height="20" style={{ display: 'inline' }} />
              </Link>
              <Link href={BRAND.instagram} style={{ margin: '0 8px', display: 'inline-block' }}>
                <Img src={`${BRAND.website}/icons/instagram.svg`} alt="Instagram" width="20" height="20" style={{ display: 'inline' }} />
              </Link>
              <Link href={BRAND.supportUrl} style={{ margin: '0 8px', display: 'inline-block' }}>
                <Img src={`${BRAND.website}/icons/help.svg`} alt="Help" width="20" height="20" style={{ display: 'inline' }} />
              </Link>
            </Column>
          </Row>

          <Text
            style={{
              fontSize: '12px',
              lineHeight: '18px',
              color: COLORS.gray[400],
              textAlign: 'center',
              margin: '0 0 4px',
            }}
          >
            Need help? Visit{' '}
            <Link href={BRAND.supportUrl} style={{ color: COLORS.primary, textDecoration: 'underline' }}>
              our Help Center
            </Link>
          </Text>

          <Text
            style={{
              fontSize: '12px',
              lineHeight: '18px',
              color: COLORS.gray[400],
              textAlign: 'center',
              margin: '0 0 8px',
            }}
          >
            {BRAND.address}
          </Text>

          <Text
            style={{
              fontSize: '11px',
              lineHeight: '16px',
              color: COLORS.gray[400],
              textAlign: 'center',
              margin: '0',
            }}
          >
            {BRAND.copyright}
          </Text>

          {(preferencesUrl || unsubscribeUrl) && (
            <Text
              style={{
                fontSize: '11px',
                lineHeight: '16px',
                color: COLORS.gray[400],
                textAlign: 'center',
                margin: '8px 0 0',
              }}
            >
              {preferencesUrl && (
                <Link href={preferencesUrl} style={{ color: COLORS.gray[400], textDecoration: 'underline', marginRight: '12px' }}>
                  Email Preferences
                </Link>
              )}
              {unsubscribeUrl && (
                <Link href={unsubscribeUrl} style={{ color: COLORS.gray[400], textDecoration: 'underline' }}>
                  Unsubscribe
                </Link>
              )}
            </Text>
          )}

          <Text
            style={{
              fontSize: '11px',
              lineHeight: '16px',
              color: COLORS.gray[300],
              textAlign: 'center',
              margin: '12px 0 0',
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
