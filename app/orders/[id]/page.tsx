'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { formatEuroPrice } from '@/app/lib/pricing';

type Order = {
  id: string;
  package_id: string;
  package_name: string;
  sell_price: number;
  status: string;
  created_at?: string;
};

type EsimPurchase = {
  esimcard_iccid?: string | null;
  esimcard_qr?: string | null;
  esimcard_manual_code?: string | null;
};

type OrderResponse = {
  order?: Order;
  esim_purchase?: EsimPurchase | null;
  error?: string;
};

function getStatusCopy(status: string) {
  if (status === 'completed') {
    return {
      title: 'Your eSIM is ready',
      copy: 'Your activation details are available below.',
    };
  }

  if (status === 'failed') {
    return {
      title: 'Order needs attention',
      copy: 'The eSIM could not be issued automatically. Please contact support with this order number.',
    };
  }

  return {
    title: 'Awaiting payment confirmation',
    copy: 'Your order is saved. Once the bank payment API confirms payment, Go eSim will issue your eSIM automatically.',
  };
}

export default function OrderStatusPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((res) => res.json())
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => {
        setData({ error: 'Unable to load order' });
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-14 sm:px-6 lg:px-8">
        <div className="h-80 animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-[#dbe4ff]" />
      </div>
    );
  }

  if (!data?.order) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20 text-center">
        <h1 className="text-3xl font-black text-[#102b68]">Order not found</h1>
        <p className="mt-3 text-[#53637f]">{data?.error || 'We could not find that order.'}</p>
        <Link href="/" className="mt-8 inline-block rounded-lg bg-[#ef1b2d] px-5 py-3 text-sm font-black text-white">
          Back to destinations
        </Link>
      </div>
    );
  }

  const status = getStatusCopy(data.order.status);

  return (
    <div>
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-5 py-12 sm:px-6 lg:px-8">
          <Link href="/" className="text-sm font-bold text-[#66748d] transition hover:text-[#ef1b2d]">
            Back to destinations
          </Link>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_22rem]">
            <div className="rounded-2xl border border-[#dbe4ff] bg-[#f6f8ff] p-6 shadow-sm sm:p-8">
              <p className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-[#ef1b2d]">
                Order status
              </p>
              <h1 className="text-4xl font-black text-[#102b68]">{status.title}</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#53637f]">{status.copy}</p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-white p-5 ring-1 ring-[#dbe4ff]">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-[#66748d]">Package</p>
                  <p className="mt-2 text-lg font-black text-[#102b68]">{data.order.package_name}</p>
                </div>
                <div className="rounded-xl bg-white p-5 ring-1 ring-[#dbe4ff]">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-[#66748d]">Total</p>
                  <p className="mt-2 text-lg font-black text-[#ef1b2d]">{formatEuroPrice(data.order.sell_price)}</p>
                </div>
              </div>
            </div>

            <aside className="rounded-2xl bg-[#102b68] p-6 text-white shadow-xl shadow-[#102b68]/20">
              <p className="text-sm text-blue-100">Order number</p>
              <p className="mt-2 break-all text-xl font-black">{data.order.id}</p>
              <div className="mt-6 rounded-lg bg-white/10 p-4">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-blue-100">Status</p>
                <p className="mt-2 text-lg font-black">{data.order.status.replaceAll('_', ' ')}</p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {data.esim_purchase && (
        <section className="mx-auto max-w-5xl px-5 py-12 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-[#dbe4ff] bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-[#102b68]">Activation details</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-[#f6f8ff] p-4">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#66748d]">ICCID</p>
                <p className="mt-2 break-all text-sm font-bold text-[#102b68]">
                  {data.esim_purchase.esimcard_iccid || 'Not provided'}
                </p>
              </div>
              <div className="rounded-xl bg-[#f6f8ff] p-4">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#66748d]">Manual code</p>
                <p className="mt-2 break-all text-sm font-bold text-[#102b68]">
                  {data.esim_purchase.esimcard_manual_code || 'Not provided'}
                </p>
              </div>
              <div className="rounded-xl bg-[#f6f8ff] p-4">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#66748d]">Activation link</p>
                {data.esim_purchase.esimcard_qr ? (
                  <a
                    href={data.esim_purchase.esimcard_qr}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-sm font-black text-[#ef1b2d] underline"
                  >
                    Open link
                  </a>
                ) : (
                  <p className="mt-2 text-sm font-bold text-[#102b68]">Not provided</p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
