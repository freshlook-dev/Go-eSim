'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';

type AuthMode = 'login' | 'signup';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace('/account');
      }
    });
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
        });

        if (signUpError) {
          setError(signUpError.message);
          return;
        }

        if (data.session) {
          router.push('/account');
          return;
        }

        setMessage('Check your email to confirm your account, then sign in.');
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      router.push('/account');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:px-6 lg:grid-cols-[1fr_26rem] lg:px-8">
        <div>
          <Link href="/" className="text-sm font-bold text-[#66748d] transition hover:text-[#ef1b2d]">
            Back to destinations
          </Link>
          <p className="mt-8 mb-3 text-sm font-black uppercase tracking-[0.18em] text-[#ef1b2d]">
            Customer area
          </p>
          <h1 className="max-w-3xl text-4xl font-black text-[#102b68] sm:text-5xl">
            Manage your Go eSim orders
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#53637f]">
            Sign in to see your orders, eSIM activation details, ICCIDs, and package status in one place.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ['Orders', 'See every plan created with your email.'],
              ['Activation', 'Open saved QR links and manual codes.'],
              ['Support', 'Use order numbers and ICCIDs when you need help.'],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-xl border border-[#dbe4ff] bg-[#f6f8ff] p-5">
                <h2 className="font-black text-[#102b68]">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#53637f]">{copy}</p>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl bg-[#102b68] p-6 text-white shadow-xl shadow-[#102b68]/20">
          <div className="grid grid-cols-2 rounded-lg bg-white/10 p-1">
            {(['login', 'signup'] as AuthMode[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setMode(item);
                  setError('');
                  setMessage('');
                }}
                className={`rounded-md px-4 py-2 text-sm font-black transition ${
                  mode === item ? 'bg-white text-[#102b68]' : 'text-blue-100 hover:text-white'
                }`}
              >
                {item === 'login' ? 'Log in' : 'Sign up'}
              </button>
            ))}
          </div>

          <label className="mt-6 grid gap-2 text-sm font-bold">
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="you@example.com"
              className="rounded-lg border border-white/10 bg-white px-4 py-3 text-sm text-[#102b68] outline-none focus:border-[#ef1b2d]"
            />
          </label>

          <label className="mt-4 grid gap-2 text-sm font-bold">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              placeholder="At least 6 characters"
              className="rounded-lg border border-white/10 bg-white px-4 py-3 text-sm text-[#102b68] outline-none focus:border-[#ef1b2d]"
            />
          </label>

          {error && (
            <div className="mt-4 rounded-lg border border-red-300/30 bg-red-500/10 p-3 text-sm font-bold leading-6 text-red-100">
              {error}
            </div>
          )}

          {message && (
            <div className="mt-4 rounded-lg border border-emerald-300/30 bg-emerald-500/10 p-3 text-sm font-bold leading-6 text-emerald-100">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-[#ef1b2d] px-5 py-4 text-sm font-black text-white transition hover:bg-[#d91628] disabled:cursor-not-allowed disabled:bg-[#66748d]"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>
      </div>
    </section>
  );
}
