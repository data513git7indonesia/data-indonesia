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
  kunciAnon: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jc2d0cXp6c3RseGFvdnllZGl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwODM2MTIsImV4cCI6MjEwMDY1OTYxMn0.Zq7cD5sLeI02Fcug9nNhLEtpuW5dYNdyfBOADZvGDRg",
  tabelKontak: "kontak",
};
