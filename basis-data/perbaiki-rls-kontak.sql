-- ============================================================
-- Data Indonesia — PERBAIKI RLS kontak (jalankan SEMUA skrip ini)
-- Supabase → SQL Editor → New query → Run
-- ============================================================

-- A) Pastikan tabel ada
create table if not exists public.kontak (
  id              uuid primary key default gen_random_uuid(),
  dibuat_pada     timestamptz not null default timezone('utc', now()),
  diperbarui_pada timestamptz not null default timezone('utc', now()),
  nama            text not null,
  email           text not null,
  telepon         text,
  subjek          text not null default 'Konsultasi Umum',
  pesan           text not null,
  status          text not null default 'baru'
                  check (status in ('baru', 'dibaca', 'diproses', 'selesai', 'arsip')),
  sumber          text not null default 'website',
  user_agent      text,
  catatan_admin   text
);

-- B) Hapus SEMUA kebijakan RLS lama
do $$
declare
  r record;
begin
  for r in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'kontak'
  loop
    execute format('drop policy if exists %I on public.kontak', r.policyname);
  end loop;
end $$;

-- C) Nyalakan RLS (tanpa FORCE, agar SQL Editor tetap bisa membaca)
alter table public.kontak enable row level security;

-- D) Kebijakan INSERT terbuka (berlaku untuk semua peran, termasuk anon)
create policy "kontak_allow_insert"
on public.kontak
as permissive
for insert
with check (true);

-- E) Baca/ubah hanya authenticated (admin login)
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

-- Agar pemilik/proyek tetap bisa melihat data di Table Editor
create policy "kontak_allow_select_service"
on public.kontak
as permissive
for select
to service_role
using (true);

-- F) Hak akses tabel (WAJIB)
grant usage on schema public to anon, authenticated, service_role;
grant insert on table public.kontak to anon, authenticated, service_role;
grant select, update, delete on table public.kontak to authenticated, service_role;

-- G) Reload skema API
notify pgrst, 'reload schema';

-- H) Verifikasi kebijakan tersimpan
select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename = 'kontak'
order by policyname;

-- ============================================================
-- Jika website MASIH 401 setelah ini, jalankan ALTERNATIF:
-- (anon hanya bisa INSERT karena grant; tidak bisa SELECT/UPDATE)
-- ============================================================
-- alter table public.kontak disable row level security;
-- grant insert on table public.kontak to anon, authenticated;
-- notify pgrst, 'reload schema';
-- ============================================================
