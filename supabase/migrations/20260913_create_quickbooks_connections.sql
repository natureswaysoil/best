create table if not exists public.quickbooks_connections (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'quickbooks_online' check (provider = 'quickbooks_online'),
  realm_id text not null unique,
  company_name text,
  access_token_encrypted text not null,
  refresh_token_encrypted text not null,
  access_token_expires_at timestamptz not null,
  refresh_token_expires_at timestamptz,
  scope text,
  token_type text,
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.quickbooks_connections enable row level security;
revoke all on table public.quickbooks_connections from anon, authenticated;

create index if not exists quickbooks_connections_updated_at_idx
  on public.quickbooks_connections(updated_at desc);
