# Setup Webhook Sanity → Cloudflare Pages

## Masalah Lama

Cron job lokal yang polling Sanity setiap 5 menit:
- ❌ Bergantung pada mesin lokal yang harus hidup 24/7
- ❌ Delay 5 menit sebelum deploy
- ❌ Tidak scalable dan tidak reliable

## Solusi Baru (Event-Driven, Zero Server)

```
Sanity (publish) → Webhook → GitHub Actions → Cloudflare Pages
```

### Keuntungan:
- ✅ **Zero server dependency** - tidak perlu mesin yang hidup 24/7
- ✅ **Real-time** - deploy otomatis saat artikel dipublish
- ✅ **Reliable** - menggunakan infrastruktur GitHub + Cloudflare
- ✅ **Gratis** - tidak ada biaya hosting

## Cara Setup Webhook di Sanity

### 1. Dapatkan GitHub Personal Access Token

Jika belum punya, buat token baru:

1. Buka https://github.com/settings/tokens
2. Generate new token (classic)
3. Permissions yang diperlukan:
   - `repo` (full control)
4. Copy token (simpan baik-baik, tidak akan muncul lagi)

### 2. Setup Webhook di Sanity Dashboard

1. Buka https://www.sanity.io/manage
2. Pilih project **fisaenba**
3. Klik **API** → **Webhooks**
4. Click **Add Webhook**
5. Isi form:

   **Name:** `Deploy to Cloudflare Pages`
   
   **URL:** `https://api.github.com/repos/javanicus-dot/website-alsada/dispatches`
   
   **Dataset:** `production`
   
   **Trigger on:** `Create`, `Update`, `Delete`
   
   **Filter (optional):** `_type == "post"`
   
   **HTTP method:** `POST`
   
   **HTTP Headers:**
   ```
   Authorization: Bearer GITHUB_TOKEN_ANDA
   Accept: application/vnd.github+json
   Content-Type: application/json
   ```
   
   **API version:** `v2021-06-07` (atau latest)
   
   **Projection (Request Body):**
   ```json
   {
     "event_type": "sanity-publish",
     "client_payload": {
       "article_id": _id,
       "article_title": title,
       "published_at": publishedAt
     }
   }
   ```

6. **Save webhook**

### 3. Test Webhook

1. Buka Sanity Studio (https://fisaenba.sanity.studio atau lokal)
2. Publish atau update sebuah artikel
3. Cek Sanity Dashboard → Webhooks → lihat webhook log
4. Cek GitHub Actions: https://github.com/javanicus-dot/website-alsada/actions
5. Harus ada workflow run baru dengan trigger `repository_dispatch`

## Cara Kerja Sistem

### Flow Lengkap:

1. **User publish artikel** di Sanity Studio
2. **Sanity trigger webhook** ke GitHub API
3. **GitHub Actions workflow** terbangun dengan event `repository_dispatch`
4. **Script verifikasi** cek apakah data Sanity sudah ready
5. **Astro build** fetch data dari Sanity dan generate static site
6. **Deploy ke Cloudflare Pages** menggunakan Wrangler

### Fitur Keamanan:

- **Verifikasi data**: Script `.github/scripts/verify-sanity.js` memastikan Sanity API ready sebelum build
- **Delay propagasi**: 5 detik tambahan untuk memastikan data fully propagated
- **Conditional execution**: Verifikasi hanya jalan untuk webhook trigger, tidak untuk push manual

## Troubleshooting

### Webhook tidak trigger GitHub Actions

**Cek:**
1. GitHub token valid dan punya permission `repo`
2. URL webhook benar: `https://api.github.com/repos/javanicus-dot/website-alsada/dispatches`
3. Request body format sesuai (JSON dengan `event_type` dan `client_payload`)
4. Lihat webhook logs di Sanity Dashboard untuk error details

### Build gagal / artikel baru tidak muncul

**Cek:**
1. GitHub Actions logs untuk error messages
2. Pastikan environment variables tersedia:
   - `PUBLIC_SANITY_PROJECT_ID`
   - `PUBLIC_SANITY_DATASET`
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
3. Test manual: push ke branch `main` dan lihat apakah build berhasil

### Data Sanity tidak muncul di website

**Cek:**
1. Artikel sudah published (bukan draft) di Sanity
2. Artikel punya `slug.current` yang valid
3. Test query di Sanity Vision tool
4. Lihat build logs untuk Sanity fetch errors

## File-File Penting

- `.github/workflows/deploy.yml` - GitHub Actions workflow
- `.github/scripts/verify-sanity.js` - Script verifikasi data Sanity
- `src/lib/sanity.ts` - Sanity client dan queries
- `astro.config.mjs` - Konfigurasi Astro (site URL)

## Maintenance

Sistem ini **tidak perlu maintenance** karena fully event-driven:
- ✅ Tidak ada cron job untuk dimonitor
- ✅ Tidak ada server untuk di-maintain
- ✅ GitHub Actions dan Cloudflare handle availability

Hanya perlu monitor:
- GitHub Actions quota (2,000 menit/bulan untuk free tier)
- Cloudflare Pages builds (500 builds/bulan untuk free tier)

---

**Dokumentasi dibuat:** 2026-07-01  
**Status:** ✅ Aktif
