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
      console.error('Review auth error:', authError || 'No user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 422 });
    }

    const { seller_id, listing_id, ad_id, rating, comment } = body as {
      seller_id?: string;
      listing_id?: string;
      ad_id?: string;
      rating?: unknown;
      comment?: string;
    };

    const resolvedListingId = listing_id || ad_id || null;

    if (!seller_id) {
      return NextResponse.json({ error: 'Missing required field: seller_id' }, { status: 422 });
    }
    if (!resolvedListingId) {
      return NextResponse.json({ error: 'Missing required field: listing_id or ad_id' }, { status: 422 });
    }
    if (rating === undefined || rating === null) {
      return NextResponse.json({ error: 'Missing required field: rating' }, { status: 422 });
    }

    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return NextResponse.json({ error: 'Rating must be an integer between 1 and 5' }, { status: 422 });
    }

    if (seller_id === user.id) {
      return NextResponse.json({ error: 'Cannot review yourself' }, { status: 422 });
    }

    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('id')
      .eq('id', resolvedListingId)
      .maybeSingle();

    if (listingError) {
      console.error('Listing fetch error:', listingError);
      return NextResponse.json(
        { error: listingError.message, details: listingError.details, hint: listingError.hint, code: listingError.code },
        { status: 500 }
      );
    }

    if (!listing) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }

    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('reviewer_id', user.id)
      .eq('listing_id', resolvedListingId)
      .maybeSingle();

    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this ad' }, { status: 409 });
    }

    const reviewData = {
      reviewer_id: user.id,
      buyer_id: user.id,
      listing_id: resolvedListingId,
      seller_id,
      target_user_id: seller_id,
      rating: numericRating,
      comment: comment?.trim() || null,
    };

    const { data: review, error: insertError } = await supabase
      .from('reviews')
      .insert(reviewData)
      .select('*, reviewer:profiles!reviews_reviewer_id_fkey(id, full_name, username, avatar_url)')
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return NextResponse.json(
        {
          error: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: review,
      message: 'Review submitted successfully',
    });
  } catch (error) {
    console.error('Review submission failed:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
