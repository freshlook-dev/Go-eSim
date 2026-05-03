'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';

type LookupResult = {
  status?: number;
  data?: unknown;
  error?: string;
};

export default function CheckBalancePage() {
  const [simId, setSimId] = useState('');
  const [orderId, setOrderId] = useState('');
  const [loadingUsage, setLoadingUsage] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [usageResult, setUsageResult] = useState<LookupResult | null>(null);
  const [orderResult, setOrderResult] = useState<LookupResult | null>(null);

  async function handleUsage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoadingUsage(true);
    setUsageResult(null);

    try {
      const res = await fetch('/api/esim/usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sim_id: simId }),
      });
      const data = await res.json();
      setUsageResult(res.ok ? data : { error: data.error || 'Unable to check usage' });
    } catch {
      setUsageResult({ error: 'Unable to check usage' });
    } finally {
      setLoadingUsage(false);
    }
  }

  async function handleOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoadingOrder(true);
    setOrderResult(null);

    try {
      const res = await fetch(`/api/esim/order/${orderId}`);
      const data = await res.json();
      setOrderResult(res.ok ? data : { error: data.error || 'Unable to find order' });
    } catch {
      setOrderResult({ error: 'Unable to find order' });
    } finally {
      setLoadingOrder(false);
    }
  }

  return (
    <div>
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 lg:px-8">
          <Link href="/" className="text-sm font-bold text-[#66748d] transition hover:text-[#ef1b2d]">
            Back to destinations
          </Link>
          <div className="mt-8">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-[#ef1b2d]">
              Check balance
            </p>
            <h1 className="text-4xl font-black text-[#102b68] sm:text-5xl">Look up usage or order status</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#53637f]">
              Use the eSIM ID for usage details, or the partner order ID to check order status.
            </p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <form onSubmit={handleUsage} className="rounded-2xl border border-[#dbe4ff] bg-[#f6f8ff] p-6 shadow-sm">
              <h2 className="text-xl font-black text-[#102b68]">eSIM usage</h2>
              <label className="mt-5 grid gap-2 text-sm font-bold text-[#102b68]">
                eSIM ID
                <input
                  value={simId}
                  onChange={(event) => setSimId(event.target.value)}
                  required
                  placeholder="Partner sim_id"
                  className="rounded-lg border border-[#dbe4ff] bg-white px-4 py-3 text-sm text-[#102b68] outline-none focus:border-[#ef1b2d]"
                />
              </label>
              {usageResult && (
                <div className="mt-4 rounded-lg border border-[#dbe4ff] bg-white p-3 text-sm leading-6 text-[#53637f]">
                  {usageResult.error ? usageResult.error : 'Usage response received from the partner API.'}
                </div>
              )}
              <button
                type="submit"
                disabled={loadingUsage}
                className="mt-6 rounded-lg bg-[#102b68] px-5 py-3 text-sm font-black text-white transition hover:bg-[#2a6fc5] disabled:bg-[#66748d]"
              >
                {loadingUsage ? 'Checking...' : 'Check usage'}
              </button>
            </form>

            <form onSubmit={handleOrder} className="rounded-2xl border border-[#dbe4ff] bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-[#102b68]">Order status</h2>
              <label className="mt-5 grid gap-2 text-sm font-bold text-[#102b68]">
                Partner order ID
                <input
                  value={orderId}
                  onChange={(event) => setOrderId(event.target.value)}
                  required
                  placeholder="100"
                  className="rounded-lg border border-[#dbe4ff] bg-[#f6f8ff] px-4 py-3 text-sm text-[#102b68] outline-none focus:border-[#ef1b2d]"
                />
              </label>
              {orderResult && (
                <div className="mt-4 rounded-lg border border-[#dbe4ff] bg-[#f6f8ff] p-3 text-sm leading-6 text-[#53637f]">
                  {orderResult.error ? orderResult.error : 'Order response received from the partner API.'}
                </div>
              )}
              <button
                type="submit"
                disabled={loadingOrder}
                className="mt-6 rounded-lg bg-[#ef1b2d] px-5 py-3 text-sm font-black text-white transition hover:bg-[#d91628] disabled:bg-[#66748d]"
              >
                {loadingOrder ? 'Checking...' : 'Check order'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
