import { Img, Section, Text } from '@react-email/components';
import { BRAND, COLORS, FONT, FONT_SIZE } from '../utils/constants';

interface EmailHeaderProps {
  variant?: 'default' | 'compact';
}

export default function EmailHeader({ variant = 'default' }: EmailHeaderProps) {
  return (
    <Section style={{ textAlign: 'center', padding: variant === 'compact' ? '0 0 8px' : '0 0 16px' }}>
      <Img
        src={BRAND.logo}
        alt={BRAND.name}
        width="80"
        height="27"
        style={{ margin: '0 auto', display: 'block' }}
      />
      {variant !== 'compact' && (
        <Text
          style={{
            margin: '6px 0 0',
            fontSize: FONT_SIZE.small.size,
            lineHeight: '20px',
            color: COLORS.textSecondary,
            textAlign: 'center',
            fontFamily: FONT.body,
          }}
        >
          Nigeria&apos;s trusted marketplace
        </Text>
      )}
    </Section>
  );
}
