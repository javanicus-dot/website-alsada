import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemas";

/**
 * Konfigurasi Sanity Studio untuk Alsada.
 *
 * CARA SETUP:
 * 1. Daftar/login di https://www.sanity.io
 * 2. Buat project baru (kosongkan semua template)
 * 3. Copy Project ID dari dashboard Sanity
 * 4. Ganti YOUR_PROJECT_ID di bawah dengan Project ID kamu
 * 5. Set dataset name ke "production"
 * 6. Run `npm install` lalu `npm run dev` untuk mulai Studio lokal
 * 7. Run `npm run deploy` untuk deploy Studio ke hosting Sanity
 *
 * Setelah setup, Astro project butuh:
 * - PUBLIC_SANITY_PROJECT_ID (sama dengan di bawah)
 * - PUBLIC_SANITY_DATASET (sama dengan di bawah, default "production")
 */

export default defineConfig({
  name: "alsada",
  title: "Alsada Barokah Nusantara — Studio",

  projectId: "fisaenba", // ← GANTI dengan Project ID dari sanity.io
  dataset: "production",

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
});
