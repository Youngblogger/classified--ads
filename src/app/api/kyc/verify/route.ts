import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { analyzeFraud } from '@/lib/fraud-engine';
import { calculateTrustScore } from '@/lib/trust-engine';
import { getClientIp, maskDocumentNumber } from '@/lib/security';

export async function POST(request: NextRequest) {
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

    const { verificationId } = await request.json();
    if (!verificationId) {
      return NextResponse.json({ error: 'Missing verificationId' }, { status: 400 });
    }

    const { data: verification, error: fetchError } = await supabase
      .from('user_verifications')
      .select('*')
      .eq('id', verificationId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !verification) {
      return NextResponse.json({ error: 'Verification request not found' }, { status: 404 });
    }

    if (verification.status !== 'pending') {
      return NextResponse.json({ error: `Verification already ${verification.status}` }, { status: 400 });
    }

    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || '';

    const fraudResult = await analyzeFraud({
      userId: user.id,
      documentNumber: verification.document_number,
      ipAddress,
    });

    await supabase
      .from('user_verifications')
      .update({
        fraud_score: fraudResult.score,
        kyc_provider: 'internal',
        kyc_reference: `KYC-${verificationId}`,
        status: fraudResult.decision === 'approve' ? 'verified' : 'rejected',
        verified_at: fraudResult.decision === 'approve' ? new Date().toISOString() : null,
      })
      .eq('id', verificationId);

    if (fraudResult.decision === 'approve') {
      await supabase
        .from('profiles')
        .update({ is_verified: true })
        .eq('id', user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_verified, rating_avg, completed_transactions, response_rate')
        .eq('id', user.id)
        .single();

      if (profile) {
        const trustScore = calculateTrustScore({
          is_verified: true,
          rating_avg: profile.rating_avg ?? 0,
          completed_transactions: profile.completed_transactions ?? 0,
          response_rate: profile.response_rate ?? 0,
          account_age_days: Math.floor(
            (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
          ),
        });

        await supabase
          .from('profiles')
          .update({ trust_score: trustScore })
          .eq('id', user.id);
      }
    }

    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: fraudResult.decision === 'approve' ? 'verification_approved' : 'verification_rejected',
      entity_type: 'user_verifications',
      entity_id: verificationId,
      new_values: {
        status: fraudResult.decision === 'approve' ? 'verified' : 'rejected',
        fraud_score: fraudResult.score,
        fraud_signals: fraudResult.signals,
      },
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    const response = {
      success: true,
      data: {
        status: fraudResult.decision === 'approve' ? 'verified' : 'rejected',
        fraud_score: fraudResult.score,
        signals: fraudResult.signals,
        message: fraudResult.decision === 'approve'
          ? 'Identity verified successfully. Your blue verified badge is now active.'
          : fraudResult.decision === 'manual_review'
            ? 'Verification requires manual review. We will notify you within 24-48 hours.'
            : 'Verification could not be completed due to security concerns.',
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[KYC Verify] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
