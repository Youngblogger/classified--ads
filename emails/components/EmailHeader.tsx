import { Column, Img, Row, Section, Text } from '@react-email/components';
import { BRAND, COLORS } from '../utils/constants';

interface EmailHeaderProps {
  variant?: 'default' | 'compact';
}

export default function EmailHeader({ variant = 'default' }: EmailHeaderProps) {
  return (
    <Section style={{ padding: variant === 'compact' ? '24px 0 16px' : '32px 0 24px' }}>
      <Row>
        <Column align="center">
          <Img
            src={BRAND.logo}
            alt={BRAND.name}
            width="96"
            height="32"
            style={{
              margin: '0 auto',
            }}
          />
          {variant !== 'compact' && (
            <Text
              style={{
                margin: '8px 0 0',
                fontSize: '13px',
                lineHeight: '20px',
                color: COLORS.textSecondary,
                textAlign: 'center',
              }}
            >
              {BRAND.name} — Nigeria&apos;s trusted marketplace
            </Text>
          )}
        </Column>
      </Row>
    </Section>
  );
}
