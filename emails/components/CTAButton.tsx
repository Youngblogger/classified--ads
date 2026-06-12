import { Button, Section } from '@react-email/components';
import { ReactNode } from 'react';
import { COLORS } from '../utils/constants';

interface CTAButtonProps {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  fullWidth?: boolean;
}

export default function CTAButton({ href, children, variant = 'primary', fullWidth = false }: CTAButtonProps) {
  const bgColor =
    variant === 'primary' ? COLORS.primary :
    variant === 'danger' ? COLORS.error : 'transparent';

  const textColor = variant === 'secondary' ? COLORS.primary : COLORS.white;
  const border = variant === 'secondary' ? `1px solid ${COLORS.primary}` : 'none';

  return (
    <Section style={{ textAlign: 'center', padding: '8px 0' }}>
      <Button
        href={href}
        style={{
          backgroundColor: bgColor,
          borderRadius: '8px',
          color: textColor,
          fontSize: '15px',
          fontWeight: '600',
          lineHeight: '22px',
          padding: '12px 32px',
          textDecoration: 'none',
          textAlign: 'center',
          display: fullWidth ? 'block' : 'inline-block',
          border,
        }}
      >
        {children}
      </Button>
    </Section>
  );
}
