import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const res = await fetch(`http://127.0.0.1:8000/api/ads/${params.slug}`, {
    headers: {
      'Accept': 'application/json',
    },
  });
  const data = await res.json();
  return NextResponse.json(data);
}
