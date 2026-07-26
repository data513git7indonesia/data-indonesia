# Data Indonesia

Website resmi **Data Indonesia** — solusi data kelas perusahaan dengan identitas hitam & emas.

## Halaman

| Halaman | Berkas |
|---------|--------|
| Beranda | `index.html` |
| Tentang | `tentang.html` |
| Layanan | `layanan.html` |
| Dashboard | `dashboard.html` |
| Kontak | `kontak.html` |

## Struktur

```
assets/
  css/gaya.css
  js/utama.js, formulir.js, konfigurasi-supabase.js, obrolan.js, dashboard.js
  icons/   (SVG)
  images/  logotransparant.png, logopolos.png
basis-data/
  kontak.sql
components/
  navigasi.html, kaki.html, pemuat.html, obrolan.html
```

## Menjalankan lokal

Komponen dimuat via `fetch`, jadi buka lewat server lokal (bukan `file://`):

```bash
npx serve .
```

atau Live Server di VS Code / Cursor.

## Obrolan AI

Tombol chat pojok kanan bawah tersedia di semua halaman.
- UI: `components/obrolan.html`
- Logika: `assets/js/obrolan.js`
- Opsional Worker AI: `fungsi/pekerja-obrolan.js` — isi `urlApi` di `obrolan.js` setelah deploy

## Formulir Kontak → Supabase

1. Buka **Supabase Dashboard → SQL Editor**
2. Salin & jalankan seluruh isi `basis-data/kontak.sql`
3. Ambil **Project URL** dan **anon public key** dari Project Settings → API
4. Tempel ke `assets/js/konfigurasi-supabase.js`
5. Uji kirim pesan dari `kontak.html`

Pesan tersimpan di tabel `public.kontak` dengan status awal `baru`.
