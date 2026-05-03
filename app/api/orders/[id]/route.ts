import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 404 });
    }

    const { data: esimPurchase, error: esimError } = await supabase
      .from('esim_purchases')
      .select('*')
      .eq('order_id', id)
      .maybeSingle();

    if (esimError) {
      return NextResponse.json({ error: esimError.message }, { status: 500 });
    }

    return NextResponse.json({
      order,
      esim_purchase: esimPurchase,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}
