import { NextResponse } from 'next/server';
import { getEsimApiUrl, getValidToken } from '@/app/lib/esimClient';

export async function GET() {
  try {
    const token = await getValidToken();

    const res = await fetch(getEsimApiUrl('/my-esims'), {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    return NextResponse.json(
      {
        status: res.status,
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
