# Paket Perbaikan Website Alsada (SEO, Crawl & Favicon)

Isi ZIP ini **HANYA file yang berubah / baru**. Salin menimpa file dengan path yang sama
di project kamu, mengikuti struktur folder di bawah. Lalu `npm run build` & deploy ulang.

## Struktur & cara pasang
```
public/favicon.svg          -> TIMPA (dulu logo default Astro, sekarang logo brand)
public/favicon.ico          -> TIMPA (sekarang dari logo brand, 16/32/48)
public/favicon-96.png       -> BARU
public/apple-touch-icon.png -> BARU
public/icon-192.png         -> BARU
public/icon-512.png         -> BARU
public/site.webmanifest     -> BARU
public/_headers             -> TIMPA (hash CSP JSON-LD diregenerasi)
astro.config.mjs            -> TIMPA (trailingSlash)
src/layouts/Layout.astro    -> TIMPA
src/pages/404.astro         -> TIMPA
src/pages/artikel/[slug].astro -> TIMPA
src/lib/sanity.ts           -> TIMPA
```

## Yang diperbaiki

### 1. FAVICON (akar masalah "logo di Google beda")
- `favicon.svg` sebelumnya masih **logo default template Astro (huruf "A")** — sekarang
  diganti dengan **logo brand Alsada** yang sama dengan `favicon.ico`, `logo.png`, & app icon.
- Ditambah set ikon lengkap: `favicon-96.png`, `apple-touch-icon.png` (180), `icon-192.png`,
  `icon-512.png`, dan `site.webmanifest`.
- Semua ikon sekarang KONSISTEN memakai satu mark.
- CATATAN: sumbernya `assets/logo.png` cuma 100×100 px, jadi ikon besar sedikit kurang
  tajam. Untuk hasil terbaik, kirim logo master ≥512×512 lalu regenerasi.
- Setelah deploy: buka Google Search Console → URL Inspection homepage → Request Indexing,
  supaya cache favicon Google dipaksa refresh (bisa perlu beberapa hari).

### 2. SEO
- **Title homepage** kini ber-keyword: "Peternakan Sapi Modern & Susu FH Segar | PT Alsada...".
- **Meta keywords** yang usang dihapus.
- **NAP structured data** diseragamkan ke alamat kantor (Jl. Raya Selaganggeng, Mrebet,
  Purbalingga) + postalCode, agar konsisten dengan halaman & FAQ.
  >> HARAP VERIFIKASI: pastikan ini memang alamat resmi/terdaftar. Ganti bila perlu
     (jangan lupa: kalau objek JSON-LD di Layout diubah, regenerasi hash di _headers).
- **dateModified artikel** kini diambil dari `_updatedAt` Sanity (sinyal freshness), bukan
  disamakan dengan tanggal publish.
- **BreadcrumbList** ditambahkan di halaman artikel (peluang rich result breadcrumb).

### 3. CRAWL
- **Soft-404 diperbaiki**: `artikel/[slug].astro` tidak lagi redirect ke /404, tapi
  mengembalikan **HTTP 404 asli**.
- **Halaman 404 kini `noindex`** (Layout mendukung prop `noindex`).
- **trailingSlash: 'always'** di `astro.config.mjs` → canonical konsisten dengan sitemap
  (menghindari duplikat /artikel vs /artikel/).

### 4. CSP
- Hash SHA-256 JSON-LD di `public/_headers` diregenerasi mengikuti perubahan structured
  data di Layout (`sha256-TjD6coXR4aFxMk2PcLHU32Xpmga3066HNuB/kHfmGxk=`).

## Belum saya ubah (butuh keputusanmu / data eksternal)
- Ukuran `assets/logo.png` (butuh master resolusi tinggi).
- Memasang env Sanity di Cloudflare Pages (di luar file kode).
- Koordinat geo / jam operasional untuk LocalBusiness (tidak saya isi agar tidak salah).

---

## Pembaruan lanjutan — Meta, dokumentasi usang & dead code

### A. Meta title/description disesuaikan dengan isi konten
- **`src/pages/artikel/index.astro`** — dulu deskripsi berbunyi “Update harian tentang…” dan badge “Update Harian”, padahal isi halaman adalah wawasan/praktik peternakan (bukan konten harian). Diselaraskan:
  - Title → “Artikel & Wawasan Peternakan — PT Alsada Barokah Nusantara” (cocok dengan H1 halaman).
  - Description → “Wawasan dan praktik peternakan modern dari Alsada: sapi FH, jual-beli sapi, daging premium, breeding, dan ketahanan pangan.”
  - Badge “Update Harian” → “Wawasan Peternakan” (menghapus klaim berlebih).
- Halaman lain (homepage, tentang, kontak, 404, artikel/[slug]) sudah diperiksa: meta title/description-nya SUDAH sesuai isi konten — tidak ada perubahan lain yang diperlukan. (Homepage title & default sudah diperbaiki di gelombang sebelumnya.)

### B. Video: tambah fallback MP4 (kompatibilitas Safari/iOS)
- **`src/components/VideoSection.astro`** — sebelumnya hanya ada satu `<source>` WebM (VP9). Ditambahkan `<source>` MP4 (H.264) sebagai fallback + komentar usang diperbarui.
- **`public/assets/video-v3.mp4`** (BARU) — hasil transcode dari `video-v3.webm`.

### C. Dokumentasi usang dirapikan
- **`AGENTS.md` & `CLAUDE.md`** — sebelumnya boilerplate template Astro dengan perintah yang tidak ada (mis. `astro dev --background`, `astro dev stop`). Ditulis ulang menjadi panduan proyek yang akurat (perintah npm, struktur, deploy, aturan hash CSP, env).
- **`README.md`** — klaim form “`no-cors` POST” sudah usang; diperbaiki menjadi CORS (`Content-Type: text/plain`) yang membaca balasan JSON.
- **`docs/google-sheets-integration.md`** — (1) hash CSP lama diganti ke hash baru; (2) paragraf “Masalah saat ini: mode no-cors” dijadikan catatan historis (sudah diperbaiki); (3) bagian “fallback ke mailto” dihapus karena kode sudah tidak punya fallback itu.
- **`AUDIT-FIXES.md`** — hash CSP lama diperbarui; poin favicon diperbarui ke set lengkap; referensi `video.mp4/webm` lama diperbarui ke `video-v3.*`.
- **`QA-CHECKLIST.md`** — baris “slug tidak ada → redirect /404” diperbarui menjadi “balas HTTP 404 asli” (sesuai perbaikan soft-404).
- **`public/assets/README.md`** — nama file diperbaiki (`head-office-v2.jpg`, `video-v3.webm/mp4`), catatan ukuran `logo.png` (100×100 — sebaiknya di-upscale), dan catatan favicon sudah lengkap.

### D. Dead code / aset
- Semua aset gambar/video di `public/assets/` sudah TERPAKAI — tidak ditemukan file yatim (unused). Tidak ada yang dihapus.
- Satu-satunya “dead” yang tersisa: `favicon.svg` template Astro lama → sudah diganti dengan logo brand di gelombang sebelumnya.
