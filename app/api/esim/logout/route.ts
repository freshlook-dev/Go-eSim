import { NextResponse } from 'next/server';
import { getEsimApiUrl } from '@/app/lib/esimClient';
import { getToken, clearToken } from '@/app/lib/esimAuth';

export async function GET() {
  try {
    const token = getToken();

    if (!token) {
      return NextResponse.json({ error: 'No token found' }, { status: 401 });
    }

    const res = await fetch(getEsimApiUrl('/logout'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    // clear local token
    clearToken();

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
