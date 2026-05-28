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

    const formData = await request.formData();
    const documentType = formData.get('document_type') as string;
    const documentNumber = formData.get('document_number') as string;
    const document = formData.get('document') as File;

    if (!documentType || !documentNumber || !document) {
      return NextResponse.json({ error: 'Missing required fields: document_type, document_number, document' }, { status: 400 });
    }

    const validTypes = ['nin', 'voters_card', 'drivers_license', 'passport'];
    if (!validTypes.includes(documentType)) {
      return NextResponse.json({ error: 'Invalid document type' }, { status: 400 });
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedMimeTypes.includes(document.type)) {
      return NextResponse.json({ error: 'Invalid file type. Allowed: JPEG, PNG, WebP, PDF' }, { status: 400 });
    }

    if (document.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum 10MB' }, { status: 400 });
    }

    const ext = document.name.split('.').pop() || 'jpg';
    const storagePath = `verifications/${user.id}/${Date.now()}_${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('verification-documents')
      .upload(storagePath, document);

    if (uploadError) {
      return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
    }

    const { data: existing } = await supabase
      .from('user_verifications')
      .select('id, status')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing?.status === 'pending') {
      return NextResponse.json({ error: 'You already have a pending verification request' }, { status: 409 });
    }

    const { data: verification, error: insertError } = await supabase
      .from('user_verifications')
      .insert({
        user_id: user.id,
        status: 'pending',
        document_type: documentType,
        document_number: documentNumber,
        document_url: storagePath,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: 'Failed to create verification request' }, { status: 500 });
    }

    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'verification_submitted',
      entity_type: 'user_verifications',
      entity_id: verification.id,
      metadata: { document_type: documentType },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: verification.id,
        status: verification.status,
        message: 'Verification document submitted successfully. Processing...',
      },
    });
  } catch (error) {
    console.error('[KYC Submit] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
