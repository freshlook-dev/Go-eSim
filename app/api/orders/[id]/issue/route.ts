import { NextResponse } from 'next/server';
import { getEsimApiUrl, getValidToken } from '@/app/lib/esimClient';
import { supabase } from '@/app/lib/supabase';

type ProviderPurchaseData = {
  status?: boolean;
  data?: {
    id?: string;
    iccid?: string;
    sim_id?: string;
    universal_link?: string;
    qr_code?: string;
    qrcode?: string;
    manual_code?: string;
    activation_code?: string;
    message?: string;
    sim?: {
      id?: string;
      iccid?: string;
      status?: string;
      universal_link?: string;
      qr_code?: string;
      qrcode?: string;
      manual_code?: string;
      activation_code?: string;
    };
  };
  message?: string;
};

async function updateOrderStatus(orderId: string, status: 'paid' | 'completed' | 'failed') {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { imei } = await req.json();

    if (!imei) {
      return NextResponse.json({ error: 'imei is required' }, { status: 400 });
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 404 });
    }

    const { data: existingPurchase } = await supabase
      .from('esim_purchases')
      .select('*')
      .eq('order_id', id)
      .maybeSingle();

    if (existingPurchase) {
      return NextResponse.json({
        order: { ...order, status: 'completed' },
        esim_purchase: existingPurchase,
        already_issued: true,
      });
    }

    await updateOrderStatus(id, 'paid');

    const token = await getValidToken();
    const providerRes = await fetch(getEsimApiUrl('/package/purchase'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        imei,
        package_type_id: order.package_id,
      }),
    });

    const providerData = (await providerRes.json()) as ProviderPurchaseData;
    const providerSuccess = providerRes.ok && providerData.status !== false;
    const purchaseData = providerData.data || {};

    if (!providerSuccess) {
      await updateOrderStatus(id, 'failed');

      return NextResponse.json(
        {
          error: providerData.message || 'Partner API purchase failed',
          provider: providerData,
        },
        { status: providerRes.status || 502 }
      );
    }

    const sim = purchaseData.sim || {};
    const qrValue = sim.qr_code || sim.qrcode || sim.universal_link || purchaseData.qr_code || purchaseData.qrcode || purchaseData.universal_link || null;
    const manualCode = sim.manual_code || sim.activation_code || purchaseData.manual_code || purchaseData.activation_code || null;
    const iccid = sim.iccid || purchaseData.iccid || null;
    const providerPackageId = sim.id || purchaseData.sim_id || purchaseData.id || order.package_id;

    const { data: esimPurchase, error: esimPurchaseError } = await supabase
      .from('esim_purchases')
      .insert([
        {
          order_id: id,
          esimcard_package_id: providerPackageId,
          esimcard_iccid: iccid,
          esimcard_qr: qrValue,
          esimcard_manual_code: manualCode,
        },
      ])
      .select()
      .single();

    if (esimPurchaseError) {
      await updateOrderStatus(id, 'failed');
      throw new Error(esimPurchaseError.message);
    }

    await updateOrderStatus(id, 'completed');

    return NextResponse.json({
      order: { ...order, status: 'completed' },
      esim_purchase: esimPurchase,
      provider: providerData,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}
