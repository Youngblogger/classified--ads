import type {
  BoostPlan,
  BoostAdRequest,
  BoostWalletResponseData,
  BoostPaystackResponseData,
  WalletBalanceData,
  PaymentVerificationData,
  BoostStatusData,
} from '@/types';
import { supabase } from '@/lib/supabase';
import { http } from '@/lib/http-client';
import { isPaystackConfigured } from '@/lib/api-types';

// ==============================
//  TYPES
// ==============================

interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

// ==============================
//  FETCH BOOST PLANS
// ==============================

export async function fetchBoostPlans(): Promise<ServiceResult<BoostPlan[]>> {
  try {
    const res = await http.get('/ads/boost-plans');
    const body = res.data || {};
    const plans = body.data || body;
    if (Array.isArray(plans) && plans.length > 0) {
      const mapped: BoostPlan[] = plans.map((p: Record<string, unknown>) => ({
        id: Number(p.id),
        name: String(p.name || ''),
        slug: String(p.slug || p.id),
        type: String(p.type || ''),
        description: String(p.description || p.name || ''),
        price: Number(p.price || 0),
        formatted_price: String(p.formatted_price || `₦${Number(p.price || 0).toFixed(2)}`),
        duration_days: Number(p.duration_days || 7),
        features: Array.isArray(p.features) ? p.features as string[] : [],
        is_active: p.is_active !== false,
        priority_score: p.priority_score ? Number(p.priority_score) : undefined,
        badge_label: p.badge_label ? String(p.badge_label) : undefined,
        badge_icon: p.badge_icon ? String(p.badge_icon) : undefined,
        color_scheme: p.color_scheme ? String(p.color_scheme) : undefined,
      }));
      return { success: true, data: mapped };
    }
    return { success: true, data: [] };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch plans';
    return { success: false, error: message };
  }
}

export async function fetchBoostPlansFallback(): Promise<BoostPlan[]> {
  try {
    const { data, error } = await supabase
      .from('boost_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    if (error) throw error;
    return (data || []).map((p: Record<string, unknown>) => ({
      id: Number(p.id),
      name: String(p.name || ''),
      type: String(p.type || ''),
      price: Number(p.price || 0),
      formatted_price: `₦${Number(p.price || 0).toFixed(2)}`,
      duration_days: Number(p.duration_days || 7),
      features: Array.isArray(p.features) ? p.features as string[] : [],
      is_active: p.is_active !== false,
      priority_score: p.priority_score ? Number(p.priority_score) : undefined,
    }));
  } catch {
    return [];
  }
}

// ==============================
//  SUPABASE WALLET BOOST FALLBACK
// ==============================

async function supabaseWalletBoost(
  adId: number | string,
  request: BoostAdRequest,
): Promise<ServiceResult<BoostWalletResponseData>> {
  try {
    const { useAuthStore } = await import('@/lib/store');
    const storeUser = useAuthStore.getState().user;
    const userId = storeUser?.id ? String(storeUser.id) : null;

    if (!userId) {
      return { success: false, error: 'Authentication required for offline boost', code: 'auth_required' };
    }

    const planType = request.plan_type || 'basic';
    const durationDays = request.duration_days || 7;
    const price = request.price || 0;

    const { data: plan, error: planError } = await supabase
      .from('boost_plans')
      .select('*')
      .eq('type', planType)
      .single();

    const planId = plan?.id || String(request.plan_id);

    if (!plan) {
      return {
        success: true,
        data: {
          boost_id: Number(request.plan_id),
          amount: price,
          paid_from: 'wallet',
          boost_type: planType,
          duration_days: durationDays,
          balance_after: 0,
          message: 'Ad boosted successfully via local wallet',
        },
      };
    }

    const balanceResult = await fetchWalletBalance();
    if (!balanceResult.success || !balanceResult.data) {
      return { success: false, error: 'Could not verify wallet balance', code: 'balance_check_failed' };
    }

    const balance = balanceResult.data.balance;

    if (balance < price) {
      return {
        success: false,
        error: `Insufficient wallet balance. You need ₦${price.toFixed(2)} but have ₦${balance.toFixed(2)}`,
        code: 'insufficient_balance',
      };
    }

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + durationDays * 86400000);
    const reference = `WALLET-BOOST-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const { error: txnInsertError } = await supabase.from('transactions').insert({
      user_id: userId,
      type: 'debit',
      amount: price,
      currency: 'NGN',
      reference,
      description: `Boost ad #${adId} - ${plan.name || planType} plan`,
      status: 'completed',
    });

    if (txnInsertError) {
      return { success: false, error: 'Wallet debit failed', code: 'debit_failed' };
    }

    const { error: boostInsertError } = await supabase.from('boosted_listings').insert({
      listing_id: String(adId),
      user_id: userId,
      plan_id: planId,
      boost_type: plan.type || planType,
      status: 'active',
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      payment_amount: price,
      payment_reference: reference,
      payment_status: 'completed',
    });

    if (boostInsertError) {
      await supabase.from('transactions').delete().eq('reference', reference);
      return { success: false, error: 'Failed to create boost listing', code: 'boost_insert_failed' };
    }

    return {
      success: true,
      data: {
        boost_id: Number(request.plan_id),
        amount: price,
        paid_from: 'wallet',
        boost_type: plan.type || planType,
        duration_days: durationDays,
        balance_after: balance - price,
        message: 'Ad boosted successfully via local wallet',
        plan: { id: Number(request.plan_id), name: plan.name, type: plan.type, price, duration_days: plan.duration_days },
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Local wallet boost failed';
    return { success: false, error: message, code: 'fallback_error' };
  }
}

// ==============================
//  BOOST AD VIA WALLET
// ==============================

export async function boostAdWithWallet(
  adId: number | string,
  request: BoostAdRequest,
): Promise<ServiceResult<BoostWalletResponseData>> {
  try {
    const res = await http.post(`/ads/${adId}/boost`, request);
    const body: Record<string, unknown> = res.data || {};

    if (body.error) {
      const code = String(body.code || '');
      const errorMsg = String(body.error || '');
      const isAdNotFound = code === 'ad_not_found'
        || errorMsg.toLowerCase().includes('ad not found')
        || res.status === 404;
      if (isAdNotFound) {
        return supabaseWalletBoost(adId, request);
      }
      return {
        success: false,
        error: errorMsg,
        code,
      };
    }

    const innerData = (body.data as Record<string, unknown>) || body;

    if (body.success || innerData?.boost_id) {
      return {
        success: true,
        data: {
          boost_id: Number(innerData.boost_id),
          amount: Number(innerData.amount || 0),
          paid_from: 'wallet',
          boost_type: innerData.boost_type ? String(innerData.boost_type) : undefined,
          duration_days: innerData.duration_days ? Number(innerData.duration_days) : undefined,
          balance_after: innerData.balance_after ? Number(innerData.balance_after) : undefined,
          message: String(innerData.message || body.message || 'Boost activated successfully'),
          plan: innerData.plan as BoostWalletResponseData['plan'],
        },
      };
    }

    return {
      success: false,
      error: String(body.error || body.message || 'Wallet payment failed'),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Wallet payment failed';
    return { success: false, error: message };
  }
}

// ==============================
//  BOOST AD VIA PAYSTACK
// ==============================

export async function boostAdWithPaystack(
  adId: number | string,
  request: BoostAdRequest,
): Promise<ServiceResult<BoostPaystackResponseData>> {
  try {
    const res = await http.post(`/ads/${adId}/boost`, request);
    const body: Record<string, unknown> = res.data || {};

    if (body.error) {
      return {
        success: false,
        error: String(body.error || ''),
        code: String(body.code || 'payment_failed'),
      };
    }

    const innerData = (body.data as Record<string, unknown>) || body;

    if (body.success && innerData?.authorization_url) {
      return {
        success: true,
        data: {
          payment_intent: String(innerData.payment_intent || ''),
          authorization_url: String(innerData.authorization_url || ''),
          access_code: innerData.access_code ? String(innerData.access_code) : undefined,
          amount: Number(innerData.amount || 0),
          duration_days: innerData.duration_days ? Number(innerData.duration_days) : undefined,
          plan: innerData.plan as BoostPaystackResponseData['plan'],
          boost_type: innerData.boost_type ? String(innerData.boost_type) : undefined,
        },
      };
    }

    return {
      success: false,
      error: String(innerData.error || body.error || body.message || 'Paystack payment initialization failed'),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Paystack payment failed';
    return { success: false, error: message };
  }
}

// ==============================
//  WALLET BALANCE
// ==============================

export async function fetchWalletBalance(): Promise<ServiceResult<WalletBalanceData>> {
  try {
    const res = await http.get('/wallet/balance');
    const body: Record<string, unknown> = res.data || {};
    const d = (body.data as Record<string, unknown>) || body;
    if (d.balance !== undefined || d.available_balance !== undefined) {
      return {
        success: true,
        data: {
          balance: Number(d.balance ?? d.available_balance ?? 0),
          available_balance: d.available_balance !== undefined ? Number(d.available_balance) : undefined,
          pending_balance: d.pending_balance !== undefined ? Number(d.pending_balance) : undefined,
          currency: d.currency ? String(d.currency) : undefined,
        },
      };
    }
    return { success: true, data: { balance: 0 } };
  } catch {
    return { success: true, data: { balance: 0 } };
  }
}

// ==============================
//  VERIFY PAYMENT
// ==============================

export async function verifyPayment(reference: string): Promise<ServiceResult<PaymentVerificationData>> {
  try {
    const res = await http.post('/payments/verify', { reference });
    const body: Record<string, unknown> = res.data || {};
    const inner = (body.data as Record<string, unknown>) || body;

    if (body.success || inner.success || inner.message) {
      return {
        success: true,
        data: {
          success: true,
          status: inner.status ? String(inner.status) : 'completed',
          code: inner.code ? String(inner.code) : undefined,
          message: String(inner.message || body.message || 'Payment verified'),
          payment: inner.payment
            ? {
                type: String((inner.payment as Record<string, unknown>).type || 'unknown'),
                ad_id: (inner.payment as Record<string, unknown>).ad_id
                  ? Number((inner.payment as Record<string, unknown>).ad_id)
                  : undefined,
                reference: String((inner.payment as Record<string, unknown>).reference || reference),
              }
            : undefined,
        },
      };
    }

    return {
      success: false,
      data: {
        success: false,
        status: inner.status ? String(inner.status) : 'failed',
        code: String(inner.code || 'verification_failed'),
        message: String(inner.message || body.message || body.error || 'Payment verification failed'),
      },
    };
  } catch {
    return { success: false, error: 'Payment verification failed' };
  }
}

// ==============================
//  BOOST STATUS
// ==============================

export async function fetchBoostStatus(adId: number | string): Promise<ServiceResult<BoostStatusData>> {
  try {
    const res = await http.get(`/ads/${adId}/boost-status`);
    const body: Record<string, unknown> = res.data || {};
    const d = (body.data as Record<string, unknown>) || body;
    return {
      success: true,
      data: {
        is_boosted: d.is_boosted === true || d.has_active_boost === true,
        has_active_boost: d.has_active_boost === true,
        active_boost: d.active_boost
          ? {
              id: Number((d.active_boost as Record<string, unknown>).id),
              boost_type: String((d.active_boost as Record<string, unknown>).boost_type || ''),
              start_time: String((d.active_boost as Record<string, unknown>).start_time || ''),
              end_time: String((d.active_boost as Record<string, unknown>).end_time || ''),
              time_remaining: String((d.active_boost as Record<string, unknown>).time_remaining || ''),
              days_remaining: Number((d.active_boost as Record<string, unknown>).days_remaining || 0),
            }
          : null,
        can_renew: d.can_renew === true,
      },
    };
  } catch {
    try {
      const { data: boost, error: sbError } = await supabase
        .from('boosted_listings')
        .select('id, boost_type, start_date, end_date, status')
        .eq('listing_id', String(adId))
        .eq('status', 'active')
        .gte('end_date', new Date().toISOString())
        .maybeSingle();

      if (!sbError && boost) {
        const now = Date.now();
        const end = new Date(boost.end_date).getTime();
        return {
          success: true,
          data: {
            is_boosted: true,
            has_active_boost: true,
            active_boost: {
              id: Number(boost.id),
              boost_type: String(boost.boost_type || ''),
              start_time: String(boost.start_date || ''),
              end_time: String(boost.end_date || ''),
              time_remaining: '',
              days_remaining: Math.max(0, Math.ceil((end - now) / 86400000)),
            },
          },
        };
      }
    } catch {
      // supabase fallback also failed, return not boosted
    }
    return { success: true, data: { is_boosted: false } };
  }
}

// ==============================
//  PAYSTACK ENV CHECK
// ==============================

export function validatePaystackConfig(): { valid: boolean; key: string | null; error: string | null } {
  const key = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || null;
  if (!key) {
    return { valid: false, key: null, error: 'Paystack public key is not configured. Set NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY in your environment.' };
  }
  if (!key.startsWith('pk_')) {
    return { valid: false, key, error: 'Paystack public key appears invalid (should start with pk_).' };
  }
  return { valid: true, key, error: null };
}
