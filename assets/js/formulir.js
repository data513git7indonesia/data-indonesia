/**
 * Data Indonesia — Formulir Kontak → Google Sheets
 *
 * CARA MENGHUBUNGKAN:
 * 1. Buat Google Sheet baru dengan header baris 1:
 *    Stempel Waktu | Nama | Email | Telepon | Subjek | Pesan
 * 2. Extensi → Apps Script, tempel kode dari berkas:
 *    assets/js/skrip-google-sheets.gs
 * 3. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Salin URL Web App ke KONFIG.urlSkrip di bawah.
 */

(function () {
  "use strict";

  const KONFIG = {
    /* Ganti dengan URL Web App Google Apps Script Anda */
    urlSkrip: "https://script.google.com/macros/s/1Y2HK_pG8pgG5beUwR0CNQtCfmXRB8_cczlXxBaHUOKg/exec",
  };

  function validasiEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function setStatus(elemen, teks, kelas) {
    if (!elemen) return;
    elemen.textContent = teks;
    elemen.className = "formulir__status" + (kelas ? " " + kelas : "");
  }

  function inisialisasiFormulir() {
    const form = document.getElementById("formulir-kontak");
    if (!form) return;

    const status = document.getElementById("status-formulir");
    const tombol = form.querySelector('[type="submit"]');

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

      if (!validasiEmail(data.email)) {
        setStatus(status, "Format email tidak valid.", "gagal");
        return;
      }

      if (KONFIG.urlSkrip.includes("1Y2HK_pG8pgG5beUwR0CNQtCfmXRB8_cczlXxBaHUOKg")) {
        setStatus(
          status,
          "Formulir siap. Hubungkan URL Google Apps Script di assets/js/formulir.js.",
          "gagal"
        );
        return;
      }

      if (tombol) {
        tombol.disabled = true;
        tombol.dataset.labelAsli = tombol.textContent;
        tombol.textContent = "Mengirim...";
      }
      setStatus(status, "Mengirim pesan Anda...", "memuat");

      try {
        await fetch(KONFIG.urlSkrip, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        form.reset();
        setStatus(status, "Pesan berhasil dikirim. Tim kami akan segera menghubungi Anda.", "sukses");
      } catch (galat) {
        console.error(galat);
        setStatus(status, "Gagal mengirim. Periksa koneksi atau konfigurasi Google Sheets.", "gagal");
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
