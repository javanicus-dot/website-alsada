# Integrasi Form Kontak → Google Sheets

Form kontak (`src/pages/kontak.astro`) mengirim data ke Google Apps Script Web App,
yang menulisnya ke spreadsheet **"Alsada - Kontak Website"**.

## Spreadsheet

- Nama: `Alsada - Kontak Website`
- ID: `1icB51cJ5S6pGYc-e-jKqmzm0vcKoUzxMhXWA76gsqIM`
- URL: https://docs.google.com/spreadsheets/d/1icB51cJ5S6pGYc-e-jKqmzm0vcKoUzxMhXWA76gsqIM/edit
- Tab: `Kontak`
- Kolom: `Timestamp | Nama | Kontak | Minat | Lokasi | Pesan | Source`

## Field yang dikirim form

```json
{
  "nama": "...",
  "kontak": "email atau nomor WhatsApp",
  "minat": "Investor / Mitra Peternak / ...",
  "lokasi": "...",
  "pesan": "...",
  "source": "website-kontak",
  "timestamp": "ISO 8601"
}
```

## Status: AKTIF ✅

Webhook sudah di-deploy & terpasang di `src/pages/kontak.astro`:
`https://script.google.com/macros/s/AKfycbyiDXX7vVxExHmrfIoOfzJshUVPfKJ6ytuL1Mr0GLVEawyfkwSmUPmhiPx1S6_iDMuOsA/exec`

Sudah dites end-to-end: row masuk ke tab `Kontak` dengan mapping benar.

---

## Cara setup Apps Script Web App (sekali, ~2 menit)

1. Buka spreadsheet di atas → menu **Extensions → Apps Script**.
2. Hapus kode default, paste `Code.gs` dari bawah.
3. Klik **Save** (ikon disket).
4. Pilih function `setup` dari dropdown di toolbar → klik **Run** (▶). Authorize kalau diminta. Cek **View → Logs** — harus ada `TURNSTILE_SECRET berhasil di-set`. (Setelah selesai, function `setup` boleh dihapus — opsional.)
5. Klik **Deploy → Manage deployments** → edit deployment yang ada → **Version: New version** → Deploy. (Atau **Deploy → New deployment** kalau belum ada.)
6. Klik **Authorize access** kalau diminta.
7. Webhook URL tetap sama, tidak perlu ganti.

## Setup Cloudflare Turnstile (~5 menit, sekali)

1. Login ke [Cloudflare dashboard](https://dash.cloudflare.com/) → **Turnstile** → **Add widget**.
2. Isi:
   - **Widget name**: `Alsada Kontak Website`
   - **Domains**: `alsada.co.id` (tambah `alsadabarokah.co.id` setelah migrasi domain)
3. Save → catat **Site Key** (public, untuk form) dan **Secret Key** (RAHASIA — jangan pernah ditulis di file/repo; hanya disimpan di Script Properties).
4. **Site Key** → buka `src/pages/kontak.astro` (atribut `data-sitekey` pada `<div class="cf-turnstile">`), ganti dengan site key kamu. (Site key bersifat publik, aman ditaruh di HTML.)
5. **Secret Key** → cukup Run function `setup()` di Apps Script editor (lihat step 4 di section sebelumnya) — secret akan otomatis tersimpan di Script Properties `TURNSTILE_SECRET`.


> Catatan: script ini **tidak mengirim email** (notifikasi lead ditangani schedule
> `alsada-lead-digest`). Ini sengaja, supaya tidak kena error "Network error" seperti
> webhook lama.

## Code.gs

```javascript
const SHEET_ID = '1icB51cJ5S6pGYc-e-jKqmzm0vcKoUzxMhXWA76gsqIM';
const SHEET_NAME = 'Kontak';
const MAX_LEN = 2000; // batas panjang per field

function clean(v) {
  return String(v == null ? '' : v).trim().slice(0, MAX_LEN);
}

function verifyTurnstile(token) {
  const secret = PropertiesService.getScriptProperties().getProperty('TURNSTILE_SECRET');
  // FAIL CLOSED: tanpa secret, tolak. (JANGAN skip verifikasi seperti versi lama.)
  if (!secret) return { ok: false, error: 'secret-not-configured' };
  if (!token) return { ok: false, error: 'no-token' };
  const resp = UrlFetchApp.fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'post',
    payload: { secret, response: token },
    muteHttpExceptions: true,
  });
  const result = JSON.parse(resp.getContentText());
  return { ok: !!result.success, raw: result };
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: 'no-body' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: 'invalid-json' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 1) Verifikasi Turnstile dulu — reject spam SEBELUM tulis ke sheet.
    const verify = verifyTurnstile(data['cf-turnstile-response']);
    if (!verify.ok) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: 'turnstile-failed', detail: verify }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 2) Validasi field wajib.
    const nama = clean(data.nama);
    const kontak = clean(data.kontak);
    if (!nama || !kontak) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: 'missing-required-fields' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 3) Tulis ke sheet (semua field dibatasi panjangnya via clean()).
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    sheet.appendRow([
      clean(data.timestamp) || new Date().toISOString(),
      nama,
      kontak,
      clean(data.minat),
      clean(data.lokasi),
      clean(data.pesan),
      clean(data.source) || 'website-kontak',
    ]);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, msg: 'Alsada kontak webhook aktif' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// One-time setup — simpan TURNSTILE_SECRET ke Script Properties.
// PENTING: JANGAN hardcode secret di file ini (cegah kebocoran).
// Disarankan set MANUAL: Project Settings → Script Properties → Add property
//   key: TURNSTILE_SECRET, value: <secret dari Cloudflare>.
// Atau tempel secret SEMENTARA ke variabel di bawah, Run sekali, lalu KOSONGKAN lagi.
function setup() {
  const secret = ''; // ← tempel SEMENTARA, Run, lalu kosongkan lagi sebelum simpan.
  if (!secret) {
    throw new Error('Isi `secret` sementara lalu Run, atau set manual via Script Properties.');
  }
  PropertiesService.getScriptProperties().setProperty('TURNSTILE_SECRET', secret);
  Logger.log('TURNSTILE_SECRET tersimpan. Deploy ulang: Manage deployments → New version → Deploy.');
}
```

## Sebelum URL dipasang

Selama `APPS_SCRIPT_URL` masih `GANTI_DENGAN_URL_APPS_SCRIPT_ANDA`, form otomatis
fallback ke `mailto:` (buka email client user). Aman, tetap berfungsi.


---

## Opsi: Form dengan status akurat (CORS)

**Masalah saat ini:** form memakai `mode: 'no-cors'`, jadi browser TIDAK bisa membaca
balasan server. Akibatnya UI **selalu** menampilkan “Terima kasih” walau server menolak
(Turnstile gagal, field wajib kosong, dsb). Lead bisa hilang diam-diam.

> **Status:** Klien (`src/pages/kontak.astro`) SUDAH diubah ke mode CORS. Sisa pekerjaan
> hanya di sisi server: pastikan `Code.gs` membalas JSON `{ ok: true }` lalu **redeploy**.

**Solusi (kedua sisi harus cocok agar form berfungsi):**

### 1) Klien di `src/pages/kontak.astro` — ✅ SUDAH DITERAPKAN

Untuk referensi, beginilah klien sekarang mengirim (CORS + membaca balasan server):

```javascript
const res = await fetch(APPS_SCRIPT_URL, {
  method: 'POST',
  // hapus 'no-cors' (default sudah 'cors')
  headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // hindari preflight
  body: JSON.stringify({ /* field sama seperti sekarang */ }),
});
const out = await res.json();
if (out && out.ok) {
  okEl?.style.setProperty('display', 'block');
  form.reset();
} else {
  errEl?.style.setProperty('display', 'block');
}
```

### 2) Server `Code.gs` (WAJIB di-redeploy)

Deploy Web App dengan **Execute as: Me** dan **Who has access: Anyone**, lalu gunakan
struktur berikut. Kuncinya: SEMUA jalur mengembalikan JSON via helper `out()`.

```javascript
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents); // body dikirim sebagai text/plain

    // 1) Verifikasi Turnstile di server
    if (!verifyTurnstile(data['cf-turnstile-response'])) {
      return out({ ok: false, error: 'turnstile_failed' });
    }

    // 2) Validasi field wajib
    if (!data.nama || !data.kontak || !data.minat) {
      return out({ ok: false, error: 'missing_fields' });
    }

    // 3) Simpan ke Spreadsheet
    var sh = SpreadsheetApp
      .openById('1icB51cJ5S6pGYc-e-jKqmzm0vcKoUzxMhXWA76gsqIM')
      .getSheetByName('Kontak');
    sh.appendRow([
      new Date(), data.nama, data.kontak, data.minat,
      data.lokasi || '', data.pesan || '', data.source || ''
    ]);

    // 4) (opsional) notifikasi email
    // MailApp.sendEmail('ptalsadabarokah@icloud.com', 'Lead baru', JSON.stringify(data));

    return out({ ok: true });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  }
}

function verifyTurnstile(token) {
  if (!token) return false;
  // Simpan secret di Project Settings > Script Properties, JANGAN hardcode di produksi.
  var secret = PropertiesService.getScriptProperties().getProperty('TURNSTILE_SECRET');
  var resp = UrlFetchApp.fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'post',
    payload: { secret: secret, response: token },
    muteHttpExceptions: true,
  });
  return JSON.parse(resp.getContentText()).success === true;
}

function out(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```

**Cara redeploy (penting!):** Apps Script editor -> **Deploy -> Manage deployments** ->
edit deployment yang aktif -> pilih **New version** -> **Deploy**. Jika kamu membuat
deployment BARU, URL `/exec` berubah dan kamu harus update `APPS_SCRIPT_URL` di
`src/pages/kontak.astro`.

> Apps Script Web App (akses "Anyone") otomatis mengirim `Access-Control-Allow-Origin: *`
> pada respons `/exec`. Karena klien memakai `text/plain` (bukan `application/json`),
> request tergolong "simple" sehingga TIDAK ada preflight OPTIONS -> `res.json()` bisa dibaca.
>
> Jika suatu saat respons tetap tidak terbaca, alternatif paling stabil adalah memasang
> Cloudflare Pages Function/Worker tipis sebagai proxy penambah header CORS.

**PENTING:** selama `Code.gs` belum di-redeploy untuk membalas `{ ok: true }`, form akan
menampilkan **error** walau data mungkin tetap tersimpan. Jadi redeploy server dulu, baru uji.

---

## Regenerasi hash CSP untuk JSON-LD

Ada DUA blok structured data inline yang di-allow CSP lewat hash `sha256` di
`public/_headers`:
  1. `@graph` (Organization + WebSite) di `src/layouts/Layout.astro`
  2. `FAQPage` di `src/components/FAQ.astro`

Kalau isi salah satu JSON-LD diubah (mis. ganti nomor telepon/alamat/teks FAQ), hash
blok itu WAJIB dihitung ulang, jika tidak browser akan memblokir structured data tersebut.

Cara paling andal: hitung hash langsung dari hasil build (bukan dari sumber), karena
yang di-hash adalah isi `<script>` yang benar-benar dirender:

1. `npm run build`.
2. Untuk tiap `<script type="application/ld+json">` di `dist/index.html`, hitung
   `sha256-` + base64( SHA-256( isi-script ) ).
3. Salin kedua output `sha256-...` ke `script-src` pada `public/_headers`.

> Hash saat ini (domain produksi `https://alsada.co.id`):
> - `@graph`   : `sha256-hkN6FQnVU6+hxXAPrnpUhnhPpoLcnIsgaQelxezrGJo=`
> - `FAQPage`  : `sha256-VkdIHadsds3WgqPKVuMpa3/34ozCMosPbDVRvLsn4Gs=`
