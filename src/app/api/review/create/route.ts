import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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

    const { seller_id, rating, comment, transaction_id } = await request.json();

    if (!seller_id || !rating) {
      return NextResponse.json({ error: 'Missing required fields: seller_id, rating' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    if (seller_id === user.id) {
      return NextResponse.json({ error: 'Cannot review yourself' }, { status: 400 });
    }

    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('seller_id', seller_id)
      .eq('buyer_id', user.id)
      .maybeSingle();

    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this seller' }, { status: 409 });
    }

    const { data: review, error: insertError } = await supabase
      .from('reviews')
      .insert({
        seller_id,
        buyer_id: user.id,
        rating,
        comment: comment || null,
        transaction_id: transaction_id || null,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: review,
      message: 'Review submitted successfully',
    });
  } catch (error) {
    console.error('[Review Create] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
