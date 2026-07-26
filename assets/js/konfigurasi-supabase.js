/**
 * Data Indonesia — Konfigurasi Supabase
 *
 * Cara mengisi:
 * 1. Buka Supabase → Project Settings → API
 * 2. Salin "Project URL" ke `url`
 * 3. Salin "anon public" key ke `kunciAnon`
 * 4. Jalankan SQL di basis-data/kontak.sql terlebih dahulu
 *
 * Catatan keamanan:
 * - kunciAnon memang boleh dipakai di frontend (dilindungi RLS)
 * - Jangan pernah menaruh service_role key di kode website
 */
window.KONFIG_SUPABASE = {
  url: "https://mcsgtqzzstlxaovyedit.supabase.co",
  kunciAnon: "sb_publishable_FNnVkCvQJGE0EQQC58cZBQ_Rw6IaEtw",
  tabelKontak: "kontak",
};
