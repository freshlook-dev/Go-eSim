'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import { formatEuroPrice } from '@/app/lib/pricing';

type EsimPurchase = {
  esimcard_package_id?: string | null;
  esimcard_iccid?: string | null;
  esimcard_qr?: string | null;
  esimcard_manual_code?: string | null;
  created_at?: string;
};

type AccountOrder = {
  id: string;
  package_id: string;
  package_name: string;
  sell_price: number;
  status: string;
  created_at?: string;
  esim_purchase?: EsimPurchase | null;
};

type AccountResponse = {
  user?: {
    email: string;
  };
  orders?: AccountOrder[];
  error?: string;
};

function formatDate(value?: string) {
  if (!value) {
    return 'Not provided';
  }

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getStatusClass(status: string) {
  if (status === 'completed') {
    return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
  }

  if (status === 'failed') {
    return 'bg-red-50 text-red-700 ring-red-100';
  }

  return 'bg-[#f6f8ff] text-[#31507e] ring-[#dbe4ff]';
}

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [email, setEmail] = useState('');
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [error, setError] = useState('');

  const loadAccount = useCallback(async () => {
    setError('');
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;
    const token = session?.access_token;

    if (!token) {
      router.replace('/auth');
      return;
    }

    const res = await fetch('/api/account/orders', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = (await res.json()) as AccountResponse;

    if (!res.ok) {
      setError(data.error || 'Unable to load account');
      setOrders([]);
      return;
    }

    setEmail(data.user?.email || session?.user.email || '');
    setOrders(data.orders || []);
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      await loadAccount();

      if (!cancelled) {
        setLoading(false);
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [loadAccount]);

  async function handleRefresh() {
    setRefreshing(true);
    await loadAccount();
    setRefreshing(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/auth');
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 lg:px-8">
        <div className="h-96 animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-[#dbe4ff]" />
      </div>
    );
  }

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div>
            <Link href="/" className="text-sm font-bold text-[#66748d] transition hover:text-[#ef1b2d]">
              Back to destinations
            </Link>
            <p className="mt-8 mb-3 text-sm font-black uppercase tracking-[0.18em] text-[#ef1b2d]">
              My account
            </p>
            <h1 className="text-4xl font-black text-[#102b68] sm:text-5xl">Your eSIMs and orders</h1>
            <p className="mt-4 text-base leading-7 text-[#53637f]">{email}</p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="rounded-lg bg-[#102b68] px-4 py-3 text-sm font-black text-white transition hover:bg-[#2a6fc5] disabled:bg-[#66748d]"
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-lg border border-[#dbe4ff] bg-white px-4 py-3 text-sm font-black text-[#102b68] transition hover:border-[#ef1b2d] hover:text-[#ef1b2d]"
            >
              Sign out
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-8 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        {!error && orders.length === 0 && (
          <div className="mt-8 rounded-2xl border border-[#dbe4ff] bg-[#f6f8ff] p-8 text-center">
            <h2 className="text-2xl font-black text-[#102b68]">No orders yet</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#53637f]">
              Orders created with this email address will appear here with activation details after issuing.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-lg bg-[#ef1b2d] px-5 py-3 text-sm font-black text-white"
            >
              Browse plans
            </Link>
          </div>
        )}

        <div className="mt-8 grid gap-5">
          {orders.map((order) => (
            <article key={order.id} className="rounded-2xl border border-[#dbe4ff] bg-[#f6f8ff] p-5 shadow-sm">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-black text-[#102b68]">{order.package_name}</h2>
                    <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${getStatusClass(order.status)}`}>
                      {order.status.replaceAll('_', ' ')}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[#53637f]">Created {formatDate(order.created_at)}</p>
                </div>
                <div className="text-left lg:text-right">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-[#66748d]">Total</p>
                  <p className="mt-1 text-2xl font-black text-[#ef1b2d]">{formatEuroPrice(order.sell_price)}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <div className="rounded-xl bg-white p-4 ring-1 ring-[#dbe4ff]">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-[#66748d]">Order number</p>
                  <p className="mt-2 break-all text-sm font-bold text-[#102b68]">{order.id}</p>
                </div>
                <div className="rounded-xl bg-white p-4 ring-1 ring-[#dbe4ff]">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-[#66748d]">Provider eSIM UUID</p>
                  <p className="mt-2 break-all text-sm font-bold text-[#102b68]">
                    {order.esim_purchase?.esimcard_package_id || 'Not issued yet'}
                  </p>
                </div>
                <div className="rounded-xl bg-white p-4 ring-1 ring-[#dbe4ff]">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-[#66748d]">ICCID</p>
                  <p className="mt-2 break-all text-sm font-bold text-[#102b68]">
                    {order.esim_purchase?.esimcard_iccid || 'Not issued yet'}
                  </p>
                </div>
              </div>

              {order.esim_purchase && (
                <div className="mt-4 rounded-xl bg-white p-4 ring-1 ring-[#dbe4ff]">
                  <h3 className="text-sm font-black text-[#102b68]">Activation details</h3>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#66748d]">Manual code</p>
                      <p className="mt-2 break-all text-sm font-bold text-[#102b68]">
                        {order.esim_purchase.esimcard_manual_code || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#66748d]">Activation link</p>
                      {order.esim_purchase.esimcard_qr ? (
                        <a
                          href={order.esim_purchase.esimcard_qr}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-block text-sm font-black text-[#ef1b2d] underline"
                        >
                          Open activation link
                        </a>
                      ) : (
                        <p className="mt-2 text-sm font-bold text-[#102b68]">Not provided</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/orders/${order.id}`}
                  className="rounded-lg bg-[#102b68] px-4 py-3 text-sm font-black text-white transition hover:bg-[#2a6fc5]"
                >
                  View order
                </Link>
                <Link
                  href="/check-balance"
                  className="rounded-lg border border-[#dbe4ff] bg-white px-4 py-3 text-sm font-black text-[#102b68] transition hover:border-[#ef1b2d] hover:text-[#ef1b2d]"
                >
                  Check usage
                </Link>
                <Link
                  href="/refill"
                  className="rounded-lg border border-[#dbe4ff] bg-white px-4 py-3 text-sm font-black text-[#102b68] transition hover:border-[#ef1b2d] hover:text-[#ef1b2d]"
                >
                  Refill
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
