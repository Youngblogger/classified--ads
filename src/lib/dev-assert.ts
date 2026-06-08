const DEV = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';

export function assertValidListing(listing: any, source: string): void {
  if (!DEV) return;

  const issues: string[] = [];

  if (!listing) {
    console.warn(`[dev-assert] Listing is null/undefined from ${source}`);
    return;
  }

  if (!listing.id && listing.id !== 0) {
    issues.push('missing id');
  }

  if (!listing.title || typeof listing.title !== 'string') {
    issues.push('invalid title');
  }

  if (listing.images && !Array.isArray(listing.images)) {
    issues.push('invalid images array');
  }

  if (listing.status && !['active', 'inactive', 'sold', 'expired', 'draft', 'pending', 'rejected'].includes(listing.status)) {
    issues.push(`invalid status: ${listing.status}`);
  }

  if (listing.created_at && isNaN(Date.parse(listing.created_at))) {
    issues.push('invalid created_at');
  }

  if (issues.length > 0) {
    console.warn(`[dev-assert] Malformed listing from ${source}:`, issues, listing.id);
  }
}

export function assertValidListings(listings: any[], source: string): void {
  if (!DEV) return;
  if (!Array.isArray(listings)) {
    console.warn(`[dev-assert] Expected array from ${source}, got ${typeof listings}`);
    return;
  }
  for (const listing of listings) {
    assertValidListing(listing, source);
  }
}