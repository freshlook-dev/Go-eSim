import { NextResponse } from 'next/server';
import { setToken } from '@/app/lib/esimAuth';

export async function GET() {
  try {
    const res = await fetch(`${process.env.ESIM_API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: process.env.ESIM_API_EMAIL,
        password: process.env.ESIM_API_PASSWORD,
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