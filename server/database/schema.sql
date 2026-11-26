-- =====================================
-- VIP MEDIA HUB DATABASE
-- =====================================

create extension if not exists pgcrypto;

-- =====================================
-- USERS
-- =====================================

create table if not exists public.users (
    id uuid primary key default gen_random_uuid(),
    telegram_id text unique not null,
    first_name text,
    last_name text,
    username text,
    photo_url text,
    created_at timestamptz default now(),
    last_seen_at timestamptz default now()
);

-- =====================================
-- CATEGORIES
-- =====================================

create table if not exists public.categories (
    id uuid primary key default gen_random_uuid(),
    name text unique not null,
    description text,
    image_url text,
    created_at timestamptz default now()
);

-- =====================================
-- VIDEOS
-- =====================================

create table if not exists public.videos (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text,
    category text,
    country text,
    language text,
    release_year integer,
    genre text[],
    tags text[],
    duration integer,
    cast_members text[],
    director text,
    thumbnail_url text,
    video_url text not null,
    status text default 'draft'
        check (status in ('draft', 'published', 'archived')),
    views bigint default 0,
    featured boolean default false,
    uploaded_by_telegram_id text,
    created_at timestamptz default now()
);

-- =====================================
-- VIDEO QUALITIES
-- =====================================

create table if not exists public.video_qualities (
    id uuid primary key default gen_random_uuid(),
    video_id uuid references public.videos(id) on delete cascade,
    quality text not null,
    video_url text not null,
    created_at timestamptz default now()
);

-- =====================================
-- SUBTITLES
-- =====================================

create table if not exists public.subtitles (
    id uuid primary key default gen_random_uuid(),
    video_id uuid references public.videos(id) on delete cascade,
    language text not null,
    subtitle_url text not null,
    format text default 'vtt',
    created_at timestamptz default now()
);

-- =====================================
-- WATCH HISTORY
-- =====================================

create table if not exists public.watch_history (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.users(id) on delete cascade,
    video_id uuid references public.videos(id) on delete cascade,
    progress_seconds integer default 0,
    completed boolean default false,
    updated_at timestamptz default now(),
    unique(user_id, video_id)
);

-- =====================================
-- FAVORITES
-- =====================================

create table if not exists public.favorites (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.users(id) on delete cascade,
    video_id uuid references public.videos(id) on delete cascade,
    created_at timestamptz default now(),
    unique(user_id, video_id)
);

-- =====================================
-- LIKES
-- =====================================

create table if not exists public.likes (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.users(id) on delete cascade,
    video_id uuid references public.videos(id) on delete cascade,
    created_at timestamptz default now(),
    unique(user_id, video_id)
);

-- =====================================
-- RATINGS
-- =====================================

create table if not exists public.ratings (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.users(id) on delete cascade,
    video_id uuid references public.videos(id) on delete cascade,
    rating integer check (rating between 1 and 5),
    created_at timestamptz default now(),
    unique(user_id, video_id)
);

-- =====================================
-- COMMENTS
-- =====================================

create table if not exists public.comments (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.users(id) on delete cascade,
    video_id uuid references public.videos(id) on delete cascade,
    comment text not null,
    approved boolean default false,
    created_at timestamptz default now()
);

-- =====================================
-- NOTIFICATIONS
-- =====================================

create table if not exists public.notifications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.users(id) on delete cascade,
    title text not null,
    message text,
    is_read boolean default false,
    created_at timestamptz default now()
);

-- =====================================
-- DOWNLOADS
-- =====================================

create table if not exists public.downloads (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.users(id) on delete cascade,
    video_id uuid references public.videos(id) on delete cascade,
    created_at timestamptz default now()
);

-- =====================================
-- SECURITY AUDIT LOG
-- =====================================

create table if not exists public.admin_audit_logs (
    id uuid primary key default gen_random_uuid(),
    admin_telegram_id text not null,
    action text not null,
    details jsonb,
    created_at timestamptz default now()
);

-- =====================================
-- INDEXES
-- =====================================

create index if not exists videos_status_idx
on public.videos(status);

create index if not exists videos_category_idx
on public.videos(category);

create index if not exists videos_created_at_idx
on public.videos(created_at desc);

create index if not exists watch_history_user_idx
on public.watch_history(user_id);

create index if not exists favorites_user_idx
on public.favorites(user_id);

create index if not exists likes_video_idx
on public.likes(video_id);

create index if not exists notifications_user_idx
on public.notifications(user_id);

-- =====================================
-- END
-- =====================================
