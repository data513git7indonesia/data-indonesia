/**
 * Data Indonesia — Dashboard Data
 * Grafik ringan dengan Chart.js (dimuat hanya di halaman dashboard)
 */

(function () {
  "use strict";

  const WARNA = {
    emas: "#d4af37",
    emasHalus: "rgba(212, 175, 55, 0.25)",
    teks: "#a8a29a",
    garis: "rgba(212, 175, 55, 0.15)",
  };

  function opsiDasar() {
    return {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: { color: WARNA.teks, font: { family: "Sora", size: 11 } },
        },
        tooltip: {
          backgroundColor: "#111",
          titleColor: "#f0d78c",
          bodyColor: "#f3f0e8",
          borderColor: WARNA.emas,
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          ticks: { color: WARNA.teks, font: { size: 11 } },
          grid: { color: WARNA.garis },
        },
        y: {
          ticks: { color: WARNA.teks, font: { size: 11 } },
          grid: { color: WARNA.garis },
        },
      },
    };
  }

  function buatGrafikTren() {
    const kanvas = document.getElementById("grafik-tren");
    if (!kanvas || typeof Chart === "undefined") return;

    new Chart(kanvas, {
      type: "line",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul"],
        datasets: [
          {
            label: "Volume Data (TB)",
            data: [12, 19, 24, 31, 38, 45, 52],
            borderColor: WARNA.emas,
            backgroundColor: WARNA.emasHalus,
            fill: true,
            tension: 0.35,
            pointRadius: 4,
            pointBackgroundColor: WARNA.emas,
          },
        ],
      },
      options: opsiDasar(),
    });
  }

  function buatGrafikSektor() {
    const kanvas = document.getElementById("grafik-sektor");
    if (!kanvas || typeof Chart === "undefined") return;

    new Chart(kanvas, {
      type: "doughnut",
      data: {
        labels: ["Pemerintah", "Swasta", "Pendidikan", "Lainnya"],
        datasets: [
          {
            data: [38, 32, 18, 12],
            backgroundColor: ["#d4af37", "#a8862a", "#f0d78c", "#5c4a1e"],
            borderColor: "#161616",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: WARNA.teks, font: { family: "Sora", size: 11 }, padding: 14 },
          },
        },
        cutout: "62%",
      },
    });
  }

  function buatGrafikWilayah() {
    const kanvas = document.getElementById("grafik-wilayah");
    if (!kanvas || typeof Chart === "undefined") return;

    new Chart(kanvas, {
      type: "bar",
      data: {
        labels: ["Jawa", "Sumatera", "Kalimantan", "Sulawesi", "Bali-Nusa", "Papua"],
        datasets: [
          {
            label: "Proyek Aktif",
            data: [42, 28, 16, 14, 11, 8],
            backgroundColor: WARNA.emas,
            borderRadius: 2,
            maxBarThickness: 36,
          },
        ],
      },
      options: opsiDasar(),
    });
  }

  function mulai() {
    if (typeof Chart === "undefined") {
      console.warn("Chart.js belum dimuat.");
      return;
    }
    Chart.defaults.color = WARNA.teks;
    Chart.defaults.font.family = "Sora, sans-serif";
    buatGrafikTren();
    buatGrafikSektor();
    buatGrafikWilayah();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mulai);
  } else {
    mulai();
  }
})();
