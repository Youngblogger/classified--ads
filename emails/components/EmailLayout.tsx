import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Img,
} from '@react-email/components';
import { ReactNode } from 'react';
import { BRAND, COLORS, RADIUS, SHADOW, FONT, FONT_SIZE } from '../utils/constants';
import EmailFooter from './EmailFooter';

interface EmailLayoutProps {
  children: ReactNode;
  previewText?: string;
  showAppBar?: boolean;
  pageTitle?: string;
  preferencesUrl?: string;
  unsubscribeUrl?: string;
}

export default function EmailLayout({
  children,
  previewText,
  showAppBar = false,
  pageTitle,
  preferencesUrl,
  unsubscribeUrl,
}: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      {previewText && <Preview>{previewText}</Preview>}
      <Body
        style={{
          backgroundColor: COLORS.bg,
          fontFamily: FONT.body,
          margin: '0',
          padding: '0',
          WebkitFontSmoothing: 'antialiased',
        }}
      >
        <Section
          style={{
            backgroundColor: COLORS.primary,
            height: '4px',
            padding: '0',
            margin: '0',
          }}
        />

        {showAppBar && (
          <Section
            style={{
              backgroundColor: COLORS.primary,
              padding: '20px 0',
            }}
          >
            <Container style={{ maxWidth: '560px', margin: '0 auto', padding: '0 16px' }}>
              <table width="100%" cellPadding="0" cellSpacing="0">
                <tr>
                  <td align="left" style={{ width: '50%' }}>
                    <table cellPadding="0" cellSpacing="0">
                      <tr>
                        <td
                          style={{
                            color: COLORS.white,
                            fontFamily: FONT.body,
                            paddingBottom: '4px',
                          }}
                        >
                          <Img
                            src={BRAND.logo}
                            alt={BRAND.name}
                            width="72"
                            height="24"
                            style={{ display: 'block' }}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td
                          style={{
                            color: COLORS.white,
                            fontFamily: FONT.body,
                            fontSize: '14px',
                            lineHeight: '16px',
                            opacity: '0.85',
                          }}
                        >
                          Nigeria&apos;s trusted marketplace
                        </td>
                      </tr>
                    </table>
                  </td>
                  {pageTitle && (
                    <td align="right" style={{ width: '50%' }}>
                      <span
                        style={{
                          fontSize: FONT_SIZE.small.size,
                          color: COLORS.white,
                          fontWeight: '500',
                        }}
                      >
                        {pageTitle}
                      </span>
                    </td>
                  )}
                </tr>
              </table>
            </Container>
          </Section>
        )}

        <Container
          style={{
            maxWidth: '560px',
            margin: '0 auto',
            padding: showAppBar ? '20px 24px' : '32px 24px',
          }}
        >
          <Section
            style={{
              backgroundColor: COLORS.white,
              borderRadius: RADIUS.card,
              padding: '24px 16px',
              boxShadow: SHADOW.card,
              border: `1px solid ${COLORS.slate[200]}`,
            }}
          >
            {children}
          </Section>

          <EmailFooter
            preferencesUrl={preferencesUrl}
            unsubscribeUrl={unsubscribeUrl}
          />
        </Container>
      </Body>
    </Html>
  );
}
