/**
 * Data Indonesia — Formulir Kontak → Supabase
 *
 * Prasyarat:
 * 1. Jalankan SQL: basis-data/kontak.sql di Supabase SQL Editor
 * 2. Isi url & kunciAnon di assets/js/konfigurasi-supabase.js
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

  function buatKlienSupabase(konfig) {
    if (!window.supabase || typeof window.supabase.createClient !== "function") {
      throw new Error("Supabase SDK belum dimuat.");
    }
    return window.supabase.createClient(konfig.url, konfig.kunciAnon, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  async function simpanKeSupabase(klien, konfig, data) {
    const tabel = konfig.tabelKontak || "kontak";
    const baris = {
      nama: data.nama,
      email: data.email,
      telepon: data.telepon || null,
      subjek: data.subjek || "Konsultasi Umum",
      pesan: data.pesan,
      status: "baru",
      sumber: "website",
      user_agent: navigator.userAgent || null,
    };

    const { data: hasil, error } = await klien.from(tabel).insert(baris).select("id").single();

    if (error) {
      const err = new Error(error.message || "Gagal menyimpan ke Supabase");
      err.kode = error.code;
      err.detail = error.details;
      throw err;
    }

    return hasil;
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
        telepon: (form.telepon?.value || "").trim(),
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
        const klien = buatKlienSupabase(konfig);
        await simpanKeSupabase(klien, konfig, data);
        form.reset();
        setStatus(
          status,
          "Pesan berhasil dikirim dan tersimpan. Tim kami akan segera menghubungi Anda.",
          "sukses"
        );
      } catch (galat) {
        console.error("Formulir kontak Supabase:", galat);
        let pesanGalat = "Gagal mengirim. Periksa koneksi atau konfigurasi Supabase.";
        if (galat && /row-level security|RLS|permission|policy/i.test(String(galat.message || ""))) {
          pesanGalat = "Gagal menyimpan: kebijakan RLS Supabase menolak insert. Jalankan ulang basis-data/kontak.sql.";
        } else if (galat && galat.message) {
          pesanGalat = "Gagal mengirim: " + galat.message;
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
