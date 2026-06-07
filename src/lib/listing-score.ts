export interface ListingScoreResult {
  score: number;
  maxScore: number;
  pct: number;
  items: Array<{
    label: string;
    met: boolean;
  }>;
}

const CHECKS: Array<{ key: string; label: string; weight: number }> = [
  { key: 'images', label: 'Has photos', weight: 25 },
  { key: 'description', label: 'Has description', weight: 20 },
  { key: 'price', label: 'Has price', weight: 20 },
  { key: 'phone', label: 'Contact number', weight: 15 },
  { key: 'specs', label: 'Specifications', weight: 10 },
  { key: 'condition', label: 'Condition', weight: 10 },
];

export function calcListingScore(ad: any): ListingScoreResult {
  let score = 0;
  const maxScore = CHECKS.reduce((s, c) => s + c.weight, 0);
  const items = CHECKS.map((check) => {
    let met = false;
    switch (check.key) {
      case 'images': {
        const imgs = ad?.images?.length || (ad?.image_url ? 1 : 0);
        met = imgs >= 1;
        break;
      }
      case 'description':
        met = !!ad?.description && ad.description.length >= 20;
        break;
      case 'price':
        met = !!ad?.price && Number(ad.price) > 0;
        break;
      case 'phone':
        met = !!(ad?.phone || ad?.sellerPhone || ad?.user?.phone || ad?.whatsapp);
        break;
      case 'specs':
        met = !!(ad?.specifications?.length || (ad?.attributes && Object.keys(ad.attributes).length));
        break;
      case 'condition':
        met = !!ad?.condition;
        break;
    }
    if (met) score += check.weight;
    return { label: check.label, met };
  });

  return { score, maxScore, pct: Math.round((score / maxScore) * 100), items };
}
