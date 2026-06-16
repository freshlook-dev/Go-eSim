import { NextResponse } from 'next/server';
import { getEsimApiUrl } from '@/app/lib/esimClient';
import { setToken } from '@/app/lib/esimAuth';

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

    const token = data?.access_token;

    if (token) {
      setToken(token);
    }

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
