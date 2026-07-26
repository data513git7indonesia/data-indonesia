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
  js/utama.js, formulir.js, dashboard.js, skrip-google-sheets.gs
  icons/   (SVG)
  images/  logotransparant.png, logopolos.png
components/
  navigasi.html, kaki.html, pemuat.html
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

## Formulir → Google Sheets

1. Buat Google Sheet dengan header: `Stempel Waktu | Nama | Email | Telepon | Subjek | Pesan`
2. Tempel kode dari `assets/js/skrip-google-sheets.gs` ke Apps Script
3. Deploy sebagai **Web App** (akses: Anyone)
4. Salin URL ke `urlSkrip` di `assets/js/formulir.js`
