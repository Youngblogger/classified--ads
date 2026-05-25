export type BoostEvent =
  | 'ad_created'
  | 'boost_offer_viewed'
  | 'boost_package_selected'
  | 'payment_started'
  | 'payment_completed'
  | 'payment_failed'
  | 'boost_activated'
  | 'boost_skipped';

interface AnalyticsPayload {
  name: BoostEvent;
  ad_id?: number;
  package_type?: string;
  package_price?: number;
  reference?: string;
  duration_days?: number;
  error?: string;
  payment_method?: string;
  timestamp: number;
}

export function trackBoostEvent(event: BoostEvent, payload?: Partial<AnalyticsPayload>): void {
  const data: AnalyticsPayload = {
    name: event,
    timestamp: Date.now(),
    ...payload,
  };

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] ${event}`, payload || '');
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    fetch(`${apiUrl}/analytics/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}
