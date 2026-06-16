'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { calculateSellPrice, formatEuroPrice, toPriceNumber } from '@/app/lib/pricing';
import { supabase } from '@/app/lib/supabase';

type Package = {
  id: string;
  name: string;
  price: string | number;
  data_quantity?: string | number;
  data_unit?: string;
  package_validity?: string | number;
  package_validity_unit?: string;
  voice_quantity?: string | number;
  voice_unit?: string;
  sms_quantity?: string | number;
};

type CheckoutResult = {
  order?: {
    id: string;
    status: string;
  };
  error?: string;
};

export default function PackagePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [pkg, setPkg] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  useEffect(() => {
    fetch(`/api/esim/package/${id}`)
      .then((res) => res.json())
      .then((res) => {
        const packageData = res?.data?.data?.data || res?.data?.data || null;
        setPkg(packageData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setEmail(data.user.email);
      }
    });
  }, []);

  const handleBuy = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!pkg) {
      return;
    }

    setSubmitting(true);
    setCheckoutError('');

    try {
      const costPrice = toPriceNumber(pkg.price);
      const sellPrice = calculateSellPrice(pkg.price);
      const res = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          package_id: pkg.id,
          package_name: pkg.name,
          sell_price: sellPrice,
          cost_price: costPrice,
        }),
      });

      const data = (await res.json()) as CheckoutResult;

      if (!res.ok) {
        setCheckoutError(data.error || 'Checkout failed');
        return;
      }

      if (data.order?.id) {
        router.push(`/orders/${data.order.id}`);
      }
    } catch (err) {
      console.error(err);
      setCheckoutError('Something went wrong while creating your order.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
        <div className="h-[28rem] animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-[#dbe4ff]" />
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20 text-center">
        <h1 className="text-3xl font-black text-[#102b68]">Package not found</h1>
        <p className="mt-3 text-[#53637f]">This plan may no longer be available.</p>
        <button
          onClick={() => router.push('/')}
          className="mt-8 rounded-lg bg-[#ef1b2d] px-5 py-3 text-sm font-black text-white"
        >
          Back to destinations
        </button>
      </div>
    );
  }

  const features = [
    ['Data', `${pkg.data_quantity ?? '-'} ${pkg.data_unit ?? ''}`],
    ['Validity', `${pkg.package_validity ?? '-'} ${pkg.package_validity_unit ?? ''}`],
    ['Voice', `${pkg.voice_quantity ?? 'Not included'} ${pkg.voice_unit ?? ''}`],
    ['SMS', `${pkg.sms_quantity ?? 'Not included'}`],
  ];
  const sellPrice = calculateSellPrice(pkg.price);

  return (
    <div>
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="mb-8 text-sm font-bold text-[#66748d] transition hover:text-[#ef1b2d]"
          >
            Back to plans
          </button>

          <div className="grid gap-8 lg:grid-cols-[1fr_24rem] lg:items-start">
            <div className="rounded-2xl border border-[#dbe4ff] bg-[#f6f8ff] p-6 shadow-sm sm:p-8">
              <p className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-[#ef1b2d]">
                Go eSim travel plan
              </p>
              <h1 className="max-w-3xl text-4xl font-black text-[#102b68] sm:text-5xl">{pkg.name}</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#53637f]">
                A digital eSIM plan you can install with a QR code after purchase. No physical SIM,
                no roaming guessing, no airport kiosk detour.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {features.map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-[#dbe4ff]">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-[#66748d]">{label}</p>
                    <p className="mt-2 text-2xl font-black text-[#102b68]">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <aside className="rounded-2xl bg-[#102b68] p-6 text-white shadow-xl shadow-[#102b68]/20">
              <p className="text-sm text-blue-100">Plan price</p>
              <div className="mt-2 text-4xl font-black">{formatEuroPrice(sellPrice)}</div>
              <p className="mt-1 text-xs font-bold text-blue-100/80">Payment step will be connected to your bank API</p>
              <div className="mt-6 grid gap-3 text-sm text-blue-100">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span>Delivery</span>
                  <span className="font-semibold text-white">Instant QR</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span>Activation</span>
                  <span className="font-semibold text-white">Manual or QR</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Support</span>
                  <span className="font-semibold text-white">Ready after order</span>
                </div>
              </div>

              <form onSubmit={handleBuy} className="mt-8 grid gap-4">
                <label className="grid gap-2 text-sm font-semibold text-white">
                  Email address
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    placeholder="you@example.com"
                    className="rounded-lg border border-white/10 bg-white px-4 py-3 text-sm text-[#102b68] outline-none transition placeholder:text-[#8a95aa] focus:border-[#ef1b2d]"
                  />
                </label>

                {checkoutError && (
                  <div className="rounded-lg border border-red-300/30 bg-red-500/10 p-3 text-sm leading-6 text-red-100">
                    {checkoutError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-[#ef1b2d] px-5 py-4 text-sm font-black text-white transition hover:bg-[#d91628] disabled:cursor-not-allowed disabled:bg-[#66748d] disabled:text-slate-200"
                >
                  {submitting ? 'Creating order...' : 'Continue to payment'}
                </button>
              </form>
              <p className="mt-4 text-center text-xs leading-5 text-blue-100/80">
                This creates a pending order only. Your eSIM will be issued after bank payment confirmation.
              </p>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            ['Before you travel', 'Install the eSIM while you still have Wi-Fi, then activate it when ready.'],
            ['Keep your number', 'Use your physical SIM for calls while this eSIM handles travel data.'],
            ['Simple delivery', 'Your QR code and manual activation details are stored with your order.'],
          ].map(([title, copy]) => (
            <div key={title} className="rounded-xl border border-[#dbe4ff] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-black text-[#102b68]">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#53637f]">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="mb-2 text-sm font-black uppercase tracking-[0.18em] text-[#ef1b2d]">
              More information
            </p>
            <h2 className="text-3xl font-black text-[#102b68]">Travel with everything ready</h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-[#dbe4ff] bg-[#f6f8ff] p-6">
              <h3 className="text-xl font-black text-[#102b68]">Check your device first</h3>
              <p className="mt-3 text-sm leading-6 text-[#53637f]">
                Your phone must support eSIM and be carrier-unlocked. Install the eSIM while you still
                have Wi-Fi, then activate mobile data when you arrive.
              </p>
            </div>

            <div className="rounded-2xl border border-[#dbe4ff] bg-[#f6f8ff] p-6">
              <h3 className="text-xl font-black text-[#102b68]">No roaming surprises</h3>
              <p className="mt-3 text-sm leading-6 text-[#53637f]">
                This is prepaid travel data, so the plan you choose is the plan you pay for. Keep your
                physical SIM active for calls while Go eSim handles your travel internet.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-[#102b68] p-6 text-white">
            <div className="grid gap-5 md:grid-cols-3">
              {[
                ['Secure checkout', 'Payment integration can sit before final eSIM issuing.'],
                ['Fast delivery', 'Activation details are stored with your order after purchase.'],
                ['Support ready', 'If activation fails, order status helps us track the partner response.'],
              ].map(([title, copy]) => (
                <div key={title}>
                  <h3 className="font-black">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-blue-100">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="mb-2 text-sm font-black uppercase tracking-[0.18em] text-[#ef1b2d]">FAQ</p>
          <h2 className="text-3xl font-black text-[#102b68]">Frequently asked questions</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['Can I keep my number?', 'Yes. Your regular SIM can stay active for calls and messages while the eSIM provides travel data.'],
            ['When should I install it?', 'Install before you travel while connected to Wi-Fi. Activate mobile data when you reach your destination.'],
            ['Can I use hotspot?', 'Hotspot availability depends on the plan and local network rules. Check your package details before travel.'],
          ].map(([question, answer]) => (
            <div key={question} className="rounded-xl border border-[#dbe4ff] bg-white p-5 shadow-sm">
              <h3 className="font-black text-[#102b68]">{question}</h3>
              <p className="mt-2 text-sm leading-6 text-[#53637f]">{answer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
