import { CATEGORIES, type CategoryItem, type SubcategoryItem } from '@/config/categories';

export function getCategoryBySlug(slug: string): CategoryItem | undefined {
  return CATEGORIES.find(c => c.slug === slug);
}

export function getCategoryById(id: number): CategoryItem | undefined {
  return CATEGORIES.find(c => c.id === id);
}

export function getSubcategoryBySlug(slug: string): { parent: CategoryItem; sub: SubcategoryItem } | undefined {
  for (const cat of CATEGORIES) {
    const sub = cat.children.find(s => s.slug === slug);
    if (sub) return { parent: cat, sub };
  }
  return undefined;
}

export function getSubcategoryById(id: number): { parent: CategoryItem; sub: SubcategoryItem } | undefined {
  for (const cat of CATEGORIES) {
    const sub = cat.children.find(s => s.id === id);
    if (sub) return { parent: cat, sub };
  }
  return undefined;
}

export function getCategoryBreadcrumb(slug: string): string {
  const bySub = getSubcategoryBySlug(slug);
  if (bySub) return `${bySub.parent.name} > ${bySub.sub.name}`;
  const cat = getCategoryBySlug(slug);
  if (cat) return cat.name;
  return slug;
}

export function normalizeSlug(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

export function slugMatches(a: string, b: string): boolean {
  return normalizeSlug(a) === normalizeSlug(b);
}

export function getParentSlug(subcategorySlug: string): string | undefined {
  const found = getSubcategoryBySlug(subcategorySlug);
  return found?.parent.slug;
}

export function getAllCategorySlugs(): string[] {
  const slugs: string[] = [];
  for (const cat of CATEGORIES) {
    slugs.push(cat.slug);
    for (const sub of cat.children) {
      slugs.push(sub.slug);
    }
  }
  return slugs;
}

export function getImageSuggestionForCategory(slug: string): string {
  const cat = getCategoryBySlug(slug);
  if (cat?.imageSuggestion) return cat.imageSuggestion;
  const bySub = getSubcategoryBySlug(slug);
  if (bySub) return bySub.sub.imageSuggestion || bySub.parent.imageSuggestion || 'default';
  return 'default';
}

export function searchCategories(query: string): Array<{ parent: CategoryItem; sub: SubcategoryItem; matchType: 'parent' | 'child' }> {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const results: Array<{ parent: CategoryItem; sub: SubcategoryItem; matchType: 'parent' | 'child' }> = [];
  for (const cat of CATEGORIES) {
    if (cat.name.toLowerCase().includes(q)) {
      for (const sub of cat.children) {
        results.push({ parent: cat, sub, matchType: 'parent' });
      }
    } else {
      for (const sub of cat.children) {
        if (sub.name.toLowerCase().includes(q)) {
          results.push({ parent: cat, sub, matchType: 'child' });
        }
      }
    }
  }
  return results;
}
