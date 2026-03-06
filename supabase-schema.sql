-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS TABLE
create table if not exists users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_session_date date,
  grace_used boolean default false,
  grace_reset_date date,
  is_deep boolean default false,
  deep_since timestamp with time zone,
  deep_expires timestamp with time zone,
  reminder_enabled boolean default false,
  reminder_timezone text
);

-- SESSIONS TABLE
create table if not exists sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) on delete cascade not null,
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone,
  duration_minutes integer not null,
  is_active boolean default true
);

-- JOURNAL ENTRIES TABLE
create table if not exists journal_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  prompt text,
  content text, -- AES encrypted text stored here
  session_date date not null
);

-- DONATIONS TABLE
create table if not exists donations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) on delete set null,
  amount integer not null, -- in paise
  razorpay_payment_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- GRATITUDE DROPS TABLE
create table if not exists gratitude_drops (
  id uuid default uuid_generate_v4() primary key,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICIES (Row Level Security)
alter table users enable row level security;
alter table sessions enable row level security;
alter table journal_entries enable row level security;
alter table donations enable row level security;
alter table gratitude_drops enable row level security;

-- Users can read and update their own profile
create policy "Users can view own profile." on users for select using (auth.uid() = id);
create policy "Users can update own profile." on users for update using (auth.uid() = id);

-- Sessions: users can create, read, and delete their own
create policy "Users can modify own sessions." on sessions for all using (auth.uid() = user_id);

-- Journal Entries: users can only read and create their own
create policy "Users can read own journal entries." on journal_entries for select using (auth.uid() = user_id);
create policy "Users can create own journal entries." on journal_entries for insert with check (auth.uid() = user_id);

-- Donations: read only for the user, create only for the user
create policy "Users can read own donations." on donations for select using (auth.uid() = user_id);
create policy "Users can create own donations." on donations for insert with check (auth.uid() = user_id);

-- Gratitude Drops: Anyone can read and insert
create policy "Anyone can view gratitude drops" on gratitude_drops for select using (true);
create policy "Anyone can insert gratitude drops" on gratitude_drops for insert with check (true);

-- REALTIME
-- For the sessions presence to show active users
alter publication supabase_realtime add table sessions;

-- TRIGGERS
-- Trigger to automatically create a profile in the users table on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
