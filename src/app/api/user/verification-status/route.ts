import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; },
          set() {},
          remove() {},
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_verified, trust_score')
      .eq('id', user.id)
      .single();

    const { data: verification } = await supabase
      .from('user_verifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return NextResponse.json({
      success: true,
      data: {
        is_verified: profile?.is_verified ?? false,
        trust_score: profile?.trust_score ?? 0,
        verification: verification ? {
          id: verification.id,
          status: verification.status,
          document_type: verification.document_type,
          kyc_provider: verification.kyc_provider,
          fraud_score: verification.fraud_score,
          face_match_score: verification.face_match_score,
          created_at: verification.created_at,
          verified_at: verification.verified_at,
        } : null,
      },
    });
  } catch (error) {
    console.error('[VerificationStatus] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
