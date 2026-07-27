/**
 * Data Indonesia — Formulir Kontak → Supabase (REST)
 *
 * Prasyarat:
 * 1. Jalankan basis-data/perbaiki-rls-kontak.sql di SQL Editor
 * 2. Pastikan url + anon JWT key di konfigurasi-supabase.js
 */

(function () {
  "use strict";

  function ambilKonfig() {
    return window.KONFIG_SUPABASE || {};
  }

  function validasiEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function setStatus(elemen, teks, kelas) {
    if (!elemen) return;
    elemen.textContent = teks;
    elemen.className = "formulir__status" + (kelas ? " " + kelas : "");
  }

  function konfigSiap(konfig) {
    return (
      konfig.url &&
      konfig.kunciAnon &&
      !String(konfig.url).includes("GANTI_PROJECT_REF") &&
      !String(konfig.kunciAnon).includes("GANTI_DENGAN_ANON_PUBLIC_KEY")
    );
  }

  async function simpanKeSupabase(konfig, data) {
    const tabel = encodeURIComponent(konfig.tabelKontak || "kontak");
    const endpoint = String(konfig.url).replace(/\/$/, "") + "/rest/v1/" + tabel;

    const baris = {
      nama: data.nama,
      email: data.email,
      telepon: null,
      subjek: data.subjek || "Konsultasi Umum",
      pesan: data.pesan,
      status: "baru",
      sumber: "website",
      user_agent: (navigator.userAgent || "").slice(0, 500) || null,
    };

    const respons = await fetch(endpoint, {
      method: "POST",
      headers: {
        apikey: konfig.kunciAnon,
        Authorization: "Bearer " + konfig.kunciAnon,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(baris),
    });

    if (respons.ok || respons.status === 201) {
      return;
    }

    let detail = "";
    try {
      const payload = await respons.json();
      detail = payload.message || payload.error_description || payload.error || JSON.stringify(payload);
    } catch (_) {
      detail = (await respons.text()) || respons.statusText;
    }

    const err = new Error(detail || "Gagal menyimpan ke Supabase");
    err.status = respons.status;
    throw err;
  }

  function inisialisasiFormulir() {
    const form = document.getElementById("formulir-kontak");
    if (!form) return;

    const status = document.getElementById("status-formulir");
    const tombol = form.querySelector('[type="submit"]');
    const konfig = ambilKonfig();

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const data = {
        nama: (form.nama?.value || "").trim(),
        email: (form.email?.value || "").trim(),
        subjek: (form.subjek?.value || "").trim(),
        pesan: (form.pesan?.value || "").trim(),
      };

      if (!data.nama || !data.email || !data.pesan) {
        setStatus(status, "Mohon lengkapi nama, email, dan pesan.", "gagal");
        return;
      }

      if (data.nama.length < 2) {
        setStatus(status, "Nama terlalu pendek.", "gagal");
        return;
      }

      if (!validasiEmail(data.email)) {
        setStatus(status, "Format email tidak valid.", "gagal");
        return;
      }

      if (data.pesan.length < 5) {
        setStatus(status, "Pesan terlalu pendek. Mohon jelaskan kebutuhan Anda.", "gagal");
        return;
      }

      if (!konfigSiap(konfig)) {
        setStatus(
          status,
          "Supabase belum dikonfigurasi. Isi url & kunciAnon di assets/js/konfigurasi-supabase.js.",
          "gagal"
        );
        return;
      }

      if (tombol) {
        tombol.disabled = true;
        tombol.dataset.labelAsli = tombol.textContent;
        tombol.textContent = "Mengirim...";
      }
      setStatus(status, "Menyimpan pesan ke database...", "memuat");

      try {
        await simpanKeSupabase(konfig, data);
        form.reset();
        setStatus(
          status,
          "Pesan berhasil dikirim dan tersimpan. Tim kami akan segera menghubungi Anda.",
          "sukses"
        );
      } catch (galat) {
        console.error("Formulir kontak Supabase:", galat);
        const pesanAsli = String(galat && galat.message ? galat.message : "");
        let pesanGalat = "Gagal mengirim. Periksa koneksi atau konfigurasi Supabase.";

        if (/row-level security|RLS|policy/i.test(pesanAsli) || galat.status === 401) {
          pesanGalat =
            "Masih ditolak RLS (401). Jalankan SEMUA isi basis-data/perbaiki-rls-kontak.sql di SQL Editor sampai langkah uji sukses.";
        } else if (pesanAsli) {
          pesanGalat = "Gagal mengirim: " + pesanAsli;
        }

        setStatus(status, pesanGalat, "gagal");
      } finally {
        if (tombol) {
          tombol.disabled = false;
          tombol.textContent = tombol.dataset.labelAsli || "Kirim Pesan";
        }
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inisialisasiFormulir);
  } else {
    inisialisasiFormulir();
  }
})();
