# Audit Fixes — Status Terkini

> Domain produksi saat ini: **`alsada.co.id`** (lihat `astro.config.mjs`).

## ✅ Sudah diperbaiki di kode (gelombang 1)

1. **Konten blank tanpa JS** — `src/styles/global.css` + `src/layouts/Layout.astro`:
   fallback `@media (prefers-reduced-motion: reduce)` + `<noscript>` agar `.reveal` tetap terlihat.
2. **Halaman 404** — `src/pages/404.astro` (otomatis jadi `/404.html` saat build).
3. **JSON-LD lolos CSP** — `public/_headers`: hash `sha256-TjD6coXR4aFxMk2PcLHU32Xpmga3066HNuB/kHfmGxk=`
   pada `script-src` (TANPA `unsafe-inline`). Hash ini cocok untuk JSON-LD domain `alsada.co.id`.
4. **Sitemap & robots** — `@astrojs/sitemap` di `astro.config.mjs` + `public/robots.txt`.
5. **.gitignore + .env.example** — `.env` asli di-ignore.
6. **Aksesibilitas fokus** — `:focus-visible` + outline field form.
7. **Favicon** — set lengkap di Layout: `favicon.svg`, `favicon.ico`, `favicon-96.png`, `apple-touch-icon.png`, `icon-192/512.png`, `site.webmanifest` (dibuat dari `logo.png`).
8. **Hero LCP** — `<link rel="preload">` hero.jpg khusus homepage.
9. **Social link footer** — IG & WA sudah diisi URL asli di `src/components/Footer.astro`.
10. **Aset** — `og-image.jpg` (1200×630) & `video-cover.jpg` sudah ada.

## ✅ Diperbaiki di kode (gelombang 2 — audit menyeluruh)

1. **URL webhook form disamakan** — `src/pages/kontak.astro` kini memakai deployment yang
   ditandai AKTIF di `docs/google-sheets-integration.md`
   (`…AKfycbyiDXX7vVxE…`), bukan URL lama (`…AKfycbxLAdoXNS7r…`).
2. **Link mati footer** — alamat "Purbalingga … & Nagekeo, NTT" tidak lagi `href="#"`;
   diganti `<span class="foot-loc">` (+ styling di `global.css`).
3. **Turnstile hanya di /kontak** — skrip `api.js` dipindah dari `Layout.astro` (global)
   ke `src/pages/kontak.astro` (`slot="head"`). Halaman lain jadi lebih ringan.
4. **A11y burger menu** — tombol burger diberi `aria-controls` + `aria-expanded`
   yang di-toggle lewat JS (`src/components/Nav.astro`).
5. **OG image lengkap** — `og:image:width/height/alt` ditambah di `Layout.astro`.
6. **Script `check`** — `"check": "astro check"` ditambah di `package.json`.

## 🙋 Masih perlu kamu kerjakan (di luar kode / butuh keputusan)

- [ ] **Uji form end-to-end di domain produksi.** Klien membaca `res.json()`; Apps Script `/exec`
      sering redirect ke `script.googleusercontent.com` yang TIDAK kirim header CORS → respons
      bisa tak terbaca → UI tampil error walau data masuk. Kalau bermasalah, pasang Cloudflare
      Worker tipis sebagai proxy CORS (lihat docs).
- [ ] **Turnstile**: pastikan `TURNSTILE_SECRET` ter-set di Script Properties Apps Script,
      dan site key `0x4AAAAAADtJ0fYZwDPE9bDW` terdaftar untuk domain produksi. Kalau tidak,
      SEMUA submit ditolak (Code.gs fail-closed).
- [ ] **Deploy hook Sanity → Cloudflare Pages** supaya artikel baru otomatis ter-publish
      (situs static; tanpa hook artikel baru tak muncul sampai rebuild).
- [ ] **Video asli**: `public/assets/video-v3.webm` (~1,4 MB) + fallback `video-v3.mp4` — pastikan
      ini footage asli (bukan placeholder) dan sudah terkompres.
- [ ] **Verifikasi konten**: testimoni (`Testimonials.astro`) & klaim angka ("12 peternak",
      "8 bulan") di `FAQ.astro` — pastikan asli, bukan dummy. Cek juga data legal (NIB/NPWP/KH-1).
- [ ] **Untrack `.env`** dari git: `git rm --cached .env`.
- [ ] **Set env di Cloudflare Pages**: `PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET`.
- [ ] Jalankan `npm install` → `npm run check` → `npm run build` dan pastikan bersih sebelum deploy.

## 🔁 Checklist pindah domain

Ubah SEMUA titik berikut bersamaan, kalau tidak ada yang rusak:

1. `astro.config.mjs` → `site`.
2. `public/robots.txt` → URL `Sitemap:`.
3. Link & info domain di `src/pages/kontak.astro` (dan footer bila ada).
4. Daftarkan domain baru di widget Turnstile (Cloudflare dashboard).
5. **Regenerasi hash CSP** di `public/_headers` — isi JSON-LD memuat domain, jadi hash berubah.
   Cara hitung ada di `docs/google-sheets-integration.md` (§Regenerasi hash CSP).
