import { Link, Section, Text } from '@react-email/components';
import EmailLayout from '../../components/EmailLayout';
import CTAButton from '../../components/CTAButton';
import SectionCard from '../../components/SectionCard';
import { COLORS } from '../../utils/constants';
import type { WelcomeEmailProps } from '../../utils/types';

export default function Welcome({ recipientName = 'there', previewText }: WelcomeEmailProps) {
  return (
    <EmailLayout
      previewText={previewText || `Welcome to iList, ${recipientName}! Start buying and selling today.`}
    >
      <Text style={{ fontSize: '24px', fontWeight: '700', color: COLORS.text, textAlign: 'center', margin: '0 0 8px' }}>
        Welcome to iList! 🎉
      </Text>

      <Text style={{ fontSize: '14px', lineHeight: '22px', color: COLORS.textSecondary, textAlign: 'center', margin: '0 0 24px' }}>
        Hi {recipientName},
        <br /><br />
        Thanks for joining iList — Nigeria&apos;s trusted marketplace. We&apos;re excited to have you on board!
      </Text>

      <CTAButton href="https://classified-ads-nu.vercel.app/ads/create">
        Post Your First Ad
      </CTAButton>

      <SectionCard title="WHAT YOU CAN DO">
        <Text style={{ fontSize: '13px', lineHeight: '20px', color: COLORS.text, margin: '0 0 8px' }}>
          ✅ <strong>Buy & Sell</strong> — Browse thousands of listings or create your own ad in minutes
        </Text>
        <Text style={{ fontSize: '13px', lineHeight: '20px', color: COLORS.text, margin: '0 0 8px' }}>
          ✅ <strong>Boost Your Ads</strong> — Get more visibility with our affordable boost plans
        </Text>
        <Text style={{ fontSize: '13px', lineHeight: '20px', color: COLORS.text, margin: '0 0 8px' }}>
          ✅ <strong>Secure Wallet</strong> — Manage your funds easily with our built-in wallet system
        </Text>
        <Text style={{ fontSize: '13px', lineHeight: '20px', color: COLORS.text, margin: '0' }}>
          ✅ <strong>Real-time Chat</strong> — Connect directly with buyers and sellers
        </Text>
      </SectionCard>

      <Text style={{ fontSize: '13px', lineHeight: '20px', color: COLORS.textSecondary, margin: '16px 0 0' }}>
        Want to get started right away?{' '}
        <Link href="https://classified-ads-nu.vercel.app/ads" style={{ color: COLORS.primary, textDecoration: 'underline' }}>
          Browse popular listings
        </Link>
        {' '}or{' '}
        <Link href="https://classified-ads-nu.vercel.app/help" style={{ color: COLORS.primary, textDecoration: 'underline' }}>
          learn how iList works
        </Link>
        .
      </Text>
    </EmailLayout>
  );
}
