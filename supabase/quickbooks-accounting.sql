-- QuickBooks accounting automation tables for Nature's Way Soil
-- Run in Supabase SQL Editor before enabling QUICKBOOKS_AUTO_POST.

create table if not exists public.quickbooks_sync_log (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  source_id text not null,
  qbo_entity text not null,
  qbo_id text,
  status text not null check (status in ('posted', 'failed')),
  amount numeric(14,2),
  payload jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(source, source_id)
);

create index if not exists quickbooks_sync_log_status_idx
  on public.quickbooks_sync_log(status, updated_at desc);

alter table public.quickbooks_sync_log enable row level security;

-- No public policies. This table is server/service-role only.

create table if not exists public.quickbooks_accounting_settings (
  id integer primary key default 1 check (id = 1),
  chart_version integer not null default 1,
  auto_post_website_sales boolean not null default false,
  auto_post_stripe_fees boolean not null default false,
  auto_post_stripe_payouts boolean not null default false,
  auto_post_amazon_settlements boolean not null default false,
  auto_post_walmart_settlements boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into public.quickbooks_accounting_settings (id)
values (1)
on conflict (id) do nothing;

alter table public.quickbooks_accounting_settings enable row level security;
-- No public policies. Server/service-role only.
