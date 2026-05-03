'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';

type TopupResult = {
  status?: number;
  data?: unknown;
  error?: string;
};

export default function RefillPage() {
  const [iccid, setIccid] = useState('');
  const [packageTypeId, setPackageTypeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TopupResult | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/esim/can-topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ iccid, package_type_id: packageTypeId }),
      });
      const data = await res.json();
      setResult(res.ok ? data : { error: data.error || 'Unable to check refill availability' });
    } catch {
      setResult({ error: 'Unable to check refill availability' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-5 py-12 sm:px-6 lg:px-8">
          <Link href="/" className="text-sm font-bold text-[#66748d] transition hover:text-[#ef1b2d]">
            Back to destinations
          </Link>
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_24rem] lg:items-start">
            <div>
              <p className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-[#ef1b2d]">
                Refill your eSIM
              </p>
              <h1 className="text-4xl font-black text-[#102b68] sm:text-5xl">Add more data to an active eSIM</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#53637f]">
                Enter your eSIM ICCID and the package ID you want to add. Go eSim will check whether
                the partner API allows that top-up before you continue.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="rounded-2xl bg-[#102b68] p-6 text-white shadow-xl shadow-[#102b68]/20">
              <label className="grid gap-2 text-sm font-bold">
                eSIM ICCID
                <input
                  value={iccid}
                  onChange={(event) => setIccid(event.target.value)}
                  required
                  placeholder="89XXXXXXXXXXX"
                  className="rounded-lg border border-white/10 bg-white px-4 py-3 text-sm text-[#102b68] outline-none focus:border-[#ef1b2d]"
                />
              </label>

              <label className="mt-4 grid gap-2 text-sm font-bold">
                Package ID
                <input
                  value={packageTypeId}
                  onChange={(event) => setPackageTypeId(event.target.value)}
                  required
                  placeholder="Package UUID"
                  className="rounded-lg border border-white/10 bg-white px-4 py-3 text-sm text-[#102b68] outline-none focus:border-[#ef1b2d]"
                />
              </label>

              {result && (
                <div className="mt-4 rounded-lg border border-white/15 bg-white/10 p-3 text-sm leading-6 text-blue-50">
                  {result.error ? result.error : 'Refill availability response received.'}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full rounded-lg bg-[#ef1b2d] px-5 py-4 text-sm font-black text-white transition hover:bg-[#d91628] disabled:bg-[#66748d]"
              >
                {loading ? 'Checking...' : 'Check refill'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
