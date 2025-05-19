-- Create users table extension
create extension if not exists "uuid-ossp";

-- Create custom types
create type eq_dimension as enum (
  'Self-Awareness',
  'Self-Regulation',
  'Motivation',
  'Empathy',
  'Social Skills'
);

-- Create tables
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade,
  email text unique,
  name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id)
);

create table if not exists public.eq_questions (
  id serial primary key,
  dimension eq_dimension not null,
  question text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  explanation text
);

create table if not exists public.eq_test_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.eq_responses (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references public.eq_test_sessions(id) on delete cascade,
  question_id integer references public.eq_questions(id) on delete cascade,
  response integer check (response >= 1 and response <= 5),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.eq_results (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references public.eq_test_sessions(id) on delete cascade,
  self_awareness_score numeric,
  self_regulation_score numeric,
  motivation_score numeric,
  empathy_score numeric,
  social_skills_score numeric,
  total_score numeric,
  label text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create RLS policies
alter table public.profiles enable row level security;
alter table public.eq_questions enable row level security;
alter table public.eq_test_sessions enable row level security;
alter table public.eq_responses enable row level security;
alter table public.eq_results enable row level security;

-- Profiles policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Questions policies (readable by all authenticated users)
create policy "Questions are readable by authenticated users"
  on public.eq_questions for select
  using (auth.role() = 'authenticated');

-- Test sessions policies
create policy "Users can view their own test sessions"
  on public.eq_test_sessions for select
  using (auth.uid() = user_id);

create policy "Users can create their own test sessions"
  on public.eq_test_sessions for insert
  with check (auth.uid() = user_id);

-- Responses policies
create policy "Users can view their own responses"
  on public.eq_responses for select
  using (
    exists (
      select 1 from public.eq_test_sessions
      where id = eq_responses.session_id
      and user_id = auth.uid()
    )
  );

create policy "Users can create their own responses"
  on public.eq_responses for insert
  with check (
    exists (
      select 1 from public.eq_test_sessions
      where id = eq_responses.session_id
      and user_id = auth.uid()
    )
  );

-- Results policies
create policy "Users can view their own results"
  on public.eq_results for select
  using (
    exists (
      select 1 from public.eq_test_sessions
      where id = eq_results.session_id
      and user_id = auth.uid()
    )
  );

create policy "Users can create their own results"
  on public.eq_results for insert
  with check (
    exists (
      select 1 from public.eq_test_sessions
      where id = eq_results.session_id
      and user_id = auth.uid()
    )
  );

-- Create sample questions
insert into public.eq_questions (dimension, question) values
  ('Self-Awareness', 'I can accurately identify my emotions as they happen'),
  ('Self-Awareness', 'I understand how my emotions affect my behavior'),
  ('Self-Regulation', 'I can manage my emotions effectively in stressful situations'),
  ('Self-Regulation', 'I remain calm when facing conflict or opposition'),
  ('Motivation', 'I set challenging goals for myself and work hard to achieve them'),
  ('Motivation', 'I maintain optimism even when facing setbacks'),
  ('Empathy', 'I can sense others'' feelings and perspectives'),
  ('Empathy', 'I listen attentively to understand others'' points of view'),
  ('Social Skills', 'I can build rapport and maintain relationships effectively'),
  ('Social Skills', 'I handle difficult social situations with tact and diplomacy');

-- Enable realtime for relevant tables
alter publication supabase_realtime add table eq_test_sessions;
alter publication supabase_realtime add table eq_results; 