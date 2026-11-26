-- =====================================
-- VIP MEDIA HUB DATABASE SECURITY
-- =====================================

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.videos enable row level security;
alter table public.video_qualities enable row level security;
alter table public.subtitles enable row level security;
alter table public.watch_history enable row level security;
alter table public.favorites enable row level security;
alter table public.likes enable row level security;
alter table public.ratings enable row level security;
alter table public.comments enable row level security;
alter table public.notifications enable row level security;
alter table public.downloads enable row level security;
alter table public.admin_audit_logs enable row level security;

-- Public can read published videos
create policy "Read published videos"
on public.videos
for select
to anon, authenticated
using (status = 'published');

-- Public can read categories
create policy "Read categories"
on public.categories
for select
to anon, authenticated
using (true);

-- Public can read video qualities
create policy "Read published video qualities"
on public.video_qualities
for select
to anon, authenticated
using (
    exists (
        select 1
        from public.videos
        where videos.id = video_qualities.video_id
        and videos.status = 'published'
    )
);

-- Public can read subtitles for published videos
create policy "Read published subtitles"
on public.subtitles
for select
to anon, authenticated
using (
    exists (
        select 1
        from public.videos
        where videos.id = subtitles.video_id
        and videos.status = 'published'
    )
);

-- Comments: public can read approved comments
create policy "Read approved comments"
on public.comments
for select
to anon, authenticated
using (approved = true);

-- No public write policies are created.
-- Backend must authenticate users and authorize
-- every database write operation.

-- Admin audit logs remain private.
-- Service role access must stay on the backend only.

-- =====================================
-- END
-- =====================================
