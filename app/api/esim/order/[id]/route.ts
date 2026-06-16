import { NextResponse } from 'next/server';
import { getValidToken } from '@/app/lib/esimClient';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const token = await getValidToken();

    const res = await fetch(`${process.env.ESIM_API_BASE_URL}/order/${id}`, {
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
