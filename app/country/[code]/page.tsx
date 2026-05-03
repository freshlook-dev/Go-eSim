'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { calculateSellPrice, formatEuroPrice } from '@/app/lib/pricing';

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

type Country = {
  id: string;
  code: string;
  name: string;
  image_url?: string;
  packages: Package[];
};

export default function CountryPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [country, setCountry] = useState<Country | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/esim/pricing')
      .then((res) => res.json())
      .then((res) => {
        const countries = res.data?.data?.countries || [];
        const found = countries.find((item: Country) => item.code === code);
        setCountry(found || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [code]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
        <div className="h-48 animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-[#dbe4ff]" />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-64 animate-pulse rounded-xl bg-white shadow-sm ring-1 ring-[#dbe4ff]" />
          ))}
        </div>
      </div>
    );
  }

  if (!country) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20 text-center">
        <h1 className="text-3xl font-black text-[#102b68]">Country not found</h1>
        <p className="mt-3 text-[#53637f]">This destination is not available in the current plan list.</p>
        <button
          onClick={() => router.push('/')}
          className="mt-8 rounded-lg bg-[#ef1b2d] px-5 py-3 text-sm font-black text-white"
        >
          Back to destinations
        </button>
      </div>
    );
  }

  return (
    <div>
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="mb-8 text-sm font-bold text-[#66748d] transition hover:text-[#ef1b2d]"
          >
            Back to destinations
          </button>

          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <div className="flex items-center gap-5">
              {country.image_url ? (
                <img
                  src={country.image_url}
                  alt=""
                  className="h-20 w-20 rounded-full object-cover ring-4 ring-[#eef3ff]"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-[#eef3ff]" />
              )}
              <div>
                <p className="mb-2 text-sm font-black uppercase tracking-[0.18em] text-[#ef1b2d]">
                  eSIM plans for
                </p>
                <h1 className="text-4xl font-black text-[#102b68] sm:text-5xl">{country.name}</h1>
              </div>
            </div>

            <div className="rounded-xl bg-[#102b68] px-5 py-4 text-white shadow-lg shadow-[#102b68]/15">
              <p className="text-3xl font-black">{country.packages.length}</p>
              <p className="text-sm text-blue-100">plans available</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {country.packages.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => router.push(`/packages/${pkg.id}`)}
              className="group flex h-full flex-col rounded-xl bg-white p-5 text-left shadow-sm ring-1 ring-[#dbe4ff] transition hover:-translate-y-1 hover:shadow-xl hover:shadow-[#174ea6]/10 hover:ring-[#2a6fc5]"
            >
              <div className="flex-1">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <h2 className="text-xl font-black text-[#102b68]">{pkg.name}</h2>
                  <span className="rounded-full bg-[#fff0f2] px-3 py-1 text-xs font-black text-[#ef1b2d]">
                    eSIM
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-[#f6f8ff] p-4 ring-1 ring-[#e6ebff]">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-[#66748d]">Data</p>
                    <p className="mt-1 text-lg font-black text-[#102b68]">
                      {pkg.data_quantity} {pkg.data_unit}
                    </p>
                  </div>
                  <div className="rounded-lg bg-[#f6f8ff] p-4 ring-1 ring-[#e6ebff]">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-[#66748d]">Validity</p>
                    <p className="mt-1 text-lg font-black text-[#102b68]">
                      {pkg.package_validity} {pkg.package_validity_unit}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between gap-4 border-t border-[#dbe4ff] pt-5">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-[#66748d]">From</p>
                  <p className="text-2xl font-black text-[#ef1b2d]">{formatEuroPrice(calculateSellPrice(pkg.price))}</p>
                </div>
                <span className="rounded-lg bg-[#102b68] px-4 py-3 text-sm font-black text-white transition group-hover:bg-[#ef1b2d]">
                  View details
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
