-- Create sensor_readings table
create table if not exists public.sensor_readings (
  id uuid primary key default gen_random_uuid(),
  sensor_id uuid not null references public.sensors(id) on delete cascade,
  rssi integer not null,
  timestamp timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Enable RLS for sensor_readings
alter table public.sensor_readings enable row level security;

create policy "sensor_readings_select_via_sensor"
  on public.sensor_readings for select
  using (
    exists (
      select 1 from public.sensors
      join public.devices on devices.id = sensors.device_id
      where sensors.id = sensor_readings.sensor_id
      and devices.user_id = auth.uid()
    )
  );

create policy "sensor_readings_insert_via_sensor"
  on public.sensor_readings for insert
  with check (
    exists (
      select 1 from public.sensors
      join public.devices on devices.id = sensors.device_id
      where sensors.id = sensor_readings.sensor_id
      and devices.user_id = auth.uid()
    )
  );

-- Create predictions table
create table if not exists public.predictions (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets(id) on delete cascade,
  location_id uuid references public.locations(id) on delete set null,
  confidence numeric(5,4),
  timestamp timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Enable RLS for predictions
alter table public.predictions enable row level security;

create policy "predictions_select_via_pet"
  on public.predictions for select
  using (
    exists (
      select 1 from public.pets
      where pets.id = predictions.pet_id
      and pets.user_id = auth.uid()
    )
  );

create policy "predictions_insert_via_pet"
  on public.predictions for insert
  with check (
    exists (
      select 1 from public.pets
      where pets.id = predictions.pet_id
      and pets.user_id = auth.uid()
    )
  );

-- Create models table
create table if not exists public.models (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  model_name text not null,
  model_type text not null,
  accuracy numeric(5,4),
  trained_at timestamp with time zone,
  is_active boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS for models
alter table public.models enable row level security;

create policy "models_select_own"
  on public.models for select
  using (auth.uid() = user_id);

create policy "models_insert_own"
  on public.models for insert
  with check (auth.uid() = user_id);

create policy "models_update_own"
  on public.models for update
  using (auth.uid() = user_id);

create policy "models_delete_own"
  on public.models for delete
  using (auth.uid() = user_id);
