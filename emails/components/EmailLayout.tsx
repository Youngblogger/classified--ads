import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Tailwind,
} from '@react-email/components';
import { ReactNode } from 'react';
import EmailHeader from './EmailHeader';
import EmailFooter from './EmailFooter';

interface EmailLayoutProps {
  children: ReactNode;
  previewText?: string;
  headerVariant?: 'default' | 'compact';
  preferencesUrl?: string;
  unsubscribeUrl?: string;
}

export default function EmailLayout({
  children,
  previewText,
  headerVariant = 'default',
  preferencesUrl,
  unsubscribeUrl,
}: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      {previewText && <Preview>{previewText}</Preview>}
      <Tailwind>
        <Body
          style={{
            backgroundColor: '#f5f7fa',
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            margin: '0',
            padding: '0',
            WebkitFontSmoothing: 'antialiased',
          }}
        >
          <Section
            style={{
              backgroundColor: '#16a34a',
              height: '4px',
              padding: '0',
            }}
          />

          <Container
            style={{
              maxWidth: '560px',
              margin: '0 auto',
              padding: '0 24px',
            }}
          >
            <EmailHeader variant={headerVariant} />

            <Section
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '32px 32px 24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
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
      </Tailwind>
    </Html>
  );
}
