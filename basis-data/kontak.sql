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

-- Hapus kebijakan lama jika ada (aman dijalankan ulang)
drop policy if exists "Izinkan insert kontak publik" on public.kontak;
drop policy if exists "Izinkan baca kontak terautentikasi" on public.kontak;
drop policy if exists "Izinkan ubah kontak terautentikasi" on public.kontak;

-- Pengunjung (anon + authenticated) boleh mengirim pesan
create policy "Izinkan insert kontak publik"
on public.kontak
for insert
to anon, authenticated
with check (
  char_length(trim(nama)) >= 2
  and char_length(trim(email)) >= 5
  and char_length(trim(pesan)) >= 5
  and char_length(nama) <= 120
  and char_length(email) <= 160
  and char_length(coalesce(telepon, '')) <= 40
  and char_length(subjek) <= 120
  and char_length(pesan) <= 5000
);

-- Hanya user login (dashboard admin) yang boleh membaca
create policy "Izinkan baca kontak terautentikasi"
on public.kontak
for select
to authenticated
using (true);

-- Hanya user login yang boleh mengubah status/catatan
create policy "Izinkan ubah kontak terautentikasi"
on public.kontak
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
