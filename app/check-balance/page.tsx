'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';

type LookupResult = {
  status?: number;
  data?: unknown;
  error?: string;
};

function getMessage(result: LookupResult) {
  const data = result.data as { message?: string; error?: string } | undefined;
  return result.error || data?.message || data?.error || null;
}

function getNestedValue(value: unknown, path: string[]) {
  let current = value;

  for (const key of path) {
    if (!current || typeof current !== 'object' || !(key in current)) {
      return null;
    }

    current = (current as Record<string, unknown>)[key];
  }

  return current;
}

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return 'Not provided';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}

function ResultCard({
  title,
  result,
  highlights,
}: {
  title: string;
  result: LookupResult | null;
  highlights: { label: string; path: string[] }[];
}) {
  if (!result) {
    return null;
  }

  const message = getMessage(result);

  return (
    <div className="mt-4 rounded-xl border border-[#dbe4ff] bg-white p-4 text-sm text-[#53637f]">
      <div className="flex items-center justify-between gap-3">
        <p className="font-black text-[#102b68]">{title}</p>
        {result.status && (
          <span className="rounded-full bg-[#f6f8ff] px-3 py-1 text-xs font-black text-[#31507e]">
            HTTP {result.status}
          </span>
        )}
      </div>

      {message && (
        <div className="mt-3 rounded-lg border border-red-100 bg-red-50 p-3 font-bold text-red-700">
          {message}
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {highlights.map((item) => (
          <div key={item.label} className="rounded-lg bg-[#f6f8ff] p-3">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#66748d]">{item.label}</p>
            <p className="mt-1 break-all font-bold text-[#102b68]">
              {formatValue(getNestedValue(result.data, item.path))}
            </p>
          </div>
        ))}
      </div>

      <details className="mt-4">
        <summary className="cursor-pointer font-black text-[#ef1b2d]">Raw response</summary>
        <pre className="mt-3 max-h-80 overflow-auto rounded-lg bg-[#102b68] p-4 text-xs leading-5 text-white">
          {JSON.stringify(result.data ?? result, null, 2)}
        </pre>
      </details>
    </div>
  );
}

export default function CheckBalancePage() {
  const [simId, setSimId] = useState('');
  const [orderId, setOrderId] = useState('');
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [loadingUsage, setLoadingUsage] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [walletResult, setWalletResult] = useState<LookupResult | null>(null);
  const [usageResult, setUsageResult] = useState<LookupResult | null>(null);
  const [orderResult, setOrderResult] = useState<LookupResult | null>(null);

  async function handleWallet() {
    setLoadingWallet(true);
    setWalletResult(null);

    try {
      const res = await fetch('/api/esim/balance');
      const data = await res.json();
      setWalletResult(res.ok ? data : { ...data, error: data.error || 'Unable to check provider balance' });
    } catch {
      setWalletResult({ error: 'Unable to check provider balance' });
    } finally {
      setLoadingWallet(false);
    }
  }

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
            <h1 className="text-4xl font-black text-[#102b68] sm:text-5xl">Look up provider balance, usage, or order status</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#53637f]">
              Use this page to verify the provider connection and inspect eSIM details while payment activation is pending.
            </p>
          </div>

          <div className="mt-8 rounded-2xl border border-[#dbe4ff] bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-black text-[#102b68]">Provider wallet balance</h2>
                <p className="mt-2 text-sm leading-6 text-[#53637f]">
                  Confirms your eSIM provider credentials are working and shows available account credit.
                </p>
              </div>
              <button
                type="button"
                onClick={handleWallet}
                disabled={loadingWallet}
                className="rounded-lg bg-[#102b68] px-5 py-3 text-sm font-black text-white transition hover:bg-[#2a6fc5] disabled:bg-[#66748d]"
              >
                {loadingWallet ? 'Checking...' : 'Check wallet'}
              </button>
            </div>
            <ResultCard
              title="Wallet response"
              result={walletResult}
              highlights={[
                { label: 'Balance', path: ['data', 'balance'] },
                { label: 'Currency', path: ['data', 'currency'] },
              ]}
            />
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
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
              <button
                type="submit"
                disabled={loadingUsage}
                className="mt-6 rounded-lg bg-[#102b68] px-5 py-3 text-sm font-black text-white transition hover:bg-[#2a6fc5] disabled:bg-[#66748d]"
              >
                {loadingUsage ? 'Checking...' : 'Check usage'}
              </button>
              <ResultCard
                title="Usage response"
                result={usageResult}
                highlights={[
                  { label: 'Status', path: ['data', 'status'] },
                  { label: 'Used data', path: ['data', 'used_data'] },
                  { label: 'Remaining data', path: ['data', 'remaining_data'] },
                  { label: 'Expires at', path: ['data', 'expired_at'] },
                ]}
              />
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
              <button
                type="submit"
                disabled={loadingOrder}
                className="mt-6 rounded-lg bg-[#ef1b2d] px-5 py-3 text-sm font-black text-white transition hover:bg-[#d91628] disabled:bg-[#66748d]"
              >
                {loadingOrder ? 'Checking...' : 'Check order'}
              </button>
              <ResultCard
                title="Order response"
                result={orderResult}
                highlights={[
                  { label: 'Order status', path: ['data', 'status'] },
                  { label: 'ICCID', path: ['data', 'iccid'] },
                  { label: 'SIM ID', path: ['data', 'sim_id'] },
                  { label: 'Package ID', path: ['data', 'package_type_id'] },
                ]}
              />
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
