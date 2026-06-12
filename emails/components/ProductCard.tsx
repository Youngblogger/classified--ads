import { Column, Img, Link, Row, Section, Text } from '@react-email/components';
import { COLORS, RADIUS, SHADOW, FONT, FONT_SIZE } from '../utils/constants';

interface ProductCardProps {
  title: string;
  imageUrl?: string;
  price?: string;
  status?: string;
  href: string;
}

export default function ProductCard({ title, imageUrl, price, status, href }: ProductCardProps) {
  return (
    <Link href={href} style={{ textDecoration: 'none', display: 'block' }}>
      <Section
        style={{
          borderRadius: RADIUS.card,
          border: `1px solid ${COLORS.slate[200]}`,
          overflow: 'hidden',
          margin: '12px 0',
          boxShadow: SHADOW.card,
          backgroundColor: COLORS.white,
        }}
      >
        <Row>
          {imageUrl && (
            <Column style={{ width: '88px', padding: '0' }}>
              <Img
                src={imageUrl}
                alt={title}
                width="88"
                height="88"
                style={{ display: 'block', objectFit: 'cover' as const, width: '100%', height: '88px' }}
              />
            </Column>
          )}
          <Column style={{ padding: '14px 16px' }}>
            <Text
              style={{
                fontSize: FONT_SIZE.adTitle.size,
                fontWeight: FONT_SIZE.adTitle.weight,
                color: COLORS.text,
                textDecoration: 'none',
                lineHeight: FONT_SIZE.adTitle.lineHeight,
                margin: '0',
                fontFamily: FONT.body,
              }}
            >
              {title}
            </Text>
            {price && (
              <Text
                style={{
                  fontSize: FONT_SIZE.price.size,
                  fontWeight: FONT_SIZE.price.weight,
                  color: COLORS.primary,
                  margin: '5px 0 0',
                  fontFamily: FONT.body,
                }}
              >
                ₦{price}
              </Text>
            )}
            {status && (
              <Text
                style={{
                  fontSize: FONT_SIZE.small.size,
                  color: COLORS.textSecondary,
                  margin: '2px 0 0',
                  fontFamily: FONT.body,
                }}
              >
                {status}
              </Text>
            )}
          </Column>
        </Row>
      </Section>
    </Link>
  );
}
