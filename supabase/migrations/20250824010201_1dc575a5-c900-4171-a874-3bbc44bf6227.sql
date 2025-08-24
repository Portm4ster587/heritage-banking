-- ENUMS
create type public.app_role as enum ('admin', 'moderator', 'user');
create type public.account_type as enum ('personal_checking','personal_savings','business_checking','business_savings');
create type public.account_status as enum ('pending','active','suspended','closed','kyc_pending');
create type public.card_status as enum ('pending','approved','shipped','active','blocked','cancelled');
create type public.transfer_status as enum ('pending','processing','paused','requires_token','completed','failed','cancelled');
create type public.currency as enum ('USD','EUR','GBP','JPY','CAD','AUD','USDT');
create type public.kyc_status as enum ('pending','approved','rejected','needs_more_info');

-- FUNCTIONS
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

-- TABLES
create table if not exists public.profiles (
  id uuid primary key,
  email text unique,
  first_name text,
  last_name text,
  phone text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  country text,
  dob date,
  ssn_last4 text,
  business_name text,
  business_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  account_number text not null unique,
  type public.account_type not null,
  status public.account_status not null default 'pending',
  balance numeric(18,2) not null default 0,
  currency public.currency not null default 'USD',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  card_type text not null,
  last4 text,
  embossed_name text,
  exp_month int,
  exp_year int,
  network text,
  status public.card_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transfers (
  id uuid primary key default gen_random_uuid(),
  from_account_id uuid not null references public.accounts(id) on delete restrict,
  to_account_id uuid not null references public.accounts(id) on delete restrict,
  created_by_user_id uuid not null,
  approved_by_admin_id uuid,
  amount numeric(18,2) not null check (amount > 0),
  currency public.currency not null default 'USD',
  status public.transfer_status not null default 'pending',
  progress int not null default 0 check (progress >= 0 and progress <= 100),
  fttc_token_required boolean not null default false,
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.kyc_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  status public.kyc_status not null default 'pending',
  ssn_last4 text,
  ssn_encrypted text,
  document_urls jsonb default '[]'::jsonb,
  notes text,
  reviewed_by_admin_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.newsletter_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  email text not null,
  consent boolean not null default true,
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (email)
);

create table if not exists public.admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null,
  action text not null,
  target_table text,
  target_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- TRIGGERS
create or replace trigger trg_profiles_updated
before update on public.profiles
for each row execute function public.update_updated_at_column();

create or replace trigger trg_accounts_updated
before update on public.accounts
for each row execute function public.update_updated_at_column();

create or replace trigger trg_cards_updated
before update on public.cards
for each row execute function public.update_updated_at_column();

create or replace trigger trg_transfers_updated
before update on public.transfers
for each row execute function public.update_updated_at_column();

create or replace trigger trg_kyc_updated
before update on public.kyc_submissions
for each row execute function public.update_updated_at_column();

create or replace trigger trg_newsletter_updated
before update on public.newsletter_subscriptions
for each row execute function public.update_updated_at_column();

-- RLS ENABLE
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.accounts enable row level security;
alter table public.cards enable row level security;
alter table public.transfers enable row level security;
alter table public.kyc_submissions enable row level security;
alter table public.newsletter_subscriptions enable row level security;
alter table public.admin_actions enable row level security;

-- POLICIES: profiles
create policy "Profiles: owner can select" on public.profiles
for select to authenticated
using (id = auth.uid());

create policy "Profiles: admin can select all" on public.profiles
for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Profiles: owner can insert" on public.profiles
for insert to authenticated
with check (id = auth.uid());

create policy "Profiles: owner can update" on public.profiles
for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "Profiles: admin can manage" on public.profiles
for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- POLICIES: user_roles
create policy "User roles: user can view own roles" on public.user_roles
for select to authenticated
using (user_id = auth.uid());

create policy "User roles: admin can manage" on public.user_roles
for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- POLICIES: accounts
create policy "Accounts: owner or admin can select" on public.accounts
for select to authenticated
using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

create policy "Accounts: owner or admin can insert" on public.accounts
for insert to authenticated
with check (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

create policy "Accounts: admin can update" on public.accounts
for update to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "Accounts: admin can delete" on public.accounts
for delete to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- POLICIES: cards
create policy "Cards: owner or admin can select" on public.cards
for select to authenticated
using (
  exists (
    select 1 from public.accounts a
    where a.id = account_id
      and (a.user_id = auth.uid() or public.has_role(auth.uid(), 'admin'))
  )
);

create policy "Cards: owner or admin can insert" on public.cards
for insert to authenticated
with check (
  exists (
    select 1 from public.accounts a
    where a.id = account_id
      and (a.user_id = auth.uid() or public.has_role(auth.uid(), 'admin'))
  )
);

create policy "Cards: admin can update" on public.cards
for update to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "Cards: admin can delete" on public.cards
for delete to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- POLICIES: transfers
create policy "Transfers: owner or admin can select" on public.transfers
for select to authenticated
using (
  public.has_role(auth.uid(), 'admin') or
  exists (
    select 1 from public.accounts a
    where a.id = from_account_id and a.user_id = auth.uid()
  ) or
  exists (
    select 1 from public.accounts a
    where a.id = to_account_id and a.user_id = auth.uid()
  )
);

create policy "Transfers: owner can insert from own account" on public.transfers
for insert to authenticated
with check (
  created_by_user_id = auth.uid() and
  exists (
    select 1 from public.accounts a
    where a.id = from_account_id and a.user_id = auth.uid()
  )
);

create policy "Transfers: admin can manage" on public.transfers
for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- POLICIES: kyc_submissions
create policy "KYC: owner or admin can select" on public.kyc_submissions
for select to authenticated
using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

create policy "KYC: owner can insert" on public.kyc_submissions
for insert to authenticated
with check (user_id = auth.uid());

create policy "KYC: admin can update" on public.kyc_submissions
for update to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- POLICIES: newsletter_subscriptions
create policy "Newsletter: public can subscribe" on public.newsletter_subscriptions
for insert to anon, authenticated
with check (true);

create policy "Newsletter: owner or admin can select" on public.newsletter_subscriptions
for select to authenticated
using (public.has_role(auth.uid(), 'admin') or (user_id = auth.uid()));

create policy "Newsletter: owner can update own" on public.newsletter_subscriptions
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Newsletter: admin can manage" on public.newsletter_subscriptions
for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- POLICIES: admin_actions
create policy "Admin actions: admin can manage and view" on public.admin_actions
for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- INDEXES
create index if not exists idx_accounts_user on public.accounts(user_id);
create index if not exists idx_cards_account on public.cards(account_id);
create index if not exists idx_transfers_from on public.transfers(from_account_id);
create index if not exists idx_transfers_to on public.transfers(to_account_id);
create index if not exists idx_user_roles_user on public.user_roles(user_id);
create index if not exists idx_kyc_user on public.kyc_submissions(user_id);
