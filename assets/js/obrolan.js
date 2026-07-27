/**
 * Data Indonesia — Obrolan AI Pengunjung
 * Tombol pojok kanan bawah + balasan AI
 */

(function () {
  "use strict";

  const KONFIG = {
    /* Opsional: endpoint sendiri (Cloudflare Worker / API). Kosongkan = pakai AI publik. */
    urlApi: "",
    namaAsisten: "Asisten DI",
    pesanSambutan:
      "Halo! Saya asisten AI Data Indonesia. Silakan tanyakan layanan SaaS, CRM, Accounting AI, Industri, presentasi, atau jadwalkan konsultasi.",
    saranCepat: ["Apa saja layanan Anda?", "Bagaimana cara konsultasi?", "Apa itu Accounting AI?"],
  };

  const PROMPT_SISTEM = [
    "Anda adalah Asisten DI, chatbot resmi Data Indonesia.",
    "Jawab dalam Bahasa Indonesia yang sopan, ringkas, dan profesional (maksimal 3 paragraf pendek).",
    "Data Indonesia adalah perusahaan solusi data kelas enterprise (hitam & emas) dengan layanan:",
    "- SaaS Solusi data & analitik",
    "- CRM Solusi untuk pipeline & pelanggan",
    "- Accounting AI untuk keuangan cerdas",
    "- Industry Intelligence untuk operasional industri",
    "- Presentasi AI untuk eksekutif",
    "- Integrasi data, keamanan, dashboard, dan konsultasi tata kelola",
    "Kontak: email data.indonesia21@gmail.com. Form kontak di halaman kontak.html.",
    "Jika ditanya harga, jelaskan bahwa penawaran disesuaikan kebutuhan dan arahkan ke konsultasi/form kontak.",
    "Jangan mengarang fakta hukum/keuangan sensitif. Jika tidak tahu, sarankan menghubungi tim manusia.",
  ].join(" ");

  let riwayat = [];
  let sedangKirim = false;
  let sudahSambutan = false;

  function el(id) {
    return document.getElementById(id);
  }

  function escapeHtml(teks) {
    return String(teks)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatPesan(teks) {
    return escapeHtml(teks).replace(/\n/g, "<br>");
  }

  function waktuSekarang() {
    return new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  }

  function tambahGelembung(peran, teks) {
    const wadah = el("obrolan-pesan");
    if (!wadah) return;

    const item = document.createElement("div");
    item.className = "obrolan__item obrolan__item--" + peran;
    item.innerHTML =
      '<div class="obrolan__gelembung">' +
      formatPesan(teks) +
      '</div><time class="obrolan__waktu">' +
      waktuSekarang() +
      "</time>";
    wadah.appendChild(item);
    wadah.scrollTop = wadah.scrollHeight;
  }

  function setMengetik(tampil) {
    const wadah = el("obrolan-pesan");
    if (!wadah) return;
    let ketik = wadah.querySelector(".obrolan__mengetik");
    if (!tampil) {
      if (ketik) ketik.remove();
      return;
    }
    if (ketik) return;
    ketik = document.createElement("div");
    ketik.className = "obrolan__item obrolan__item--asisten obrolan__mengetik";
    ketik.innerHTML =
      '<div class="obrolan__gelembung obrolan__gelembung--ketik" aria-label="AI sedang mengetik">' +
      "<span></span><span></span><span></span></div>";
    wadah.appendChild(ketik);
    wadah.scrollTop = wadah.scrollHeight;
  }

  function tampilkanSambutan() {
    if (sudahSambutan) return;
    sudahSambutan = true;
    tambahGelembung("asisten", KONFIG.pesanSambutan);

    const wadah = el("obrolan-pesan");
    if (!wadah || !KONFIG.saranCepat.length) return;

    const baris = document.createElement("div");
    baris.className = "obrolan__saran";
    KONFIG.saranCepat.forEach((teks) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "obrolan__saran-item";
      btn.textContent = teks;
      btn.addEventListener("click", () => kirimPesan(teks));
      baris.appendChild(btn);
    });
    wadah.appendChild(baris);
  }

  function balasanCadangan(pesan) {
    const p = pesan.toLowerCase();
    if (/halo|hai|hi|selamat/.test(p)) {
      return "Halo! Ada yang bisa saya bantu terkait layanan Data Indonesia?";
    }
    if (/harga|biaya|paket|tarif/.test(p)) {
      return "Penawaran kami disesuaikan dengan kebutuhan organisasi Anda. Silakan isi formulir di halaman Kontak atau email data.indonesia21@gmail.com agar tim kami menyiapkan estimasi.";
    }
    if (/crm/.test(p)) {
      return "CRM Solusi Data Indonesia membantu mengelola pelanggan, pipeline penjualan, dan analitik secara terintegrasi. Ingin saya jelaskan fitur utamanya atau cara demo?";
    }
    if (/account|keuangan|akuntan/.test(p)) {
      return "Accounting AI mengotomasi laporan keuangan, insight real-time, dan kontrol anggaran. Cocok untuk tim finance yang ingin keputusan lebih cepat.";
    }
    if (/industri|produksi|pabrik/.test(p)) {
      return "Industry Intelligence memantau produksi, efisiensi, dan status peralatan secara real-time agar keputusan operasional lebih tepat.";
    }
    if (/saas|dashboard|analitik|data/.test(p)) {
      return "SaaS Solusi kami menyatukan analitik, visualisasi, dan pengelolaan data skala perusahaan. Anda bisa melihat contohnya di halaman Dashboard dan Layanan.";
    }
    if (/kontak|konsultasi|hubungi|demo|meeting/.test(p)) {
      return "Untuk konsultasi atau demo, buka halaman Kontak atau email data.indonesia21@gmail.com. Tim kami siap membantu.";
    }
    if (/layanan|produk|solusi/.test(p)) {
      return "Layanan utama kami: SaaS Solusi, CRM, Accounting AI, Industry Intelligence, Presentasi AI, plus integrasi data, keamanan, dan dashboard eksekutif. Mau fokus ke salah satu?";
    }
    return "Terima kasih atas pertanyaannya. Saya asisten AI Data Indonesia — Anda bisa menanyakan layanan, demo, atau cara menghubungi tim. Untuk kebutuhan khusus, tim kami siap di halaman Kontak.";
  }

  async function mintaBalasanAI(pesanPengguna) {
    const pesanApi = [
      { role: "system", content: PROMPT_SISTEM },
      ...riwayat,
      { role: "user", content: pesanPengguna },
    ];

    if (KONFIG.urlApi) {
      const respons = await fetch(KONFIG.urlApi, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pesan: pesanPengguna, riwayat }),
      });
      if (!respons.ok) throw new Error("API gagal");
      const data = await respons.json();
      const teks = data.balasan || data.message || data.reply;
      if (!teks) throw new Error("Balasan kosong");
      return String(teks).trim();
    }

    const respons = await fetch("https://text.pollinations.ai/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai",
        messages: pesanApi,
        private: true,
      }),
    });

    if (!respons.ok) throw new Error("AI publik gagal");

    const tipe = respons.headers.get("content-type") || "";
    if (tipe.includes("application/json")) {
      const data = await respons.json();
      const teks =
        data?.choices?.[0]?.message?.content ||
        data?.content ||
        data?.text ||
        data?.balasan;
      if (!teks) throw new Error("Format AI tidak dikenali");
      return String(teks).trim();
    }

    const teks = (await respons.text()).trim();
    if (!teks) throw new Error("Balasan kosong");
    return teks;
  }

  async function kirimPesan(teksMentah) {
    const input = el("obrolan-input");
    const teks = (teksMentah || input?.value || "").trim();
    if (!teks || sedangKirim) return;

    const saran = document.querySelector(".obrolan__saran");
    if (saran) saran.remove();

    if (input) {
      input.value = "";
      input.style.height = "auto";
    }

    tambahGelembung("pengunjung", teks);
    sedangKirim = true;
    const tombolKirim = el("obrolan-kirim");
    if (tombolKirim) tombolKirim.disabled = true;
    setMengetik(true);

    try {
      const balasan = await mintaBalasanAI(teks);
      riwayat.push({ role: "user", content: teks });
      riwayat.push({ role: "assistant", content: balasan });
      if (riwayat.length > 16) riwayat = riwayat.slice(-16);
      setMengetik(false);
      tambahGelembung("asisten", balasan);
    } catch (galat) {
      console.warn("Obrolan AI:", galat);
      const cadangan = balasanCadangan(teks);
      riwayat.push({ role: "user", content: teks });
      riwayat.push({ role: "assistant", content: cadangan });
      setMengetik(false);
      tambahGelembung("asisten", cadangan);
    } finally {
      sedangKirim = false;
      if (tombolKirim) tombolKirim.disabled = false;
      input?.focus();
    }
  }

  function bukaPanel(buka) {
    const panel = el("obrolan-panel");
    const tombol = el("obrolan-tombol");
    const akar = el("obrolan");
    const badge = el("obrolan-badge");
    if (!panel || !tombol || !akar) return;

    panel.hidden = !buka;
    akar.classList.toggle("obrolan--buka", buka);
    tombol.setAttribute("aria-expanded", String(buka));
    tombol.setAttribute("aria-label", buka ? "Tutup chat asisten AI" : "Buka chat asisten AI");

    if (buka) {
      if (badge) badge.hidden = true;
      tampilkanSambutan();
      el("obrolan-input")?.focus();
    }
  }

  function inisialisasiObrolan() {
    const akar = el("obrolan");
    if (!akar || akar.dataset.siap === "1") return;
    akar.dataset.siap = "1";

    const tombol = el("obrolan-tombol");
    const tutup = el("obrolan-tutup");
    const form = el("obrolan-form");
    const input = el("obrolan-input");
    const badge = el("obrolan-badge");

    tombol?.addEventListener("click", () => {
      const buka = !akar.classList.contains("obrolan--buka");
      bukaPanel(buka);
    });
    tutup?.addEventListener("click", () => bukaPanel(false));

    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      kirimPesan();
    });

    input?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        kirimPesan();
      }
    });

    input?.addEventListener("input", () => {
      input.style.height = "auto";
      input.style.height = Math.min(input.scrollHeight, 110) + "px";
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && akar.classList.contains("obrolan--buka")) {
        bukaPanel(false);
      }
    });

    if (badge) {
      badge.hidden = false;
      badge.textContent = "1";
    }
  }

  window.inisialisasiObrolan = inisialisasiObrolan;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      if (el("obrolan")) inisialisasiObrolan();
    });
  } else if (el("obrolan")) {
    inisialisasiObrolan();
  }

  document.addEventListener("di-siap", () => {
    if (el("obrolan")) inisialisasiObrolan();
  });
})();
