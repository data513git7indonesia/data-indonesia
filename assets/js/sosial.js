/**
 * Data Indonesia — Media sosial (sidebar + footer)
 */
(function () {
  "use strict";

  function inisialisasiSosialBar() {
    const bar = document.getElementById("sosial-bar");
    const toggle = document.getElementById("sosial-bar-toggle");
    if (!bar || !toggle || bar.dataset.siap === "1") return;
    bar.dataset.siap = "1";

    const setBuka = (buka) => {
      bar.classList.toggle("sosial-bar--buka", buka);
      toggle.setAttribute("aria-expanded", String(buka));
      toggle.setAttribute(
        "aria-label",
        buka ? "Tutup menu media sosial" : "Buka menu media sosial"
      );
    };

    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      setBuka(!bar.classList.contains("sosial-bar--buka"));
    });

    document.addEventListener("click", (e) => {
      if (!bar.contains(e.target)) setBuka(false);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setBuka(false);
    });
  }

  function terapkanTautanSosial() {
    const cfg = window.KONFIG_SOSIAL;
    if (!cfg) return;

    document.querySelectorAll("[data-sosial]").forEach((el) => {
      const kunci = el.getAttribute("data-sosial");
      const url = cfg[kunci];
      if (url) el.setAttribute("href", url);
    });

    /* Sidebar memakai title sebagai kunci tampilan */
    const petaJudul = {
      Facebook: cfg.facebook,
      Instagram: cfg.instagram,
      LinkedIn: cfg.linkedin,
      YouTube: cfg.youtube,
      TikTok: cfg.tiktok,
      WhatsApp: cfg.whatsapp,
      Telegram: cfg.telegram,
      X: cfg.x,
      Lynk: cfg.lynk,
      Email: cfg.email,
    };

    document.querySelectorAll(".sosial-bar__item[title]").forEach((el) => {
      const url = petaJudul[el.getAttribute("title")];
      if (url) el.setAttribute("href", url);
    });
  }

  window.inisialisasiSosial = function () {
    inisialisasiSosialBar();
    terapkanTautanSosial();
  };

  document.addEventListener("di-siap", () => window.inisialisasiSosial());
})();
