-- Create follows table for user follow/unfollow system
-- follower_id follows following_id

create table if not exists follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references profiles(id) on delete cascade,
  following_id uuid not null references profiles(id) on delete cascade,
  created_at timestamp with time zone default now(),

  constraint no_self_follow check (follower_id != following_id),
  constraint unique_follow unique (follower_id, following_id)
);

create index if not exists idx_follows_follower_id on follows (follower_id);
create index if not exists idx_follows_following_id on follows (following_id);
create index if not exists idx_follows_created_at on follows (created_at desc);

alter table follows enable row level security;

-- Everyone can view follows
create policy "Anyone can view follows"
  on follows for select
  using (true);

-- Authenticated users can follow (insert)
create policy "Authenticated users can follow"
  on follows for insert
  with check (auth.uid() = follower_id);

-- Users can unfollow (delete their own follows)
create policy "Users can unfollow"
  on follows for delete
  using (auth.uid() = follower_id);
