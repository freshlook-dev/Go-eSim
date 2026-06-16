'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';

type TopupResult = {
  status?: number;
  data?: unknown;
  error?: string;
};

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

function getResultMessage(result: TopupResult) {
  const data = result.data as { message?: string; error?: string } | undefined;
  return result.error || data?.message || data?.error || null;
}

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
      setResult(res.ok ? data : { ...data, error: data.error || 'Unable to check refill availability' });
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

              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full rounded-lg bg-[#ef1b2d] px-5 py-4 text-sm font-black text-white transition hover:bg-[#d91628] disabled:bg-[#66748d]"
              >
                {loading ? 'Checking...' : 'Check refill'}
              </button>

              {result && (
                <div className="mt-4 rounded-xl border border-white/15 bg-white/10 p-4 text-sm leading-6 text-blue-50">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black text-white">Provider response</p>
                    {result.status && (
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black">
                        HTTP {result.status}
                      </span>
                    )}
                  </div>

                  {getResultMessage(result) && (
                    <div className="mt-3 rounded-lg bg-red-500/15 p-3 font-bold text-red-100">
                      {getResultMessage(result)}
                    </div>
                  )}

                  <div className="mt-4 grid gap-3">
                    {[
                      ['Can top up', ['data', 'can_topup']],
                      ['Status', ['data', 'status']],
                      ['ICCID', ['data', 'iccid']],
                      ['Package ID', ['data', 'package_type_id']],
                    ].map(([label, path]) => (
                      <div key={label as string} className="rounded-lg bg-white/10 p-3">
                        <p className="text-xs font-black uppercase tracking-[0.12em] text-blue-100">{label as string}</p>
                        <p className="mt-1 break-all font-bold text-white">
                          {formatValue(getNestedValue(result.data, path as string[]))}
                        </p>
                      </div>
                    ))}
                  </div>

                  <details className="mt-4">
                    <summary className="cursor-pointer font-black text-white">Raw response</summary>
                    <pre className="mt-3 max-h-72 overflow-auto rounded-lg bg-[#071b42] p-4 text-xs leading-5 text-white">
                      {JSON.stringify(result.data ?? result, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
