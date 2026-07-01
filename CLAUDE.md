# Panduan Proyek — Website Alsada (Astro + Sanity)

Situs statis PT Alsada Barokah Nusantara. **Astro 4 + Sanity CMS**, deploy ke **Cloudflare Pages**.

## Perintah (jalankan dari root proyek)

| Perintah | Aksi |
| :-- | :-- |
| `npm install` | Pasang dependency (menjalankan `postinstall.js` yang mem-patch `@astrojs/sitemap` untuk kasus Sanity kosong) |
| `npm run dev` | Dev server di `http://localhost:4321` |
| `npm run build` | Build production ke `./dist` (lalu `postbuild-sitemap.js`) |
| `npm run preview` | Serve hasil build — pakai ini untuk menguji `_headers`/CSP & sitemap |
| `npm run check` | `astro check` — cek tipe & template |
| `cd sanity-studio && npm run dev` | Sanity Studio lokal |

> `_headers` (CSP) & sitemap hanya akurat pada hasil `npm run build`/`npm run preview`, bukan `npm run dev`.

## Struktur singkat

- `src/pages/` — `index`, `tentang`, `kontak`, `artikel/index`, `artikel/[slug]`, `404`
- `src/components/` — Nav, Footer, Hero, About, VideoSection, Products, ArticleRow, Testimonials, CTA, FAQ
- `src/layouts/Layout.astro` — meta, JSON-LD (`@graph`), Open Graph, favicon/manifest
- `src/lib/` — Sanity client + GROQ (`sanity.ts`), Portable Text → HTML (`portable-text.ts`)
- `sanity-studio/` — schema artikel (`schemas/post.ts`)

## Deploy

Sanity publish → webhook → GitHub Actions → Cloudflare Pages. Detail: `SANITY-WEBHOOK-SETUP.md`.

## Kalau mengubah isi JSON-LD (`Layout.astro` / `FAQ.astro`)

Hash CSP di `public/_headers` WAJIB dihitung ulang. Caranya: `docs/google-sheets-integration.md` §Regenerasi hash CSP.

## Environment variables

`PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET` (lihat `.env.example`). Jangan commit `.env`.

## Dokumentasi Astro

https://docs.astro.build
