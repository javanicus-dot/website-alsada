# Aset gambar Alsada

Folder ini menampung semua gambar asli situs. Astro menyajikan isi `public/`
apa adanya dari root, jadi file di sini diakses lewat path `/assets/...`.

## Daftar file yang HARUS diisi (ganti placeholder dengan gambar asli)

| File | Ukuran disarankan | Rasio | Dipakai di |
|---|---|---|---|
| `logo.png` | 512x512 | 1:1 (PNG transparan) | SEO JSON-LD (`Layout.astro`) |
| `og-image.jpg` | 1200x630 | 1.91:1 | Open Graph / share sosmed (`Layout.astro`) |
| `hero.jpg` | 1920x1080 | 16:9 | Background Hero (`global.css`) |
| `video-cover.jpg` | 1600x700 | 16:7 | Background section Video (`global.css`) |
| `about/about-1.jpg` | 900x900 | ~1:1 | `About.astro` (Sapi FH di kandang modern) |
| `about/about-2.jpg` | 900x900 | ~1:1 | `About.astro` (Peternakan susu sapi) |
| `products/susu-fh.jpg` | 800x800 | 1:1 | Produksi Susu Sapi FH |
| `products/jual-beli-sapi.jpg` | 800x800 | 1:1 | Jual-Beli Sapi |
| `products/daging-premium.jpg` | 800x800 | 1:1 | Daging Berkualitas Tinggi |
| `products/breeding-pedet.jpg` | 800x800 | 1:1 | Breeding & Pedet |
| `products/penggemukan-limousin.jpg` | 800x800 | 1:1 | Penggemukan Limousin |
| `products/head-office.jpg` | 800x800 | 1:1 | Head Office Terpadu |

## Video (VideoSection)

| File | Rekomendasi | Catatan |
|---|---|---|
| `video.mp4` | H.264, rasio 16:7, < ~8 MB | Sumber utama (paling kompatibel) |
| `video.webm` | VP9, rasio 16:7 | Opsional, lebih ringan untuk browser modern |

- Video diputar **otomatis saat section masuk layar** dan **berhenti saat keluar** (tanpa tombol).
- Wajib tetap **tanpa audio** — browser hanya mengizinkan autoplay untuk video `muted`.
- `poster` memakai `video-cover.jpg` (tampil sebelum video dimuat).
- Cloudflare Pages membatasi **25 MB / file** — kompres video sebelum commit (mis. https://handbrake.fr).
- Pertahankan nama `video.mp4` / `video.webm`, atau perbarui `<source>` di `src/components/VideoSection.astro`.

Juga ganti favicon brand: `public/favicon.svg` dan `public/favicon.ico`.

## Tips

- Gunakan format WebP atau JPG terkompres (mis. https://squoosh.app) agar situs ringan.
- Jaga ukuran `hero.jpg` dan `og-image.jpg` di bawah ~300KB.
- Pertahankan nama file persis seperti tabel di atas; kalau diganti, perbarui juga
  referensinya di `global.css`, `About.astro`, dan `Products.astro`.
- Nama file pakai huruf kecil tanpa spasi (URL case-sensitive di server produksi).
