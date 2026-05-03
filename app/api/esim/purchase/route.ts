import { NextResponse } from 'next/server';
import { getValidToken } from '@/app/lib/esimClient';

export async function POST(req: Request) {
  try {
    const { imei, package_type_id } = await req.json();

    if (!imei || !package_type_id) {
      return NextResponse.json(
        { error: 'imei and package_type_id are required' },
        { status: 400 }
      );
    }

    const token = await getValidToken();

    const res = await fetch(`${process.env.ESIM_API_BASE_URL}/package/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        imei,
        package_type_id,
      }),
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