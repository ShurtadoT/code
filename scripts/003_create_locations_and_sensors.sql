-- Create locations table
create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  floor_level integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS for locations
alter table public.locations enable row level security;

create policy "locations_select_own"
  on public.locations for select
  using (auth.uid() = user_id);

create policy "locations_insert_own"
  on public.locations for insert
  with check (auth.uid() = user_id);

create policy "locations_update_own"
  on public.locations for update
  using (auth.uid() = user_id);

create policy "locations_delete_own"
  on public.locations for delete
  using (auth.uid() = user_id);

-- Create sensors table
create table if not exists public.sensors (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null references public.devices(id) on delete cascade,
  location_id uuid references public.locations(id) on delete set null,
  sensor_type text not null,
  rssi_threshold integer default -70,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS for sensors (inherit from device)
alter table public.sensors enable row level security;

create policy "sensors_select_via_device"
  on public.sensors for select
  using (
    exists (
      select 1 from public.devices
      where devices.id = sensors.device_id
      and devices.user_id = auth.uid()
    )
  );

create policy "sensors_insert_via_device"
  on public.sensors for insert
  with check (
    exists (
      select 1 from public.devices
      where devices.id = sensors.device_id
      and devices.user_id = auth.uid()
    )
  );

create policy "sensors_update_via_device"
  on public.sensors for update
  using (
    exists (
      select 1 from public.devices
      where devices.id = sensors.device_id
      and devices.user_id = auth.uid()
    )
  );

create policy "sensors_delete_via_device"
  on public.sensors for delete
  using (
    exists (
      select 1 from public.devices
      where devices.id = sensors.device_id
      and devices.user_id = auth.uid()
    )
  );
