import { NextResponse } from 'next/server';
import { getEsimApiUrl, getValidToken } from '@/app/lib/esimClient';

export async function POST(req: Request) {
  try {
    const { iccid, package_type_id } = await req.json();

    if (!iccid || !package_type_id) {
      return NextResponse.json(
        { error: 'iccid and package_type_id are required' },
        { status: 400 }
      );
    }

    const token = await getValidToken();

    const res = await fetch(
      getEsimApiUrl('/can-topup-esim'),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          iccid,
          package_type_id,
        }),
      }
    );

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
