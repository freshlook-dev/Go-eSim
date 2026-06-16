import { NextResponse } from 'next/server';
import { getEsimApiUrl, getValidToken } from '@/app/lib/esimClient';
import { supabase } from '@/app/lib/supabase';

type CheckoutRequest = {
  email?: string;
  imei?: string;
  package_id?: string;
  package_name?: string;
  sell_price?: number;
  cost_price?: number;
};

type ProviderPurchaseData = {
  status?: boolean;
  data?: {
    id?: string;
    iccid?: string;
    sim_id?: string;
    order_id?: string | number;
    universal_link?: string;
    qr_code?: string;
    qrcode?: string;
    manual_code?: string;
    activation_code?: string;
    status?: string;
  };
  message?: string;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Server error';
}

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

async function updateOrderStatus(orderId: string, status: 'completed' | 'failed') {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function POST(req: Request) {
  let orderId: string | null = null;

  try {
    const body = (await req.json()) as CheckoutRequest;
    const email = body.email ? normalizeEmail(body.email) : '';
    const imei = body.imei?.trim();
    const packageId = body.package_id?.trim();
    const packageName = body.package_name?.trim();
    const sellPrice = Number(body.sell_price);
    const costPrice = Number(body.cost_price);

    if (!email || !imei || !packageId || !packageName) {
      return NextResponse.json(
        { error: 'email, imei, package_id, and package_name are required' },
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
    const profit = sellPrice - costPrice;

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
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (orderError) {
      throw new Error(orderError.message);
    }

    const createdOrderId = order.id as string;
    orderId = createdOrderId;

    const token = await getValidToken();
    const providerRes = await fetch(getEsimApiUrl('/package/purchase'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        imei,
        package_type_id: packageId,
      }),
    });

    const providerData = (await providerRes.json()) as ProviderPurchaseData;
    const providerSuccess = providerRes.ok && providerData.status !== false;
    const purchaseData = providerData.data || {};

    if (!providerSuccess) {
      await updateOrderStatus(createdOrderId, 'failed');

      return NextResponse.json(
        {
          error: providerData.message || 'Partner API purchase failed',
          order,
          provider: providerData,
        },
        { status: providerRes.status || 502 }
      );
    }

    const qrValue = purchaseData.qr_code || purchaseData.qrcode || purchaseData.universal_link || null;
    const manualCode = purchaseData.manual_code || purchaseData.activation_code || null;
    const iccid = purchaseData.iccid || null;
    const providerPackageId = purchaseData.id || purchaseData.sim_id || packageId;

    const { data: esimPurchase, error: esimPurchaseError } = await supabase
      .from('esim_purchases')
      .insert([
        {
          order_id: createdOrderId,
          esimcard_package_id: providerPackageId,
          esimcard_iccid: iccid,
          esimcard_qr: qrValue,
          esimcard_manual_code: manualCode,
        },
      ])
      .select()
      .single();

    if (esimPurchaseError) {
      await updateOrderStatus(createdOrderId, 'failed');
      throw new Error(esimPurchaseError.message);
    }

    await updateOrderStatus(createdOrderId, 'completed');

    return NextResponse.json({
      order: { ...order, status: 'completed' },
      esim_purchase: esimPurchase,
      provider: providerData,
    });
  } catch (error: unknown) {
    if (orderId) {
      await supabase.from('orders').update({ status: 'failed' }).eq('id', orderId);
    }

    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
