/**
 * Sanity client & GROQ queries untuk Alsada.
 *
 * CATATAN PENTING:
 * - File ini membaca dari environment variables PUBLIC_SANITY_PROJECT_ID dan PUBLIC_SANITY_DATASET.
 * - Untuk development, isi .env di root project dengan kedua var tersebut.
 * - Untuk build Astro, env vars juga harus di-set di Cloudflare Pages dashboard.
 */

import { createClient, type ClientConfig } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

// ===== Type Definitions =====

/** Portable Text block (sederhana, untuk typing dasar) */
export interface PortableTextSpan {
  _type: string;
  _key?: string;
  text: string;
  marks?: string[];
}

export interface PortableTextBlock {
  _type: string;
  _key?: string;
  style?: string;
  listItem?: string;
  level?: number;
  children?: PortableTextSpan[];
  markDefs?: Array<{
    _key: string;
    _type: string;
    href?: string;
    blank?: boolean;
  }>;
  asset?: any;
  alt?: string;
  caption?: string;
}

/** Artikel untuk tampilan card (daftar) */
export interface ArticleSummary {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  coverImage?: any;
  hasCover?: boolean;
}

/** Artikel lengkap dengan body Portable Text */
export interface ArticleFull extends ArticleSummary {
  body: PortableTextBlock[];
}

// ===== Sanity Client =====

const config: ClientConfig = {
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID || "demo",
  dataset: import.meta.env.PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: true,
  // Tambahkan token jika perlu akses draft/private dataset
  // token: import.meta.env.SANITY_API_TOKEN,
};

// Detect apakah kita punya credentials Sanity yang valid.
// Jika tidak, kita return empty array/null supaya development tetap jalan
// tanpa setup Sanity dulu. Website tetap tampil normal.
const isConfigured = !!import.meta.env.PUBLIC_SANITY_PROJECT_ID;

export const client = createClient(config);

// ===== GROQ Queries =====
// GROQ = Graph-Relational Object Queries (bahasa query Sanity).

// Select fields untuk kartu artikel (daftar)
const ARTICLE_CARD_FIELDS = `
  _id,
  title,
  "slug": slug.current,
  excerpt,
  category,
  publishedAt,
  coverImage,
  "hasCover": defined(coverImage)
`;

// Select fields untuk artikel lengkap (termasuk body Portable Text)
const ARTICLE_FULL_FIELDS = `
  ${ARTICLE_CARD_FIELDS},
  body[]{
    ...,
    _type == "image" => {
      ...,
      asset->{ _id, url }
    }
  }
`;

/**
 * Ambil N artikel terbaru. Dipakai di homepage.
 */
export async function getLatestArticles(limit = 5): Promise<ArticleSummary[]> {
  if (!isConfigured) return [];
  try {
    return client.fetch<ArticleSummary[]>(
      `*[_type == "post" && defined(slug.current)] | order(publishedAt desc)[0...$limit] { ${ARTICLE_CARD_FIELDS} }`,
      { limit }
    );
  } catch (err) {
    console.error('Sanity fetch error (getLatestArticles):', err);
    return [];
  }
}

/**
 * Ambil semua artikel (untuk halaman /artikel).
 */
export async function getAllArticles(): Promise<ArticleSummary[]> {
  if (!isConfigured) return [];
  try {
    return client.fetch<ArticleSummary[]>(
      `*[_type == "post" && defined(slug.current)] | order(publishedAt desc) { ${ARTICLE_CARD_FIELDS} }`
    );
  } catch (err) {
    console.error('Sanity fetch error (getAllArticles):', err);
    return [];
  }
}

/**
 * Ambil artikel berdasarkan slug. Dipakai di halaman /artikel/[slug].
 */
export async function getArticleBySlug(slug: string): Promise<ArticleFull | null> {
  if (!isConfigured) return null;
  try {
    return client.fetch<ArticleFull | null>(
      `*[_type == "post" && slug.current == $slug][0] { ${ARTICLE_FULL_FIELDS} }`,
      { slug }
    );
  } catch (err) {
    console.error('Sanity fetch error (getArticleBySlug):', err);
    return null;
  }
}

/**
 * Ambil semua slug artikel. Untuk generate static paths di Astro.
 */
export async function getAllArticleSlugs(): Promise<string[]> {
  if (!isConfigured) return [];
  try {
    return client.fetch<string[]>(
      `*[_type == "post" && defined(slug.current)][].slug.current`
    );
  } catch (err) {
    console.error('Sanity fetch error (getAllArticleSlugs):', err);
    return [];
  }
}

// ===== Image URL Builder =====
// Ubah asset Sanity jadi URL yang bisa ditampilkan di <img src>.

const builder = imageUrlBuilder(client);

export function urlFor(source: any) {
  if (!source) return { url: () => "" };
  return builder.image(source).auto("format").quality(80);
}
