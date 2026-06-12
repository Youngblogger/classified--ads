import { Hr, Link, Text } from '@react-email/components';
import EmailLayout from '../../components/EmailLayout';
import CTAButton from '../../components/CTAButton';
import SectionCard from '../../components/SectionCard';
import { COLORS, FONT, FONT_SIZE } from '../../utils/constants';
import type { WelcomeEmailProps } from '../../utils/types';

export default function Welcome({ recipientName = 'there', previewText }: WelcomeEmailProps) {
  return (
    <EmailLayout
      previewText={previewText || `Welcome to iList, ${recipientName}! Start buying and selling today.`}
      showAppBar
      pageTitle="Welcome"
    >
      <Text style={{ fontSize: '22px', fontWeight: '700', color: COLORS.text, textAlign: 'center', margin: '0 0 6px', fontFamily: FONT.display }}>
        Welcome to iList! 🎉
      </Text>

      <Text style={{ fontSize: '15px', lineHeight: '24px', color: COLORS.textSecondary, textAlign: 'center', margin: '0 0 24px', fontFamily: FONT.body }}>
        Hi {recipientName},
        <br /><br />
        You&apos;ve joined Nigeria&apos;s trusted marketplace. Your dashboard is ready.
      </Text>

      <CTAButton href="https://classified-ads-nu.vercel.app/ads/create">
        Post Your First Ad
      </CTAButton>

      <Hr style={{ borderColor: COLORS.slate[200], margin: '24px 0 20px' }} />

      <Text style={{ fontSize: '16px', fontWeight: '600', color: COLORS.text, margin: '0 0 12px', textAlign: 'center', fontFamily: FONT.display }}>
        Get started in minutes
      </Text>

      <SectionCard>
        <Text style={{ fontSize: '14px', lineHeight: '22px', color: COLORS.text, margin: '0', fontFamily: FONT.body }}>
          <strong style={{ color: COLORS.primary }}>1.</strong> Browse ads or create your own listing
          <br />
          <strong style={{ color: COLORS.primary }}>2.</strong> Connect with buyers and sellers via chat
          <br />
          <strong style={{ color: COLORS.primary }}>3.</strong> Boost your ads for more visibility
        </Text>
      </SectionCard>

      <Text style={{ fontSize: '13px', lineHeight: '20px', color: COLORS.textSecondary, textAlign: 'center', margin: '16px 0 0', fontFamily: FONT.body }}>
        <Link href="https://classified-ads-nu.vercel.app/ads" style={{ color: COLORS.primary, textDecoration: 'underline' }}>
          Browse popular listings
        </Link>
        {' · '}
        <Link href="https://classified-ads-nu.vercel.app/help" style={{ color: COLORS.primary, textDecoration: 'underline' }}>
          How iList works
        </Link>
      </Text>
    </EmailLayout>
  );
}
