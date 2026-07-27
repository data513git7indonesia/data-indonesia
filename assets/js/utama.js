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
    const sedangProduk = halaman === "produk.html" || halaman.startsWith("produk-");

    document.querySelectorAll(".navigasi__tautan").forEach((tautan) => {
      const href = (tautan.getAttribute("href") || "").toLowerCase();
      if (href === halaman || (halaman === "" && href === "index.html")) {
        tautan.classList.add("aktif");
      }
    });

    document.querySelectorAll(".navigasi__submenu-tautan").forEach((tautan) => {
      const href = (tautan.getAttribute("href") || "").toLowerCase();
      if (href === halaman) tautan.classList.add("aktif");
    });

    if (sedangProduk) {
      document.querySelector(".navigasi__tautan--produk")?.classList.add("aktif");
    }

    const perbaruiGulir = () => {
      navigasi.classList.toggle("menggulir", window.scrollY > 24);
    };
    perbaruiGulir();
    window.addEventListener("scroll", perbaruiGulir, { passive: true });

    /* Dropdown Product — klik & hover yang andal */
    const dropdown = document.getElementById("dropdown-produk");
    const tombolProduk = document.getElementById("tombol-produk");
    const panelProduk = document.getElementById("menu-produk");

    const setDropdown = (buka) => {
      if (!dropdown || !tombolProduk) return;
      dropdown.classList.toggle("buka", buka);
      tombolProduk.setAttribute("aria-expanded", String(buka));
    };

    if (dropdown && tombolProduk && panelProduk) {
      tombolProduk.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDropdown(!dropdown.classList.contains("buka"));
      });

      /* Di mobile: ketuk label Product juga membuka daftar */
      const linkProduk = dropdown.querySelector("[data-produk-link]");
      linkProduk?.addEventListener("click", (e) => {
        if (window.matchMedia("(max-width: 960px)").matches) {
          if (!dropdown.classList.contains("buka")) {
            e.preventDefault();
            setDropdown(true);
          }
        }
      });

      document.addEventListener("click", (e) => {
        if (!dropdown.contains(e.target)) setDropdown(false);
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") setDropdown(false);
      });

      panelProduk.querySelectorAll("a").forEach((tautan) => {
        tautan.addEventListener("click", () => setDropdown(false));
      });
    }

    if (tombol && menu) {
      tombol.addEventListener("click", () => {
        const buka = menu.classList.toggle("buka");
        tombol.classList.toggle("buka", buka);
        tombol.setAttribute("aria-expanded", String(buka));
        document.body.style.overflow = buka ? "hidden" : "";
        if (!buka) setDropdown(false);
      });

      menu.querySelectorAll("a").forEach((tautan) => {
        tautan.addEventListener("click", () => {
          /* Di mobile, ketuk "Product" hanya membuka submenu — jangan tutup hamburger */
          if (
            tautan.matches("[data-produk-link]") &&
            window.matchMedia("(max-width: 960px)").matches
          ) {
            return;
          }
          menu.classList.remove("buka");
          tombol.classList.remove("buka");
          tombol.setAttribute("aria-expanded", "false");
          document.body.style.overflow = "";
          setDropdown(false);
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

  /* ---------- Slider judul (hero) ---------- */
  function inisialisasiSlider() {
    const akar = document.getElementById("slider-judul");
    if (!akar) return;

    const slide = Array.from(akar.querySelectorAll(".slider-judul__slide"));
    const titik = Array.from(akar.querySelectorAll(".slider-judul__titik"));
    const panah = akar.querySelectorAll(".slider-judul__panah");
    const batangProgres = akar.querySelector(".slider-judul__progres span");
    const total = slide.length;
    if (!total) return;

    let indeks = slide.findIndex((s) => s.classList.contains("aktif"));
    if (indeks < 0) indeks = 0;

    const kurangiGerak = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const durasi = kurangiGerak ? 999999 : 6500;
    let pengatur = null;
    let sentuhX = 0;

    const muatGambar = (i) => {
      const img = slide[i]?.querySelector("img");
      if (img && img.loading === "lazy") img.loading = "eager";
    };

    const setProgres = () => {
      if (!batangProgres) return;
      batangProgres.style.animation = "none";
      void batangProgres.offsetWidth;
      if (!kurangiGerak) {
        batangProgres.style.animation = "";
      }
    };

    const setTitik = () => {
      titik.forEach((t, i) => {
        const aktif = i === indeks;
        t.classList.toggle("aktif", aktif);
        t.setAttribute("aria-selected", String(aktif));
        const isi = t.querySelector("span");
        if (!isi) return;
        isi.style.animation = "none";
        void isi.offsetWidth;
        if (aktif && !kurangiGerak) isi.style.animation = "";
      });
    };

    const tampilkan = (baru) => {
      indeks = (baru + total) % total;
      slide.forEach((s, i) => {
        const aktif = i === indeks;
        s.classList.toggle("aktif", aktif);
        s.setAttribute("aria-hidden", String(!aktif));
      });
      muatGambar(indeks);
      muatGambar((indeks + 1) % total);
      setTitik();
      setProgres();
    };

    const berikutnya = () => tampilkan(indeks + 1);
    const sebelumnya = () => tampilkan(indeks - 1);

    const mulaiOtomatis = () => {
      hentikanOtomatis();
      if (kurangiGerak) return;
      pengatur = window.setInterval(berikutnya, durasi);
    };

    const hentikanOtomatis = () => {
      if (pengatur) {
        clearInterval(pengatur);
        pengatur = null;
      }
    };

    panah.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.dataset.arah === "prev") sebelumnya();
        else berikutnya();
        mulaiOtomatis();
      });
    });

    titik.forEach((t) => {
      t.addEventListener("click", () => {
        tampilkan(Number(t.dataset.ke) || 0);
        mulaiOtomatis();
      });
    });

    akar.addEventListener("mouseenter", () => {
      akar.classList.add("dijeda");
      hentikanOtomatis();
    });
    akar.addEventListener("mouseleave", () => {
      akar.classList.remove("dijeda");
      mulaiOtomatis();
    });
    akar.addEventListener("focusin", () => {
      akar.classList.add("dijeda");
      hentikanOtomatis();
    });
    akar.addEventListener("focusout", (e) => {
      if (!akar.contains(e.relatedTarget)) {
        akar.classList.remove("dijeda");
        mulaiOtomatis();
      }
    });

    akar.addEventListener(
      "touchstart",
      (e) => {
        sentuhX = e.changedTouches[0].screenX;
      },
      { passive: true }
    );
    akar.addEventListener(
      "touchend",
      (e) => {
        const delta = e.changedTouches[0].screenX - sentuhX;
        if (Math.abs(delta) < 48) return;
        if (delta > 0) sebelumnya();
        else berikutnya();
        mulaiOtomatis();
      },
      { passive: true }
    );

    document.addEventListener("keydown", (e) => {
      if (!akar.offsetParent) return;
      if (e.key === "ArrowLeft") {
        sebelumnya();
        mulaiOtomatis();
      } else if (e.key === "ArrowRight") {
        berikutnya();
        mulaiOtomatis();
      }
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) hentikanOtomatis();
      else mulaiOtomatis();
    });

    tampilkan(indeks);
    mulaiOtomatis();
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

    if (!document.getElementById("wadah-obrolan")) {
      const wadah = document.createElement("div");
      wadah.id = "wadah-obrolan";
      document.body.appendChild(wadah);
    }

    if (!document.getElementById("wadah-sosial")) {
      const wadahSosial = document.createElement("div");
      wadahSosial.id = "wadah-sosial";
      document.body.appendChild(wadahSosial);
    }

    await Promise.all([
      muatKomponen("#wadah-navigasi", "navigasi.html"),
      muatKomponen("#wadah-kaki", "kaki.html"),
      muatKomponen("#wadah-obrolan", "obrolan.html"),
      muatKomponen("#wadah-sosial", "sosial.html"),
    ]);

    inisialisasiNavigasi();
    inisialisasiSlider();
    inisialisasiUngkap();
    inisialisasiPenghitung();
    perbaruiTahun();

    if (typeof window.inisialisasiObrolan === "function") {
      window.inisialisasiObrolan();
    }

    if (typeof window.inisialisasiSosial === "function") {
      window.inisialisasiSosial();
    }

    document.dispatchEvent(new CustomEvent("di-siap"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mulai);
  } else {
    mulai();
  }
})();
