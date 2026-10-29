-- =============================================================================
-- Dr. Reham AlQahtani Website — Complete Admin CMS & RBAC Schema for Supabase
-- Migration: 20261029000000_admin_cms_schema.sql
-- Idempotent: Safe to run multiple times without losing existing data
-- =============================================================================

create extension if not exists "pgcrypto";

-- 1. Admin & Editor Users Table (Linked to auth.users or standalone server auth)
create table if not exists public.cms_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null,
  role text not null check (role in ('admin', 'editor')),
  password_hash text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz
);

-- 2. Login Rate Limiting & Brute-Force Protection
create table if not exists public.cms_login_attempts (
  key text primary key,
  count integer not null default 0,
  first_attempt_at timestamptz not null default now(),
  locked_until timestamptz
);

-- 3. Password Reset Tokens
create table if not exists public.cms_password_resets (
  token_hash text primary key,
  user_id uuid not null references public.cms_users(id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

-- 4. Site Pages (Draft vs Published section-based JSONB + optimistic concurrency)
create table if not exists public.cms_pages (
  slug text primary key,
  title text not null,
  draft_data jsonb not null,
  published_data jsonb not null,
  has_unpublished_changes boolean not null default false,
  version integer not null default 1,
  deleted_at timestamptz,
  updated_at timestamptz not null default now(),
  updated_by text,
  published_at timestamptz,
  published_by text
);

-- 5. Articles Table (Full lifecycle: draft -> in_review -> published -> archived)
create table if not exists public.cms_articles (
  id text primary key,
  slug text not null unique,
  title text not null,
  category text not null check (category in ('العين والجفون', 'حول العين', 'قبل الاستشارة')),
  excerpt text not null,
  hero_image jsonb not null,
  featured boolean not null default false,
  status text not null check (status in ('draft', 'in_review', 'published', 'archived')),
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  updated_by text,
  author text,
  reviewed_by text,
  reviewed_at timestamptz,
  approved_by text,
  approved_at timestamptz,
  disclaimer text not null,
  sections jsonb not null default '[]'::jsonb,
  sources jsonb not null default '[]'::jsonb,
  seo_title text,
  seo_description text,
  og_image text,
  version integer not null default 1,
  deleted_at timestamptz
);

-- 6. Automatic Slug Redirects for Renamed Published Articles
create table if not exists public.cms_slug_redirects (
  old_slug text primary key,
  new_slug text not null,
  article_id text not null references public.cms_articles(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- 7. Media Library Table (Focal Point, Visibility Protection & Usage Integrity)
create table if not exists public.cms_media (
  id text primary key,
  name text not null,
  filename text not null,
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/avif')),
  size_bytes integer not null check (size_bytes > 0 and size_bytes <= 8388608),
  width integer,
  height integer,
  alt text not null default '',
  focal_x numeric(5,2) not null default 50,
  focal_y numeric(5,2) not null default 50,
  storage_path text not null,
  public_url text not null,
  is_public boolean not null default false,
  uploaded_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 8. FAQ Items Table
create table if not exists public.cms_faqs (
  id text primary key,
  question text not null,
  answer text not null,
  category text not null default 'عام',
  sort_order integer not null default 0,
  status text not null check (status in ('draft', 'published')),
  version integer not null default 1,
  deleted_at timestamptz,
  updated_at timestamptz not null default now(),
  updated_by text
);

-- 9. Clinics / Locations Table
create table if not exists public.cms_clinics (
  id text primary key,
  name text not null,
  address text,
  maps_url text,
  hours text,
  booking_url text,
  phone text,
  verified boolean not null default false,
  published boolean not null default false,
  sort_order integer not null default 0,
  version integer not null default 1,
  updated_at timestamptz not null default now(),
  updated_by text
);

-- 10. Site & Contact Settings (Singleton row id = 'default')
create table if not exists public.cms_settings (
  id text primary key default 'default' check (id = 'default'),
  data jsonb not null,
  version integer not null default 1,
  updated_at timestamptz not null default now(),
  updated_by text
);

-- 11. Content Revisions History (Restorable by Admin)
create table if not exists public.cms_revisions (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('page', 'article', 'faq', 'clinic', 'settings')),
  entity_id text not null,
  version integer not null,
  snapshot jsonb not null,
  summary text not null,
  actor_email text not null,
  actor_name text not null,
  created_at timestamptz not null default now()
);

-- 12. Audit Log for Security, Publishing, Archiving, Settings & User Changes
create table if not exists public.cms_audit_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  entity_type text not null,
  entity_id text not null,
  summary text not null,
  actor_email text not null,
  actor_name text not null,
  actor_role text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- =============================================================================
-- Row-Level Security (RLS) Policies
-- =============================================================================

alter table public.cms_users enable row level security;
alter table public.cms_login_attempts enable row level security;
alter table public.cms_password_resets enable row level security;
alter table public.cms_pages enable row level security;
alter table public.cms_articles enable row level security;
alter table public.cms_slug_redirects enable row level security;
alter table public.cms_media enable row level security;
alter table public.cms_faqs enable row level security;
alter table public.cms_clinics enable row level security;
alter table public.cms_settings enable row level security;
alter table public.cms_revisions enable row level security;
alter table public.cms_audit_logs enable row level security;

-- Public read policies strictly limited to published, non-deleted records
drop policy if exists "Public can read published pages" on public.cms_pages;
create policy "Public can read published pages"
  on public.cms_pages for select
  using (deleted_at is null);

drop policy if exists "Public can read published articles only" on public.cms_articles;
create policy "Public can read published articles only"
  on public.cms_articles for select
  using (status = 'published' and deleted_at is null and approved_at is not null);

drop policy if exists "Public can read slug redirects" on public.cms_slug_redirects;
create policy "Public can read slug redirects"
  on public.cms_slug_redirects for select
  using (true);

drop policy if exists "Public can read public media only" on public.cms_media;
create policy "Public can read public media only"
  on public.cms_media for select
  using (is_public = true);

drop policy if exists "Public can read published FAQs only" on public.cms_faqs;
create policy "Public can read published FAQs only"
  on public.cms_faqs for select
  using (status = 'published' and deleted_at is null);

drop policy if exists "Public can read verified published clinics only" on public.cms_clinics;
create policy "Public can read verified published clinics only"
  on public.cms_clinics for select
  using (verified = true and published = true);

drop policy if exists "Public can read site settings" on public.cms_settings;
create policy "Public can read site settings"
  on public.cms_settings for select
  using (id = 'default');
