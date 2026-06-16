import { NextResponse } from 'next/server';
import { getEsimApiUrl } from '@/app/lib/esimClient';
import { setToken } from '@/app/lib/esimAuth';

function extractToken(data: unknown) {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const response = data as Record<string, unknown>;
  const nestedData = response.data && typeof response.data === 'object'
    ? response.data as Record<string, unknown>
    : null;

  const token =
    response.access_token ||
    response.token ||
    response.bearer_token ||
    nestedData?.access_token ||
    nestedData?.token ||
    nestedData?.bearer_token;

  return typeof token === 'string' && token.trim() ? token : null;
}

export async function GET() {
  try {
    const email = process.env.ESIM_API_EMAIL?.trim();
    const password = process.env.ESIM_API_PASSWORD?.trim();

    if (!email || !password) {
      throw new Error('Missing ESIM_API_EMAIL or ESIM_API_PASSWORD environment variable.');
    }

    const res = await fetch(getEsimApiUrl('/login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await res.json();

    const token = extractToken(data);

    if (token) {
      setToken(token);
    }

    return NextResponse.json(
      {
        status: res.status,
        token_saved: Boolean(token),
        data,
      },
      { status: res.ok ? 200 : res.status }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Server error',
      },
      { status: 500 }
    );
  }
}
