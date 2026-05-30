const PLACEHOLDERS = [
  'user',
  'anonymous',
  'anonymous user',
  'guest',
  'null',
  'undefined',
  'test',
  'admin',
  'unknown',
];

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const UUID_NODASH_RE = /^[0-9a-f]{32}$/i;

export function normalizeReviewerName(name: string | null | undefined): string {
  if (!name) return 'Anonymous User';

  // XSS prevention
  let cleaned = name.replace(/<[^>]*>/g, '');

  // Remove invisible unicode / control characters
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\xAD\u200B-\u200F\u2028-\u202F\uFEFF]/g, '');

  // Trim
  cleaned = cleaned.trim();

  // Collapse repeated spaces
  cleaned = cleaned.replace(/\s+/g, ' ');

  if (!cleaned || cleaned === ' ') return 'Anonymous User';

  if (isPlaceholderName(cleaned)) return 'Anonymous User';

  if (isUuidLike(cleaned)) return 'Anonymous User';

  if (cleaned.length < 2 || cleaned.length > 30) return 'Anonymous User';

  return cleaned;
}

export function isPlaceholderName(name: string): boolean {
  const trimmed = name.trim().toLowerCase();
  if (!trimmed) return true;
  return PLACEHOLDERS.includes(trimmed);
}

export function isUuidLike(value: string): boolean {
  return UUID_RE.test(value) || UUID_NODASH_RE.test(value);
}

export function getReviewDisplayName(user: {
  review_display_name?: string | null;
  full_name?: string | null;
  username?: string | null;
  name?: string | null;
}): string {
  return normalizeReviewerName(
    user?.review_display_name || user?.full_name || user?.username || user?.name || null
  );
}
