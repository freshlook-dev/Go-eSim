import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      user_id,
      package_id,
      package_name,
      sell_price,
      cost_price,
    } = body;

    const profit = sell_price - cost_price;

    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          user_id,
          package_id,
          package_name,
          sell_price,
          cost_price,
          profit,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ order: data });

  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}