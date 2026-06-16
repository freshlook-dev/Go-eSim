import { NextResponse } from 'next/server';
import { getEsimApiUrl, getValidToken } from '@/app/lib/esimClient';

let cachedData: unknown = null;
let lastFetch = 0;

const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

export async function GET() {
  try {
    const now = Date.now();

    // ✅ Return cached data if still valid
    if (cachedData && now - lastFetch < CACHE_DURATION) {
      return NextResponse.json({
        cached: true,
        data: cachedData,
      });
    }

    // 🔥 Fetch fresh data
    const token = await getValidToken();

    const res = await fetch(getEsimApiUrl('/pricing'), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();

    // ✅ Save to cache
    cachedData = data;
    lastFetch = now;

    return NextResponse.json({
      cached: false,
      data,
    });
  } catch (error: unknown) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Server error',
    });
  }
}
