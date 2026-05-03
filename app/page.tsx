'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { calculateSellPrice, formatEuroPrice } from '@/app/lib/pricing';

type Package = {
  id: string;
  name: string;
  price: string | number;
  data_quantity?: string | number;
  data_unit?: string;
  package_validity?: string | number;
  package_validity_unit?: string;
};

type Country = {
  id: string;
  code: string;
  name: string;
  image_url?: string;
  packages?: Package[];
};

const REGIONAL_KEYWORDS = ['africa', 'asia', 'caribbean', 'europe', 'global', 'latin', 'middle east', 'regional', 'world'];

function formatPlan(pkg: Package) {
  return `${pkg.data_quantity ?? '-'} ${pkg.data_unit ?? ''} / ${pkg.package_validity ?? '-'} ${pkg.package_validity_unit ?? ''}`;
}

export default function Home() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'Popular' | 'Local' | 'Regional' | 'Global' | 'All'>('Popular');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/esim/pricing')
      .then((res) => res.json())
      .then((res) => {
        setCountries(res.data?.data?.countries || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const regionalCountries = useMemo(
    () => countries.filter((country) => REGIONAL_KEYWORDS.some((keyword) => country.name.toLowerCase().includes(keyword))),
    [countries]
  );
  const localCountries = useMemo(
    () => countries.filter((country) => !regionalCountries.some((regional) => regional.id === country.id)),
    [countries, regionalCountries]
  );
  const categoryCountries = useMemo(() => {
    if (category === 'Popular') {
      return countries.slice(0, 12);
    }

    if (category === 'Regional') {
      return regionalCountries.length ? regionalCountries : countries.slice(0, 12);
    }

    if (category === 'Global') {
      const globalPlans = countries.filter((country) => country.name.toLowerCase().includes('global'));
      return globalPlans.length ? globalPlans : regionalCountries;
    }

    if (category === 'Local') {
      return localCountries;
    }

    return countries;
  }, [category, countries, localCountries, regionalCountries]);
  const displayedCountries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return categoryCountries.slice(0, category === 'All' || category === 'Local' ? 24 : 12);
    }

    return countries
      .filter((country) => country.name.toLowerCase().includes(normalizedQuery) || country.code.toLowerCase().includes(normalizedQuery))
      .slice(0, 24);
  }, [category, categoryCountries, countries, query]);
  const featuredCountries = useMemo(() => countries.slice(0, 12), [countries]);
  const planCount = useMemo(
    () => countries.reduce((total, country) => total + (country.packages?.length || 0), 0),
    [countries]
  );

  return (
    <div>
      <section className="relative overflow-hidden bg-[#102b68] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(239,27,45,0.28),transparent_28%),radial-gradient(circle_at_86%_12%,rgba(42,111,197,0.34),transparent_32%),linear-gradient(135deg,#3e1f8f_0%,#102b68_48%,#0b4e9d_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#f6f8ff] to-transparent" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <p className="mb-4 text-sm font-black uppercase tracking-[0.22em] text-[#ffb3bb]">
              Travel data made simple
            </p>
            <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Go eSim keeps you connected before the plane doors open.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-blue-100 sm:text-lg">
              Browse flexible eSIM plans by destination, compare data and validity, and get ready for
              instant QR activation.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#destinations"
                className="rounded-lg bg-[#ef1b2d] px-5 py-3 text-center text-sm font-black text-white shadow-lg shadow-red-950/20 transition hover:bg-[#d91628]"
              >
                Explore destinations
              </a>
              <a
                href="#how-it-works"
                className="rounded-lg border border-white/25 bg-white/10 px-5 py-3 text-center text-sm font-black text-white transition hover:bg-white/16"
              >
                See how it works
              </a>
            </div>
          </div>

          <div className="grid content-end gap-4">
            <div className="rounded-2xl border border-white/15 bg-white/12 p-5 shadow-2xl shadow-[#071a42]/30 backdrop-blur">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-100">Available coverage</p>
                  <p className="text-3xl font-black">{countries.length || '--'} countries</p>
                </div>
                <div className="rounded-full bg-[#ef1b2d] px-3 py-1 text-xs font-black text-white">
                  Live plans
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {featuredCountries.slice(0, 6).map((country) => (
                  <div key={country.id} className="rounded-xl bg-white p-3 text-[#102b68] shadow-sm">
                    {country.image_url ? (
                      <img
                        src={country.image_url}
                        alt=""
                        className="mb-3 h-9 w-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="mb-3 h-9 w-9 rounded-full bg-[#dbe4ff]" />
                    )}
                    <p className="truncate text-sm font-bold">{country.name}</p>
                    <p className="text-xs text-[#66748d]">{country.packages?.length || 0} plans</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-white/12 p-4 ring-1 ring-white/10">
                <p className="text-2xl font-black">{planCount || '--'}</p>
                <p className="text-xs text-blue-100">plans</p>
              </div>
              <div className="rounded-xl bg-white/12 p-4 ring-1 ring-white/10">
                <p className="text-2xl font-black text-[#ffb3bb]">QR</p>
                <p className="text-xs text-blue-100">delivery</p>
              </div>
              <div className="rounded-xl bg-white/12 p-4 ring-1 ring-white/10">
                <p className="text-2xl font-black">24/7</p>
                <p className="text-xs text-blue-100">ready</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="destinations" className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-sm font-black uppercase tracking-[0.18em] text-[#ef1b2d]">
              Destinations
            </p>
            <h2 className="text-3xl font-black text-[#102b68] sm:text-4xl">Choose where you are going</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-[#53637f]">
            Pick a country to compare available data packages, validity, and pricing.
          </p>
        </div>

        <div className="mb-8 grid gap-4 rounded-2xl border border-[#dbe4ff] bg-white p-4 shadow-sm md:grid-cols-[1fr_auto] md:items-center">
          <label className="grid gap-2 text-sm font-black text-[#102b68]">
            Your destination
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search country, region, or city"
              className="h-12 rounded-lg border border-[#dbe4ff] bg-[#f6f8ff] px-4 text-sm font-medium text-[#102b68] outline-none transition placeholder:text-[#8a95aa] focus:border-[#ef1b2d]"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            {(['Popular', 'Local', 'Regional', 'Global', 'All'] as const).map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`rounded-lg px-4 py-3 text-sm font-black transition ${
                  category === item
                    ? 'bg-[#102b68] text-white shadow-sm shadow-[#102b68]/15'
                    : 'bg-[#eef3ff] text-[#31507e] hover:bg-[#dbe4ff]'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-56 animate-pulse rounded-xl bg-white shadow-sm ring-1 ring-[#dbe4ff]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {displayedCountries.map((country) => {
              const firstPackage = country.packages?.[0];

              return (
                <button
                  key={country.id}
                  onClick={() => router.push(`/country/${country.code}`)}
                  className="group overflow-hidden rounded-xl bg-white text-left shadow-sm ring-1 ring-[#dbe4ff] transition hover:-translate-y-1 hover:shadow-xl hover:shadow-[#174ea6]/10 hover:ring-[#2a6fc5]"
                >
                  <div className="flex items-start gap-4 p-5">
                    {country.image_url ? (
                      <img
                        src={country.image_url}
                        alt=""
                        className="h-14 w-14 rounded-full object-cover ring-2 ring-[#e6ebff]"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-full bg-[#e6ebff]" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="truncate text-xl font-black text-[#102b68]">{country.name}</h3>
                          <p className="mt-1 text-sm text-[#66748d]">
                            {country.packages?.length || 0} available plans
                          </p>
                        </div>
                        <span className="rounded-full bg-[#eef3ff] px-3 py-1 text-xs font-black text-[#2a6fc5]">
                          {country.code}
                        </span>
                      </div>

                      {firstPackage && (
                        <div className="mt-5 rounded-lg bg-[#f6f8ff] p-4 ring-1 ring-[#e6ebff]">
                          <p className="text-sm font-bold text-[#102b68]">{firstPackage.name}</p>
                          <div className="mt-2 flex items-center justify-between gap-3">
                            <p className="text-sm text-[#53637f]">{formatPlan(firstPackage)}</p>
                            <p className="whitespace-nowrap text-base font-black text-[#ef1b2d]">
                              {formatEuroPrice(calculateSellPrice(firstPackage.price))}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section id="how-it-works" className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="mb-2 text-sm font-black uppercase tracking-[0.18em] text-[#ef1b2d]">
              How it works
            </p>
            <h2 className="text-3xl font-black text-[#102b68]">From plan to connection in minutes</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              ['Choose a destination', 'Compare plans by country, data amount, validity, and price.'],
              ['Buy your plan', 'Your order is prepared securely before the eSIM is issued.'],
              ['Scan and connect', 'Use the QR code or manual activation code on your phone.'],
            ].map(([title, copy], index) => (
              <div key={title} className="rounded-xl border border-[#dbe4ff] bg-[#f6f8ff] p-6 shadow-sm">
                <div className="mb-5 grid h-10 w-10 place-items-center rounded-lg bg-[#ef1b2d] text-sm font-black text-white">
                  {index + 1}
                </div>
                <h3 className="text-lg font-black text-[#102b68]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#53637f]">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
