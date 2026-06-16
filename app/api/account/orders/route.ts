import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

type OrderRow = {
  id: string;
  package_id: string;
  package_name: string;
  sell_price: number;
  status: string;
  created_at?: string;
};

type PurchaseRow = {
  order_id: string;
  esimcard_package_id?: string | null;
  esimcard_iccid?: string | null;
  esimcard_qr?: string | null;
  esimcard_manual_code?: string | null;
  created_at?: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function findOrCreateCustomer(email: string) {
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

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

    if (!token) {
      return NextResponse.json({ error: 'Authentication is required' }, { status: 401 });
    }

    const { data: authData, error: authError } = await supabase.auth.getUser(token);

    if (authError || !authData.user?.email) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const email = normalizeEmail(authData.user.email);
    const customer = await findOrCreateCustomer(email);

    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id,package_id,package_name,sell_price,status,created_at')
      .eq('user_id', customer.id)
      .order('created_at', { ascending: false });

    if (ordersError) {
      throw new Error(ordersError.message);
    }

    const orderRows = (orders || []) as OrderRow[];
    const orderIds = orderRows.map((order) => order.id);
    let purchaseRows: PurchaseRow[] = [];

    if (orderIds.length > 0) {
      const { data: purchases, error: purchasesError } = await supabase
        .from('esim_purchases')
        .select('order_id,esimcard_package_id,esimcard_iccid,esimcard_qr,esimcard_manual_code,created_at')
        .in('order_id', orderIds);

      if (purchasesError) {
        throw new Error(purchasesError.message);
      }

      purchaseRows = (purchases || []) as PurchaseRow[];
    }

    const purchasesByOrderId = new Map(
      purchaseRows.map((purchase) => [purchase.order_id, purchase])
    );

    return NextResponse.json({
      user: {
        email,
      },
      orders: orderRows.map((order) => ({
        ...order,
        esim_purchase: purchasesByOrderId.get(order.id) || null,
      })),
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}
