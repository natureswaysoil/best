create table if not exists public.quickbooks_connections (
  realm_id text primary key,
  access_token_encrypted text not null,
  refresh_token_encrypted text not null,
  access_token_expires_at timestamptz not null,
  refresh_token_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.quickbooks_connections enable row level security;

-- No public RLS policies are intentionally defined. The site accesses this
-- table only through the Supabase service-role client on the server.
