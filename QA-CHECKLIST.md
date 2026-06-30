# QA Checklist — PT. Alsada Barokah Nusantara

Panduan uji menyeluruh sebelum naik ke production (`https://alsada.co.id`).
Kerjakan berurutan. Centang `[x]` setiap item lulus. Kalau ada yang gagal, catat di bagian "Temuan" paling bawah.

---

## 0. Prasyarat (lakukan sekali)

```bash
# Pastikan Node 18+ (disarankan 20/22)
node -v

# Install dependency
npm install

# Salin env & isi nilainya (JANGAN commit .env)
cp .env.example .env   # lalu isi PUBLIC_SANITY_PROJECT_ID, dataset, dll
```

- [ ] `.env` sudah diisi dan `.env` TIDAK ikut ter-commit (`git status` harus bersih dari `.env`)
- [ ] `git rm --cached .env` sudah dijalankan bila sebelumnya pernah ter-commit

---

## 1. Build & static checks (otomatis)

```bash
npm run check     # astro check — type & template error
npm run build     # build production ke /dist
npm run preview   # serve hasil build di http://localhost:4321
```

- [ ] `npm run check` selesai TANPA error
- [ ] `npm run build` sukses, tidak ada warning fatal
- [ ] Folder `dist/` berisi: `index.html`, `tentang/index.html`, `kontak/index.html`, `artikel/index.html`, `404.html`, dan satu folder per artikel
- [ ] `dist/_headers`, `dist/robots.txt`, `dist/sitemap-*.xml` ada (sitemap dari @astrojs/sitemap)

> Catatan: semua langkah UI di bawah diuji di hasil `npm run preview` (bukan `npm run dev`),
> karena `_headers`/CSP & sitemap hanya akurat pada build production.

---

## 2. Uji fungsi per halaman (manual di browser)

### Homepage `/`
- [ ] Hero tampil: badge, H1, subjudul, 2 tombol CTA, trust strip (4 item dengan ✓)
- [ ] Tombol "Konsultasi & Kemitraan" → ke `/kontak#form` dan langsung fokus ke form
- [ ] Tombol "Lihat Produk Kami" → scroll ke section Produk
- [ ] Section About, Video, Produk (6 kartu), Artikel, FAQ, Testimoni, CTA tampil berurutan
- [ ] Animasi `.reveal` muncul saat scroll; matikan JS → semua konten tetap terlihat (cek `noscript`)
- [ ] Video autoplay saat masuk viewport, pause saat keluar; dengan `prefers-reduced-motion` video TIDAK autoplay

### Navigasi (semua halaman)
- [ ] Menu desktop: semua link berfungsi (Tentang, Produk, Artikel, Kontak)
- [ ] Mobile: tombol burger membuka/menutup menu; `aria-expanded` berubah true/false
- [ ] Link aktif ter-highlight sesuai posisi scroll
- [ ] Klik logo → kembali ke `/`

### Tentang `/tentang`
- [ ] Hero, Cerita Kami, Stats, grid Legalitas (6 kartu), CTA Kemitraan tampil
- [ ] Tombol CTA → `/kontak#form`

### Artikel `/artikel` dan `/artikel/[slug]`
- [ ] Daftar artikel tampil (kalau Sanity kosong, halaman tetap aman/tidak error)
- [ ] Klik artikel → halaman detail tampil dengan judul, tanggal, kategori, body
- [ ] Slug tidak ada → redirect ke `/404`
- [ ] Gambar dari `cdn.sanity.io` tampil (tidak diblokir CSP)

### 404
- [ ] Buka URL ngawur (mis. `/halaman-tidak-ada`) → tampil halaman 404 kustom + link balik

### Footer
- [ ] 4 kolom link berfungsi; email & telp bisa diklik (mailto/tel)
- [ ] Alamat tampil sebagai teks (bukan link mati `#`)
- [ ] Ikon sosial IG & WA membuka tab baru ke akun yang benar

---

## 3. Form Kontak (PALING KRITIS) `/kontak`

### Validasi sisi klien
- [ ] Submit kosong → muncul pesan "required" di Nama, Kontak, Minat
- [ ] Isi valid tapi belum selesaikan Turnstile → submit ditolak (muncul pesan error)

### Anti-spam
- [ ] Submit < 2,5 detik setelah load → ditolak diam-diam (lihat console: "submitted too fast")
- [ ] Isi field honeypot `website` (via devtools) lalu submit → ditolak ("honeypot triggered")

### Jalur sukses end-to-end (WAJIB)
- [ ] Isi form lengkap + selesaikan Turnstile + tunggu >2,5 detik → submit
- [ ] Muncul pesan sukses HIJAU ("Terima kasih...")
- [ ] Data MASUK ke Google Sheet (tab `Kontak`) dengan kolom: Timestamp, Nama, Kontak, Minat, Lokasi, Pesan, Source
- [ ] Tombol kembali aktif & widget Turnstile ter-reset setelah sukses

### Jalur gagal
- [ ] Matikan internet lalu submit → muncul pesan error MERAH (bukan sukses palsu)
- [ ] Di tab Network: request ke Apps Script balas JSON `{ ok: true }` saat sukses

> Jika muncul error CORS di console: pastikan `Code.gs` mengembalikan header CORS &
> JSON `{ ok: true/false }`. Lihat `docs/google-sheets-integration.md` bagian CORS.

### Turnstile
- [ ] Widget tampil di form (bukan kotak error "invalid sitekey")
- [ ] Domain `alsada.co.id` sudah terdaftar untuk sitekey `0x4AAAAAADrofqwSgWBFL6Ho`
- [ ] Secret key Turnstile sudah di-set di Apps Script (verifikasi server-side)

---

## 4. SEO & Structured Data

- [ ] View-source tiap halaman: `<title>` & `<meta name=description>` UNIK dan sesuai
- [ ] `<link rel=canonical>` benar (mengarah ke URL halaman itu di `alsada.co.id`)
- [ ] OG/Twitter tags lengkap; `og:type` = `website` (umum) / `article` (halaman artikel)
- [ ] `robots.txt` benar & menunjuk ke sitemap
- [ ] `sitemap-index.xml` memuat semua halaman termasuk artikel
- [ ] **Rich Results Test** (https://search.google.com/test/rich-results):
  - [ ] Homepage → terdeteksi `Organization` + `WebSite`, tanpa error
  - [ ] Homepage → terdeteksi `FAQPage` (eligible untuk rich snippet)
  - [ ] Halaman artikel → terdeteksi `Article` (dari microdata), tanpa error
- [ ] **Schema Validator** (https://validator.schema.org): semua JSON-LD valid
- [ ] Bagikan link di WhatsApp/Twitter → preview kartu (judul, deskripsi, gambar) tampil benar

---

## 5. Keamanan (CSP & headers)

- [ ] Di production (Cloudflare Pages), buka DevTools Console → TIDAK ada error "Refused to execute/load ... CSP"
- [ ] JSON-LD ter-render & valid (artinya hash sha256 cocok). Jika diblokir → regenerasi hash:
  ```bash
  # hitung ulang hash setelah mengubah isi JSON-LD
  node -e "const c=require('crypto');const s=require('fs').readFileSync(0,'utf8');console.log('sha256-'+c.createHash('sha256').update(s,'utf8').digest('base64'))"
  ```
- [ ] Cek header live: `curl -sI https://alsada.co.id | grep -i -E 'content-security|x-frame|x-content|referrer|permissions'`
- [ ] `Strict-Transport-Security`/HTTPS aktif; `http://` redirect ke `https://`
- [ ] `.env`, `/sanity-studio` source, file rahasia TIDAK ter-publish di `dist/`

---

## 6. Aksesibilitas (a11y)

- [ ] Navigasi penuh pakai keyboard (Tab/Shift+Tab/Enter) di semua link, form, burger
- [ ] Focus ring terlihat di elemen interaktif
- [ ] Semua `<img>` punya `alt` deskriptif
- [ ] Kontras teks cukup (cek Lighthouse a11y)
- [ ] Lighthouse → Accessibility ≥ 95

---

## 7. Performa (Lighthouse, mode Incognito)

Target (mobile):
- [ ] Performance ≥ 90
- [ ] SEO = 100
- [ ] Best Practices ≥ 95
- [ ] LCP < 2,5 dtk (hero image sudah di-preload)
- [ ] CLS < 0,1 (cek tidak ada layout shift saat font/gambar load)
- [ ] Gambar besar sudah dikompres (hero.jpg, og-image.jpg); video bukan placeholder

---

## 8. Lintas perangkat & browser

- [ ] Chrome, Firefox, Safari (desktop) — tata letak rapi
- [ ] Safari iOS & Chrome Android — hero, menu, form, video OK
- [ ] Breakpoint 360px / 768px / 1024px / 1440px — tidak ada elemen terpotong/overflow

---

## 9. Smoke test cepat setelah deploy production

```bash
# Semua harus balas 200 (atau 200 untuk 404 page yang di-serve)
for p in / /tentang /kontak /artikel; do echo -n "$p → "; curl -s -o /dev/null -w "%{http_code}\n" https://alsada.co.id$p; done
curl -sI https://alsada.co.id/robots.txt | head -1
curl -s https://alsada.co.id/sitemap-index.xml | head -5
```

- [ ] Semua route balas `200`
- [ ] Kirim 1 submit form uji di production → data masuk Sheet
- [ ] Submit di Google Search Console: sitemap + request indexing homepage

---

## Temuan / Catatan QA

| # | Halaman/Fitur | Masalah | Severity | Status |
|---|---------------|---------|----------|--------|
|   |               |         |          |        |

---

_Update terakhir: regenerasi hash CSP bila isi JSON-LD (Layout.astro / FAQ.astro) berubah._
