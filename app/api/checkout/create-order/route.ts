import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

type CreateOrderRequest = {
  email?: string;
  package_id?: string;
  package_name?: string;
  sell_price?: number;
  cost_price?: number;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function findOrCreateUser(email: string) {
  const { data: existingUser, error: selectError } = await supabase
    .from('users')
    .select('id,email')
    .eq('email', email)
    .maybeSingle();

  if (selectError) {
    throw new Error(selectError.message);
  }

  if (existingUser) {
    return existingUser;
  }

  const { data: createdUser, error: insertError } = await supabase
    .from('users')
    .insert([{ email }])
    .select('id,email')
    .single();

  if (insertError) {
    throw new Error(insertError.message);
  }

  return createdUser;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateOrderRequest;
    const email = body.email ? normalizeEmail(body.email) : '';
    const packageId = body.package_id?.trim();
    const packageName = body.package_name?.trim();
    const sellPrice = Number(body.sell_price);
    const costPrice = Number(body.cost_price);

    if (!email || !packageId || !packageName) {
      return NextResponse.json(
        { error: 'email, package_id, and package_name are required' },
        { status: 400 }
      );
    }

    if (!Number.isFinite(sellPrice) || !Number.isFinite(costPrice)) {
      return NextResponse.json(
        { error: 'sell_price and cost_price must be valid numbers' },
        { status: 400 }
      );
    }

    const user = await findOrCreateUser(email);
    const profit = Number((sellPrice - costPrice).toFixed(2));

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          user_id: user.id,
          package_id: packageId,
          package_name: packageName,
          sell_price: sellPrice,
          cost_price: costPrice,
          profit,
          status: 'pending_payment',
        },
      ])
      .select()
      .single();

    if (orderError) {
      throw new Error(orderError.message);
    }

    return NextResponse.json({ order, user });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}
