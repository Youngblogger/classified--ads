import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await supabase
    .from('listings')
    .select('*, profiles(*)')
    .eq('slug', params.slug)
    .single();

  if (error || !data) {
    return NextResponse.json({ data: null, message: 'Ad not found' }, { status: 404 });
  }

  return NextResponse.json({
    data: {
      ...data,
      user: data.profiles,
      category: data.categories || null,
    },
  });
}
