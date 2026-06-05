'use client';

export interface ParsedQuery {
  original: string;
  keyword: string;
  location?: string;
  category?: string;
  isLocationOnly: boolean;
  isCategoryOnly: boolean;
}

const LOCATION_KEYWORDS = [
  'in', 'at', 'near', 'around', 'lagos', 'abuja', 'kano', 'ibadan', 'port harcourt',
  'enugu', 'aba', 'onitsha', 'owerri', 'warri', 'benin', 'kaduna', 'jos', 'maiduguri',
  'ilorin', 'akure', 'abeokuta', 'uyo', 'calabar', 'gombe', 'yola', 'bauchi',
  'sokoto', 'katsina', 'minna', 'lafia', 'makurdi', 'asaba', 'awka', 'osogbo',
  'ife', 'ijebu', 'ore', 'sagamu', 'badagry', 'ikeja', 'surulere', 'victoria island',
  'lekki', 'ajah', 'yaba', 'agege', 'ogba', 'festac', 'apapa', 'egbeda',
  'alimosho', 'mushin', 'oshodi', 'isolo', 'ketu', 'ipaja', 'bariga', 'gbagada',
  'maryland', 'ilupéju', 'ikoyi', 'ikotun', 'egbe', 'idimu', 'alagbado', 'dopemu',
  'papa', 'aja', 'langbasa', 'sangotedo', 'abijo', 'ilaje', 'ibefun', 'akodo',
  'imota', 'epé', 'ikorodu', 'osoroko', 'irawo', 'agbowa', 'ishara',
];

const CATEGORY_KEYWORDS = [
  'phones', 'phone', 'iphone', 'samsung', 'nokia', 'tecno', 'infinix',
  'cars', 'car', 'toyota', 'honda', 'benz', 'bmw', 'lexus', 'hyundai', 'kia',
  'houses', 'house', 'apartment', 'flat', 'land', 'property', 'rent', 'shortlet',
  'laptops', 'laptop', 'computers', 'computer', 'macbook', 'dell', 'hp', 'lenovo',
  'furniture', 'furniture', 'sofa', 'bed', 'table', 'chair', 'wardrobe',
  'generator', 'generators', 'inverter', 'batteries', 'solar',
  'fashion', 'clothes', 'shoes', 'bags', 'watches', 'jewelry',
  'tv', 'television', 'speaker', 'sound', 'home theatre', 'ac', 'air conditioner',
  'refrigerator', 'fridge', 'freezer', 'washing machine', 'microwave', 'oven',
  'bicycles', 'bike', 'motorcycle', 'scooter',
  'jobs', 'job', 'vacancy', 'employment', 'work',
  'services', 'service', 'repair', 'cleaning', 'tutoring',
  'pets', 'dog', 'cat', 'fish', 'bird', 'puppy',
  'baby', 'toys', 'kids', 'children', 'stroller', 'crib',
  'sports', 'gym', 'fitness', 'football', 'jersey',
  'books', 'book', 'textbook', 'novel', 'magazine',
  'agric', 'farm', 'farming', 'livestock', 'poultry', 'goat', 'cow',
  'food', 'drinks', 'beverages', 'restaurant', 'catering',
  'beauty', 'makeup', 'nail', 'hair', 'wig', 'cream', 'perfume',
  'phones & tablets', 'electronics', 'appliances', 'vehicles', 'properties',
  'fashion & beauty', 'home & garden', 'sports & fitness', 'health',
  'entertainment', 'education', 'business', 'agriculture',
];

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
  'used', 'to', 'of', 'for', 'with', 'by', 'from', 'as', 'at', 'in',
  'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once',
  'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each',
  'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such',
  'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too',
  'very', 'just', 'because', 'but', 'and', 'or', 'if', 'into',
  'your', 'his', 'her', 'its', 'my', 'our', 'their', 'me', 'us',
]);

export function parseQuery(query: string): ParsedQuery {
  const original = query.trim().toLowerCase();
  if (!original) {
    return { original, keyword: '', isLocationOnly: false, isCategoryOnly: false };
  }

  const tokens = original.split(/\s+/).filter(t => t.length > 0);

  let keyword = original;
  let detectedLocation: string | undefined;
  let detectedCategory: string | undefined;

  const locationTokenIndex = tokens.findIndex(t => LOCATION_KEYWORDS.includes(t));
  const inIndex = tokens.findIndex(t => t === 'in' || t === 'at' || t === 'near');

  if (locationTokenIndex >= 0 && locationTokenIndex === tokens.length - 1) {
    detectedLocation = tokens[locationTokenIndex];
    keyword = tokens.slice(0, locationTokenIndex).join(' ');
  } else if (inIndex >= 0 && inIndex < tokens.length - 1) {
    const afterIn = tokens.slice(inIndex + 1);
    const locationName = afterIn.join(' ');
    if (LOCATION_KEYWORDS.includes(locationName) || afterIn.every(t => !CATEGORY_KEYWORDS.includes(t))) {
      detectedLocation = locationName;
      keyword = tokens.slice(0, inIndex).join(' ');
    }
  } else if (tokens.length === 1 && LOCATION_KEYWORDS.includes(tokens[0])) {
    detectedLocation = tokens[0];
    keyword = '';
  }

  const keywordTokens = keyword ? keyword.split(/\s+/).filter(t => t.length > 0) : [];
  const catToken = keywordTokens.find(t => CATEGORY_KEYWORDS.includes(t));
  if (catToken) {
    detectedCategory = catToken;
  }

  if (!detectedCategory) {
    const allTokens = original.split(/\s+/).filter(t => t.length > 0 && !STOP_WORDS.has(t));
    if (allTokens.length === 1 && !detectedLocation) {
      const possibleCat = CATEGORY_KEYWORDS.find(c =>
        c === allTokens[0] || allTokens[0].startsWith(c) || c.startsWith(allTokens[0])
      );
      if (possibleCat) {
        detectedCategory = possibleCat;
      }
    }
  }

  keyword = keyword.trim();
  const isLocationOnly = !!detectedLocation && !keyword;
  const isCategoryOnly = !!detectedCategory && !keyword && !detectedLocation;

  return {
    original: query.trim(),
    keyword: keyword || detectedCategory || detectedLocation || original,
    location: detectedLocation,
    category: detectedCategory,
    isLocationOnly,
    isCategoryOnly,
  };
}

export function buildSearchParams(parsed: ParsedQuery): Record<string, string> {
  const params: Record<string, string> = {};
  if (parsed.keyword) params.q = parsed.keyword;
  if (parsed.location && !parsed.isLocationOnly) {
    params.location = parsed.location;
  }
  return params;
}
