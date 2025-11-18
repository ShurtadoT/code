-- Create pets table
create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  species text,
  breed text,
  age integer,
  weight numeric(5,2),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS for pets
alter table public.pets enable row level security;

create policy "pets_select_own"
  on public.pets for select
  using (auth.uid() = user_id);

create policy "pets_insert_own"
  on public.pets for insert
  with check (auth.uid() = user_id);

create policy "pets_update_own"
  on public.pets for update
  using (auth.uid() = user_id);

create policy "pets_delete_own"
  on public.pets for delete
  using (auth.uid() = user_id);

-- Create devices table
create table if not exists public.devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  device_type text not null check (device_type in ('ESP32', 'Gateway')),
  mac_address text unique not null,
  ip_address text,
  is_active boolean default true,
  last_seen timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS for devices
alter table public.devices enable row level security;

create policy "devices_select_own"
  on public.devices for select
  using (auth.uid() = user_id);

create policy "devices_insert_own"
  on public.devices for insert
  with check (auth.uid() = user_id);

create policy "devices_update_own"
  on public.devices for update
  using (auth.uid() = user_id);

create policy "devices_delete_own"
  on public.devices for delete
  using (auth.uid() = user_id);
