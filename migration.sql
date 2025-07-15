-- Gj.WJf8K$j+PuJs

create table projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  name text not null,
  tempo int not null,
  time_signature text not null,
  bars jsonb not null,
  audio_url text,
  created_at timestamp default now()
);
