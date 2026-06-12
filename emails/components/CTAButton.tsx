import { Button, Section } from '@react-email/components';
import { ReactNode } from 'react';
import { COLORS, RADIUS, FONT, FONT_SIZE } from '../utils/constants';

interface CTAButtonProps {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  fullWidth?: boolean;
}

/**
 * Button that mirrors the website's button styles exactly.
 *
 * Variant mapping (matches tailwind classes):
 * - primary:   bg-primary-600 text-white hover:bg-primary-700
 * - secondary: bg-white text-primary-600 border-primary-600
 * - danger:    bg-error text-white
 * - ghost:     bg-slate-100 text-slate-700
 */
export default function CTAButton({ href, children, variant = 'primary', fullWidth = false }: CTAButtonProps) {
  const styles = {
    primary: {
      backgroundColor: COLORS.primaryDark,
      color: COLORS.white,
      border: 'none',
    },
    secondary: {
      backgroundColor: COLORS.white,
      color: COLORS.primary,
      border: `1.5px solid ${COLORS.primary}`,
    },
    danger: {
      backgroundColor: COLORS.error,
      color: COLORS.white,
      border: 'none',
    },
    ghost: {
      backgroundColor: COLORS.slate[100],
      color: COLORS.slate[700],
      border: 'none',
    },
  };

  const s = styles[variant];

  return (
    <Section style={{ textAlign: 'center', padding: '8px 0' }}>
      <Button
        href={href}
        style={{
          backgroundColor: s.backgroundColor,
          borderRadius: RADIUS.button,
          color: s.color,
          fontSize: FONT_SIZE.button.size,
          fontWeight: FONT_SIZE.button.weight,
          lineHeight: FONT_SIZE.button.lineHeight,
          padding: '12px 28px',
          textDecoration: 'none',
          textAlign: 'center',
          display: fullWidth ? 'block' : 'inline-block',
          border: s.border,
          fontFamily: FONT.body,
        }}
      >
        {children}
      </Button>
    </Section>
  );
}
