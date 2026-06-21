import { NextRequest, NextResponse } from 'next/server';
import { RateLimiter, getClientIp } from '@/lib/rate-limiter';

const geocodeLimiter = new RateLimiter({ windowMs: 60000, max: 30 });

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const rateCheck = await geocodeLimiter.check(ip);
  if (!rateCheck.success) {
    return NextResponse.json(
      { error: geocodeLimiter.getMessage() },
      { status: geocodeLimiter.getStatusCode(), headers: { 'Retry-After': String(Math.ceil((rateCheck.resetTime - Date.now()) / 1000)) } }
    );
  }

  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lon');

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Missing lat or lon' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
      { headers: { 'User-Agent': 'iList-Classifieds/1.0' } }
    );
    if (!res.ok) throw new Error('Nominatim failed');
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Geocoding failed' }, { status: 502 });
  }
}
