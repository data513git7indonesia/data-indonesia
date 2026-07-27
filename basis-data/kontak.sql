-- ============================================================
-- Data Indonesia — Skema tabel kontak (Supabase)
-- Jalankan di: Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================

-- 1) Ekstensi (biasanya sudah aktif di Supabase)
create extension if not exists "pgcrypto";

-- 2) Tabel utama penyimpanan pesan kontak
create table if not exists public.kontak (
  id            uuid primary key default gen_random_uuid(),
  dibuat_pada   timestamptz not null default timezone('utc', now()),
  diperbarui_pada timestamptz not null default timezone('utc', now()),
  nama          text not null,
  email         text not null,
  telepon       text,
  subjek        text not null default 'Konsultasi Umum',
  pesan         text not null,
  status        text not null default 'baru'
                check (status in ('baru', 'dibaca', 'diproses', 'selesai', 'arsip')),
  sumber        text not null default 'website',
  user_agent    text,
  catatan_admin text
);

-- 3) Indeks untuk pencarian / filter admin
create index if not exists idx_kontak_dibuat_pada
  on public.kontak (dibuat_pada desc);

create index if not exists idx_kontak_status
  on public.kontak (status);

create index if not exists idx_kontak_email
  on public.kontak (email);

-- 4) Trigger perbarui otomatis kolom diperbarui_pada
create or replace function public.set_diperbarui_pada()
returns trigger
language plpgsql
as $$
begin
  new.diperbarui_pada = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_kontak_diperbarui on public.kontak;

create trigger trg_kontak_diperbarui
before update on public.kontak
for each row
execute function public.set_diperbarui_pada();

-- 5) Row Level Security (RLS)
alter table public.kontak enable row level security;

-- Pengunjung boleh mengirim pesan (semua peran API)
-- Catatan: tanpa klausa TO agar berlaku untuk anon/authenticated/public
drop policy if exists "kontak_insert_publik" on public.kontak;
drop policy if exists "kontak_select_admin" on public.kontak;
drop policy if exists "kontak_update_admin" on public.kontak;
drop policy if exists "kontak_allow_insert" on public.kontak;
drop policy if exists "kontak_allow_select_auth" on public.kontak;
drop policy if exists "kontak_allow_update_auth" on public.kontak;

create policy "kontak_allow_insert"
on public.kontak
as permissive
for insert
with check (true);

create policy "kontak_allow_select_auth"
on public.kontak
as permissive
for select
to authenticated
using (true);

create policy "kontak_allow_update_auth"
on public.kontak
as permissive
for update
to authenticated
using (true)
with check (true);

-- 6) (Opsional) View ringkas untuk admin
create or replace view public.v_kontak_ringkas as
select
  id,
  dibuat_pada,
  nama,
  email,
  telepon,
  subjek,
  status,
  left(pesan, 120) as cuplikan_pesan
from public.kontak
order by dibuat_pada desc;

-- 7) Beri hak akses dasar
grant usage on schema public to anon, authenticated;
grant insert on table public.kontak to anon, authenticated;
grant select, update on table public.kontak to authenticated;
grant select on public.v_kontak_ringkas to authenticated;

-- ============================================================
-- Selesai.
-- Langkah berikutnya:
-- 1. Project Settings → API → salin Project URL & anon public key
-- 2. Tempel ke assets/js/konfigurasi-supabase.js
-- 3. Uji kirim dari halaman kontak.html
-- ============================================================
