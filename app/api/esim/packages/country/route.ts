import { NextResponse } from 'next/server';
import { getEsimApiUrl, getValidToken } from '@/app/lib/esimClient';

export async function GET() {
  try {
    const token = await getValidToken();

    const res = await fetch(getEsimApiUrl('/packages/country'), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();

    return NextResponse.json({
      status: res.status,
      data,
    });
  } catch (error: unknown) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Server error',
    });
  }
}
