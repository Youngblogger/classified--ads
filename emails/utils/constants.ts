/**
 * Design tokens synced with website Tailwind config.
 * When updating tailwind.config.js, mirror changes here.
 */
export const BRAND = {
  name: 'iList',
  logo: 'https://classified-ads-nu.vercel.app/icons/iList-white.png',
  logoDark: 'https://classified-ads-nu.vercel.app/icons/iList-dark.png',
  website: 'https://classified-ads-nu.vercel.app',
  supportEmail: 'support@ilist.ng',
  supportUrl: 'https://classified-ads-nu.vercel.app/help',
  twitter: 'https://x.com/ilist_ng',
  instagram: 'https://instagram.com/ilist.ng',
  address: 'Lagos, Nigeria',
  copyright: `© ${new Date().getFullYear()} iList. All rights reserved.`,
} as const;

/**
 * Exact color tokens from tailwind.config.js
 * - primary: green brand palette
 * - slate: neutral gray palette
 * - semantic: success, warning, error
 */
export const COLORS = {
  // Primary brand (matches tailwind: primary-500 thru primary-700)
  primary: '#00B53F',
  primaryDark: '#009E38',
  primaryDarker: '#008C31',
  primaryLight: '#E8FFF0',

  // Secondary green palette
  secondary: '#16A34A',
  secondaryLight: '#F0FDF4',

  // Semantic colors
  success: '#22C55E',
  successLight: '#DCFCE7',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',

  // Neutral palette (matches tailwind "slate")
  slate: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },

  // Surface colors
  white: '#FFFFFF',
  bg: '#F5F7FA',
  cardBg: '#FFFFFF',

  // Text colors (matches tailwind "dark" + slate-500)
  text: '#1F2937',
  textSecondary: '#64748B',
} as const;

/**
 * Border radius tokens (matches tailwind: rounded-xl)
 */
export const RADIUS = {
  card: '12px',
  button: '8px',
  badge: '9999px',
  input: '8px',
} as const;

/**
 * Shadow tokens (matches tailwind: shadow-card)
 */
export const SHADOW = {
  card: '0 1px 3px rgba(0, 0, 0, 0.08)',
  cardHover: '0 4px 12px rgba(0, 0, 0, 0.12)',
  dropdown: '0 4px 16px rgba(0, 0, 0, 0.1)',
  header: '0 2px 4px rgba(0, 0, 0, 0.05)',
} as const;

/**
 * Font tokens (matches tailwind: font-sans, font-display)
 */
export const FONT = {
  body: "'Inter', system-ui, -apple-system, sans-serif",
  display: "'Poppins', system-ui, sans-serif",
} as const;

/**
 * Font size tokens (matches tailwind fontSize config)
 */
export const FONT_SIZE = {
  pageTitle: { size: '20px', lineHeight: '1.3', weight: '600' },
  sectionTitle: { size: '16px', lineHeight: '1.4', weight: '600' },
  adTitle: { size: '15px', lineHeight: '1.4', weight: '500' },
  price: { size: '16px', lineHeight: '1.4', weight: '700' },
  priceLg: { size: '18px', lineHeight: '1.4', weight: '700' },
  body: { size: '14px', lineHeight: '1.5', weight: '400' },
  small: { size: '12px', lineHeight: '1.4', weight: '400' },
  tiny: { size: '11px', lineHeight: '1.4', weight: '400' },
  button: { size: '14px', lineHeight: '1.4', weight: '500' },
} as const;
