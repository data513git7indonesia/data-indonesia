/**
 * Cloudflare Worker — API Obrolan AI Data Indonesia
 *
 * Cara pakai (opsional, untuk produksi):
 * 1. Buat Worker baru, tempel skrip ini
 * 2. Settings → Variables → AI binding bernama "AI" (Workers AI)
 * 3. Deploy, lalu isi KONFIG.urlApi di assets/js/obrolan.js
 *    contoh: "https://data-indonesia.data-indonesia21.workers.dev/api/obrolan"
 */

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    const url = new URL(request.url);
    if (request.method !== "POST" || !url.pathname.endsWith("/api/obrolan")) {
      return new Response(JSON.stringify({ error: "Tidak ditemukan" }), {
        status: 404,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    try {
      const body = await request.json();
      const pesan = String(body.pesan || "").trim();
      const riwayat = Array.isArray(body.riwayat) ? body.riwayat.slice(-12) : [];

      if (!pesan) {
        return new Response(JSON.stringify({ error: "Pesan kosong" }), {
          status: 400,
          headers: { ...cors, "Content-Type": "application/json" },
        });
      }

      const sistem =
        "Anda adalah Asisten DI, chatbot resmi Data Indonesia. Jawab ringkas dalam Bahasa Indonesia. " +
        "Layanan: SaaS, CRM, Accounting AI, Industry Intelligence, Presentasi AI, integrasi data, dashboard, keamanan. " +
        "Kontak: email data.indonesia21@gmail.com.";

      const messages = [
        { role: "system", content: sistem },
        ...riwayat.map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: String(m.content || "").slice(0, 2000),
        })),
        { role: "user", content: pesan.slice(0, 2000) },
      ];

      let balasan = "";

      if (env.AI) {
        const hasil = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", { messages });
        balasan = String(hasil.response || hasil.result || "").trim();
      }

      if (!balasan) {
        balasan =
          "Terima kasih. Tim Data Indonesia siap membantu. Silakan lanjutkan pertanyaan Anda atau hubungi data.indonesia21@gmail.com.";
      }

      return new Response(JSON.stringify({ balasan }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: "Gagal memproses", detail: String(err) }), {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
  },
};
