import { NextResponse } from 'next/server';
import { getValidToken } from '@/app/lib/esimClient';

export async function POST(req: Request) {
  try {
    const { sim_id } = await req.json();

    if (!sim_id) {
      return NextResponse.json({ error: 'sim_id is required' }, { status: 400 });
    }

    const token = await getValidToken();

    const res = await fetch(`${process.env.ESIM_API_BASE_URL}/my-sim/${sim_id}/usage`, {
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
