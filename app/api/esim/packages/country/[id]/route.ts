import { NextResponse } from 'next/server';
import { getValidToken } from '@/app/lib/esimClient';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const token = await getValidToken();

    const url = `${process.env.ESIM_API_BASE_URL}/packages/country/${id}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    return NextResponse.json({
      calledUrl: url,
      countryIdUsed: id,
      status: res.status,
      data,
    });
  } catch (error: unknown) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Server error',
    });
  }
}