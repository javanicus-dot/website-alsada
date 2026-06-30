# Alsada Sanity Studio

Sanity Studio untuk content management Alsada — tempat kamu menulis artikel harian tanpa perlu coding.

## Setup pertama kali (15 menit)

### 1. Daftar di Sanity.io
- Buka https://www.sanity.io dan klik "Get started for free"
- Login pakai email atau Google account
- Klik **"Create new project"**
- Pilih **"Clean project with no predefined schemas"**
- Isi nama project: `Alsada`
- Pilih **dataset: production** (default)
- Setelah dibuat, dashboard akan menunjukkan **Project ID** — copy ID ini.

### 2. Setup project lokal

```bash
cd sanity-studio
npm install
```

### 3. Ganti Project ID

Edit `sanity.config.ts`, ganti `YOUR_PROJECT_ID` dengan Project ID dari dashboard Sanity:

```typescript
projectId: "abc12345",  // ← Project ID kamu
dataset: "production",
```

### 4. Jalankan Studio lokal (untuk testing)

```bash
npm run dev
```

Studio akan terbuka di `http://localhost:3333`. Login dengan akun Sanity kamu.

### 5. Tulis artikel pertama kamu

Di Studio, klik **"Create new document"** → pilih **"Artikel"**.

Isi field-field berikut:
- **Judul Artikel**: judul artikel kamu
- **Slug**: otomatis ter-generate dari judul
- **Ringkasan**: 1-2 kalimat yang menarik
- **Kategori**: pilih dari dropdown (Ternak, Bisnis, dll)
- **Tanggal Publish**: default = sekarang
- **Gambar Sampul**: (opsional) upload foto
- **Isi Artikel**: tulis di sini (bisa heading, list, quote)

Klik **"Publish"** untuk publish artikel.

### 6. Deploy Studio ke hosting Sanity (supaya bisa diakses dari mana saja)

```bash
npm run deploy
```

Studio kamu akan tersedia di URL seperti `https://alsada-studio.sanity.studio`.

### 7. Hubungkan dengan Astro project

Di root folder Astro project, buat file `.env`:

```
PUBLIC_SANITY_PROJECT_ID=abc12345
PUBLIC_SANITY_DATASET=production
```

(Sama dengan yang ada di `sanity.config.ts`)

Restart `npm run dev` di Astro. Artikel dari Sanity sekarang muncul di website.

---

## Workflow harian untuk menulis artikel

1. Buka `https://alsada-studio.sanity.studio` (setelah deploy)
2. Login dengan akun Sanity
3. Klik **"Create new document"** → **"Artikel"**
4. Isi judul, ringkasan, kategori
5. Tulis isi artikel (Portable Text — seperti Notion)
6. Klik **"Publish"**
7. Website otomatis rebuild (via webhook) dalam ~30 detik
8. Artikel langsung online di website

---

## Schema field reference

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `title` | string | ✅ | Judul artikel, maks 120 karakter |
| `slug` | slug | ✅ | URL otomatis dari judul |
| `excerpt` | text | ✅ | Ringkasan 1-2 kalimat |
| `category` | string | ✅ | Ternak / Bisnis / Breeding / Produk / Kemitraan / Lingkungan |
| `publishedAt` | datetime | ✅ | Tanggal publish, default = sekarang |
| `coverImage` | image | ❌ | Gambar sampul (opsional) |
| `body` | portable text | ✅ | Isi artikel (rich text + image) |

---

## Auto-rebuild website via webhook (opsional)

Setiap kali kamu Publish artikel di Sanity, kamu bisa trigger Cloudflare Pages untuk rebuild otomatis. Ini opsional — kalau tidak di-setup, kamu harus rebuild manual.

Setup:
1. Di Cloudflare Pages project → **Settings → Builds → Build hooks**
2. Tambahkan hook baru, copy URL-nya
3. Di Sanity dashboard → **API → Webhooks**
4. Tambahkan webhook baru:
   - Name: "Cloudflare rebuild"
   - URL: [URL dari Cloudflare]
   - Dataset: production
   - Trigger on: Create, Update, Delete
5. Save

Sekarang setiap Publish di Sanity, Cloudflare otomatis rebuild.

---

## Troubleshooting

### "Project ID is invalid"
- Cek `sanity.config.ts` Project ID sudah benar
- Cek `.env` di Astro project juga sama

### Artikel tidak muncul di website
- Cek `.env` sudah benar
- Restart `npm run dev` di Astro
- Cek koneksi internet (Sanity API perlu online)

### Studio lambat
- Free tier Sanity cukup cepat untuk project skala Alsada
- Kalau lambat, cek koneksi internet

### Ingin tambah field baru di artikel?
1. Edit `schemas/post.ts`
2. Tambah field baru dengan type yang sesuai
3. Restart `npm run dev`
4. Field baru akan muncul di Studio

---

## Biaya

- **Free tier**: unlimited dokumen, 10GB storage, 100k API requests/bulan
- Untuk Alsada dengan update artikel harian, **free tier sangat cukup**

---

Butuh bantuan? Cek README utama project atau hubungi Sauna.
