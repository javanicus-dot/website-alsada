import { defineCliConfig } from "sanity/cli";

/**
 * Konfigurasi CLI Sanity.
 *
 * File INI yang dipakai saat menjalankan `sanity deploy`, `sanity dev`, dll
 * (berbeda dari sanity.config.ts yang dipakai oleh Studio untuk runtime).
 *
 * PENTING: projectId di sini HARUS sama dengan di sanity.config.ts.
 * Ganti YOUR_PROJECT_ID dengan Project ID asli dari dashboard sanity.io.
 */

export default defineCliConfig({
  api: {
    projectId: "fisaenba", // ← GANTI dengan Project ID dari sanity.io (SAMA dengan sanity.config.ts)
    dataset: "production",
  },
});
