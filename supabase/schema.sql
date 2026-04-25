-- ============================================
-- Certitrust Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- Issuers table
-- ============================================
create table if not exists public.issuers (
  id uuid references auth.users on delete cascade primary key,
  org_name text not null,
  org_domain text not null unique,
  wallet_address text,
  created_at timestamptz default now() not null
);

-- RLS for issuers
alter table public.issuers enable row level security;

drop policy if exists "Users can read own issuer profile" on public.issuers;
create policy "Users can read own issuer profile"
  on public.issuers for select
  using (auth.uid() = id);

drop policy if exists "Users can create own issuer profile" on public.issuers;
create policy "Users can create own issuer profile"
  on public.issuers for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update own issuer profile" on public.issuers;
create policy "Users can update own issuer profile"
  on public.issuers for update
  using (auth.uid() = id);

drop policy if exists "Public can read issuer info" on public.issuers;
create policy "Public can read issuer info"
  on public.issuers for select
  using (true);

-- ============================================
-- Certificates table
-- ============================================
create table if not exists public.certificates (
  id uuid default uuid_generate_v4() primary key,
  uri text not null unique,
  issuer_id uuid references public.issuers(id) on delete cascade not null,
  recipient_name text not null,
  recipient_email text not null,
  course_name text not null,
  certificate_hash text not null unique,
  tx_hash text,
  pdf_url text,
  qr_url text,
  status text default 'issued' check (status in ('issued', 'revoked')) not null,
  issued_at timestamptz default now() not null,
  revoked_at timestamptz,
  metadata jsonb default '{}'::jsonb
);

-- RLS for certificates
alter table public.certificates enable row level security;

drop policy if exists "Issuers can manage own certificates" on public.certificates;
create policy "Issuers can manage own certificates"
  on public.certificates for all
  using (auth.uid() = issuer_id);

drop policy if exists "Public can verify certificates" on public.certificates;
create policy "Public can verify certificates"
  on public.certificates for select
  using (true);

-- ============================================
-- Storage bucket for certificate PDFs
-- ============================================
insert into storage.buckets (id, name, public)
values ('certificates', 'certificates', true)
on conflict (id) do nothing;

drop policy if exists "Public can read certificate PDFs" on storage.objects;
create policy "Public can read certificate PDFs"
  on storage.objects for select
  using (bucket_id = 'certificates');

drop policy if exists "Authenticated users can upload PDFs" on storage.objects;
create policy "Authenticated users can upload PDFs"
  on storage.objects for insert
  with check (
    bucket_id = 'certificates'
    and auth.role() = 'authenticated'
  );

-- ============================================
-- Indexes for performance
-- ============================================
create index if not exists idx_certificates_hash on public.certificates(certificate_hash);
create index if not exists idx_certificates_issuer on public.certificates(issuer_id);
create index if not exists idx_certificates_uri on public.certificates(uri);
create index if not exists idx_certificates_status on public.certificates(status);

-- ============================================
-- ALTER: Add new columns (run after initial schema)
-- Safe to run multiple times (IF NOT EXISTS)
-- ============================================
alter table public.issuers
  add column if not exists logo_url text;

alter table public.issuers
  add column if not exists signature_url text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='certificates' AND column_name='certificate_type'
  ) THEN
    alter table public.certificates
      add column certificate_type text
        not null default 'course_completion'
        check (certificate_type in (
          'course_completion',
          'degree_diploma',
          'achievement_award',
          'workshop_seminar',
          'internship'
        ));
  END IF;
END $$;

-- ============================================
-- Storage bucket for institution logos
-- ============================================
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

drop policy if exists "Public can read logos" on storage.objects;
create policy "Public can read logos"
  on storage.objects for select
  using (bucket_id = 'logos');

drop policy if exists "Authenticated users can upload logos" on storage.objects;
create policy "Authenticated users can upload logos"
  on storage.objects for insert
  with check (
    bucket_id = 'logos'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Authenticated users can update logos" on storage.objects;
create policy "Authenticated users can update logos"
  on storage.objects for update
  using (
    bucket_id = 'logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================
-- Storage bucket for institution signatures
-- ============================================
insert into storage.buckets (id, name, public)
values ('signatures', 'signatures', true)
on conflict (id) do nothing;

drop policy if exists "Public can read signatures" on storage.objects;
create policy "Public can read signatures"
  on storage.objects for select
  using (bucket_id = 'signatures');

drop policy if exists "Authenticated users can upload signatures" on storage.objects;
create policy "Authenticated users can upload signatures"
  on storage.objects for insert
  with check (
    bucket_id = 'signatures'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Authenticated users can update signatures" on storage.objects;
create policy "Authenticated users can update signatures"
  on storage.objects for update
  using (
    bucket_id = 'signatures'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
