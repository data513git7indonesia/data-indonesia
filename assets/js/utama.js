/**
 * Data Indonesia — Skrip Utama
 * Navigasi, pemuat, animasi, penghitung
 */

(function () {
  "use strict";

  const KONFIG = {
    jalurKomponen: "components/",
    durasiPemuat: 700,
  };

  /* ---------- Pemuat halaman ---------- */
  function inisialisasiPemuat() {
    const pemuat = document.getElementById("pemuat");
    if (!pemuat) return;

    const sembunyikan = () => pemuat.classList.add("selesai");

    if (document.readyState === "complete") {
      setTimeout(sembunyikan, KONFIG.durasiPemuat);
    } else {
      window.addEventListener("load", () => setTimeout(sembunyikan, KONFIG.durasiPemuat));
    }
  }

  /* ---------- Muat komponen HTML ---------- */
  async function muatKomponen(selektor, berkas) {
    const wadah = document.querySelector(selektor);
    if (!wadah) return null;

    try {
      const respons = await fetch(KONFIG.jalurKomponen + berkas);
      if (!respons.ok) throw new Error("Gagal memuat " + berkas);
      wadah.innerHTML = await respons.text();
      return wadah;
    } catch (galat) {
      console.warn(galat.message);
      return null;
    }
  }

  /* ---------- Navigasi ---------- */
  function inisialisasiNavigasi() {
    const navigasi = document.querySelector(".navigasi");
    const tombol = document.querySelector(".navigasi__tombol");
    const menu = document.querySelector(".navigasi__menu");
    if (!navigasi) return;

    const halaman = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    document.querySelectorAll(".navigasi__tautan").forEach((tautan) => {
      const href = (tautan.getAttribute("href") || "").toLowerCase();
      if (href === halaman || (halaman === "" && href === "index.html")) {
        tautan.classList.add("aktif");
      }
    });

    const perbaruiGulir = () => {
      navigasi.classList.toggle("menggulir", window.scrollY > 24);
    };
    perbaruiGulir();
    window.addEventListener("scroll", perbaruiGulir, { passive: true });

    if (tombol && menu) {
      tombol.addEventListener("click", () => {
        const buka = menu.classList.toggle("buka");
        tombol.classList.toggle("buka", buka);
        tombol.setAttribute("aria-expanded", String(buka));
        document.body.style.overflow = buka ? "hidden" : "";
      });

      menu.querySelectorAll("a").forEach((tautan) => {
        tautan.addEventListener("click", () => {
          menu.classList.remove("buka");
          tombol.classList.remove("buka");
          tombol.setAttribute("aria-expanded", "false");
          document.body.style.overflow = "";
        });
      });
    }
  }

  /* ---------- Animasi gulir (Intersection Observer) ---------- */
  function inisialisasiUngkap() {
    const elemen = document.querySelectorAll(".ungkap");
    if (!elemen.length) return;

    if (!("IntersectionObserver" in window)) {
      elemen.forEach((el) => el.classList.add("terlihat"));
      return;
    }

    const pengamat = new IntersectionObserver(
      (entri) => {
        entri.forEach((item) => {
          if (item.isIntersecting) {
            item.target.classList.add("terlihat");
            pengamat.unobserve(item.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    elemen.forEach((el) => pengamat.observe(el));
  }

  /* ---------- Penghitung statistik ---------- */
  function animasiAngka(elemen, target, durasi, akhiran) {
    const mulai = performance.now();
    const format = (nilai) => {
      const bulat = Math.floor(nilai);
      return bulat.toLocaleString("id-ID") + (akhiran || "");
    };

    const langkah = (waktu) => {
      const progres = Math.min((waktu - mulai) / durasi, 1);
      const easing = 1 - Math.pow(1 - progres, 3);
      elemen.textContent = format(target * easing);
      if (progres < 1) requestAnimationFrame(langkah);
      else elemen.textContent = format(target);
    };

    requestAnimationFrame(langkah);
  }

  function inisialisasiPenghitung() {
    const item = document.querySelectorAll("[data-penghitung]");
    if (!item.length) return;

    const jalankan = (el) => {
      if (el.dataset.selesai === "1") return;
      el.dataset.selesai = "1";
      const target = Number(el.dataset.penghitung) || 0;
      const durasi = Number(el.dataset.durasi) || 1800;
      const akhiran = el.dataset.akhiran || "";
      animasiAngka(el, target, durasi, akhiran);
    };

    if (!("IntersectionObserver" in window)) {
      item.forEach(jalankan);
      return;
    }

    const pengamat = new IntersectionObserver(
      (entri) => {
        entri.forEach((e) => {
          if (e.isIntersecting) {
            jalankan(e.target);
            pengamat.unobserve(e.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    item.forEach((el) => pengamat.observe(el));
  }

  /* ---------- Tahun footer ---------- */
  function perbaruiTahun() {
    document.querySelectorAll("[data-tahun]").forEach((el) => {
      el.textContent = String(new Date().getFullYear());
    });
  }

  /* ---------- Inisialisasi ---------- */
  async function mulai() {
    inisialisasiPemuat();

    await Promise.all([
      muatKomponen("#wadah-navigasi", "navigasi.html"),
      muatKomponen("#wadah-kaki", "kaki.html"),
    ]);

    inisialisasiNavigasi();
    inisialisasiUngkap();
    inisialisasiPenghitung();
    perbaruiTahun();

    document.dispatchEvent(new CustomEvent("di-siap"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mulai);
  } else {
    mulai();
  }
})();
