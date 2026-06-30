# Website Alsada — Astro + Sanity CMS

Main website for PT. Alsada Barokah Nusantara. A modern integrated livestock operation spanning upstream to downstream (FH dairy cattle, cattle trading, premium beef, breeding, Limousin cattle fattening).

## Stack

- **Astro 4** — static site generator, high-performance, SEO-friendly.
- **Sanity CMS** — article and dynamic page management (Studio in `sanity-studio/`).
- **Cloudflare Pages** — deployment target.
- **Google Apps Script + Sheets** — contact form endpoint (see `docs/google-sheets-integration.md`).
- **Cloudflare Turnstile** — contact form anti-spam (3 layers, see section below).

## Structure

```
/
├── public/                 # Static assets (favicon, og-image, logo)
├── src/
│   ├── components/         # Nav, Footer, Hero, About, Products, FAQ, etc.
│   ├── layouts/            # Main layout (head meta, JSON-LD, OG)
│   ├── lib/                # Sanity client, GROQ queries, Portable Text → HTML
│   └── pages/              # index, tentang, kontak, artikel/[slug], etc.
├── sanity-studio/          # Local Studio for Sanity CMS
└── docs/                   # Integration notes (e.g. google-sheets-integration.md)
```

## Commands

Run from the project root:

| Command                  | Action                                            |
| :----------------------- | :------------------------------------------------ |
| `npm install`            | Install dependencies                              |
| `npm run dev`            | Dev server at `localhost:4321`                    |
| `npm run build`          | Production build → `./dist/`                      |
| `npm run preview`        | Preview production build locally                  |
| `cd sanity-studio && npm run dev` | Run Sanity Studio locally              |

## Environment variables

`.env` file at the root (see `.gitignore`):

```
PUBLIC_SANITY_PROJECT_ID=...
PUBLIC_SANITY_DATASET=production
```

For Cloudflare Pages deployment, set the variables above in the Pages dashboard (**Environment variables** section).

## Domain

`site` is set in `astro.config.mjs`. Currently `https://alsada.co.id`. All canonical URLs, Open Graph tags, and JSON-LD automatically follow the domain.

## Contact form

The form at `/kontak` sends data via `no-cors` POST to Google Apps Script → writes to the sheet **"Alsada - Kontak Website"** (tab `Kontak`, columns `Timestamp | Nama | Kontak | Minat | Lokasi | Pesan | Source`).

Full setup (sheet id, webhook URL, deploy guide, re-deploy after edits): `docs/google-sheets-integration.md`.

## Contact form anti-spam (3 layers)

The contact form at `/kontak` is protected by three anti-spam layers before any submission reaches the Sheet:

1. **Honeypot** — `website` field hidden via CSS. Bots auto-fill it, humans don't. Submission with `data.website` filled → reject.
2. **Minimum-time** — `formLoadedAt = Date.now()` on page load; submit < 2.5s → reject (bots don't read the form).
3. **Cloudflare Turnstile** — widget challenge, token sent via `cf-turnstile-response`. Apps Script verifies server-side against `challenges.cloudflare.com/turnstile/v0/siteverify`. Failed verification → reject before writing to Sheet.

Full setup (widget, sitekey, secret in Apps Script Properties, deploy): `docs/google-sheets-integration.md` §Setup Cloudflare Turnstile.

> **Turnstile keys:** the **site key** lives in `src/pages/kontak.astro` (`data-sitekey` on `<div class="cf-turnstile">`) and is public — safe in HTML. The **secret key** is RAHASIA and must only be stored in the Apps Script editor → Project Settings → Script Properties → property `TURNSTILE_SECRET`. Never commit the secret to the repo.

## Notes

- OG image (`public/assets/og-image.jpg`) and logo (`public/assets/logo.png`) are provided — ready for launch.
- Domain: `alsada.co.id`.
