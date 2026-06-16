-- Go eSim database bootstrap for Supabase.
-- Run this in Supabase Dashboard > SQL Editor on a new or emptied project.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_email_unique unique (email),
  constraint users_email_not_blank check (length(trim(email)) > 0)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete restrict,
  package_id text not null,
  package_name text not null,
  sell_price numeric(12, 2) not null,
  cost_price numeric(12, 2) not null,
  profit numeric(12, 2) not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_package_id_not_blank check (length(trim(package_id)) > 0),
  constraint orders_package_name_not_blank check (length(trim(package_name)) > 0),
  constraint orders_status_valid check (
    status in ('pending', 'pending_payment', 'paid', 'completed', 'failed', 'cancelled')
  )
);

create table if not exists public.esim_purchases (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  esimcard_package_id text not null,
  esimcard_iccid text,
  esimcard_qr text,
  esimcard_manual_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint esim_purchases_order_id_unique unique (order_id),
  constraint esim_purchases_package_id_not_blank check (length(trim(esimcard_package_id)) > 0)
);

create index if not exists users_email_idx on public.users (email);
create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists esim_purchases_order_id_idx on public.esim_purchases (order_id);

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

drop trigger if exists set_esim_purchases_updated_at on public.esim_purchases;
create trigger set_esim_purchases_updated_at
before update on public.esim_purchases
for each row execute function public.set_updated_at();

-- This app currently accesses Supabase from Next.js route handlers using the anon key.
-- Keep RLS disabled unless you also switch the server code to a service role key
-- or add policies that match your auth model.
alter table public.users disable row level security;
alter table public.orders disable row level security;
alter table public.esim_purchases disable row level security;
