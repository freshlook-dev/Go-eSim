import { NextResponse } from 'next/server';
import { getValidToken } from '@/app/lib/esimClient';

export async function GET() {
  try {
    const token = await getValidToken();

    const res = await fetch(`${process.env.ESIM_API_BASE_URL}/balance`, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${token}`,
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
