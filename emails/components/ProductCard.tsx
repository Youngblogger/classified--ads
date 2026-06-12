import { Column, Img, Link, Row, Section, Text } from '@react-email/components';
import { COLORS } from '../utils/constants';

interface ProductCardProps {
  title: string;
  imageUrl?: string;
  price?: string;
  status?: string;
  href: string;
}

export default function ProductCard({ title, imageUrl, price, status, href }: ProductCardProps) {
  return (
    <Section
      style={{
        borderRadius: '8px',
        border: `1px solid ${COLORS.gray[200]}`,
        overflow: 'hidden',
        margin: '12px 0',
      }}
    >
      <Row>
        {imageUrl && (
          <Column style={{ width: '80px', padding: '0' }}>
            <Img
              src={imageUrl}
              alt={title}
              width="80"
              height="80"
              style={{ display: 'block', objectFit: 'cover' }}
            />
          </Column>
        )}
        <Column style={{ padding: '12px 16px' }}>
          <Link
            href={href}
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: COLORS.text,
              textDecoration: 'none',
              lineHeight: '20px',
            }}
          >
            {title}
          </Link>
          {price && (
            <Text
              style={{
                fontSize: '15px',
                fontWeight: '700',
                color: COLORS.primary,
                margin: '4px 0 0',
              }}
            >
              ₦{price}
            </Text>
          )}
          {status && (
            <Text
              style={{
                fontSize: '12px',
                color: COLORS.textSecondary,
                margin: '2px 0 0',
              }}
            >
              {status}
            </Text>
          )}
        </Column>
      </Row>
    </Section>
  );
}
