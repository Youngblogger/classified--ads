export const BOOST_PLANS: Record<string, any> = {};
export const BOOST_PRICES: Record<string, any> = {};
export const BOOST_DURATIONS: Record<string, any> = {};
export type BoostType = string;

export function getBoostPlan(id?: string): any {
  return null;
}
export function getBoostPrice(type?: string, duration?: string): number {
  return 0;
}
export function sortAdsByBoostPriority<T extends Record<string, any>>(ads: T[]): T[] {
  return ads;
}
export function getBoostCardClasses(type?: string | null): string {
  return '';
}
export function getBoostConfig(type?: string | null): any {
  return null;
}
export function isBoostExpired(expiresAt?: string | null): boolean {
  return true;
}
export function calculateBoostScore(ad: Record<string, any>): number {
  return 0;
}
export function getBoostPlanEmoji(type?: string | null): string {
  return '';
}
