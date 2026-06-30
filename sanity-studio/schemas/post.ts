/**
 * Schema untuk artikel/post di Alsada.
 *
 * Field-field ini menentukan:
 * - Title, slug, excerpt → untuk kartu artikel di homepage & /artikel
 * - Category, publishedAt → untuk sorting & filtering
 * - Cover image → gambar sampul (opsional)
 * - Body (Portable Text) → isi artikel dengan format kaya
 */

export default {
  name: "post",
  title: "Artikel",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Judul Artikel",
      type: "string",
      validation: (Rule: any) => Rule.required().min(5).max(120),
      description: "Judul yang menarik dan deskriptif. Maks 120 karakter.",
    },
    {
      name: "slug",
      title: "Slug (URL)",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
        slugify: (input: string) =>
          input
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .trim()
            .replace(/\s+/g, "-")
            .slice(0, 96),
      },
      validation: (Rule: any) => Rule.required(),
      description: "URL otomatis dari judul. Bisa diedit manual.",
    },
    {
      name: "excerpt",
      title: "Ringkasan",
      type: "text",
      rows: 3,
      validation: (Rule: any) => Rule.required().min(20).max(200),
      description: "Ringkasan singkat yang muncul di daftar artikel (1-2 kalimat).",
    },
    {
      name: "category",
      title: "Kategori",
      type: "string",
      options: {
        list: [
          { title: "Ternak", value: "Ternak" },
          { title: "Bisnis", value: "Bisnis" },
          { title: "Breeding", value: "Breeding" },
          { title: "Produk", value: "Produk" },
          { title: "Kemitraan", value: "Kemitraan" },
          { title: "Lingkungan", value: "Lingkungan" },
        ],
        layout: "dropdown",
      },
      validation: (Rule: any) => Rule.required(),
      description: "Kategori artikel untuk filter & warna tag.",
    },
    {
      name: "publishedAt",
      title: "Tanggal Publish",
      type: "datetime",
      validation: (Rule: any) => Rule.required(),
      initialValue: () => new Date().toISOString(),
      description: "Tanggal & jam publish. Default = waktu sekarang.",
    },
    {
      name: "coverImage",
      title: "Gambar Sampul",
      type: "image",
      options: {
        hotspot: true,
        storeOriginalFilename: true,
      },
      fields: [
        {
          name: "alt",
          title: "Alt Text",
          type: "string",
          description: "Deskripsi gambar untuk aksesibilitas & SEO.",
        },
        {
          name: "caption",
          title: "Caption",
          type: "string",
        },
      ],
      description: "Gambar utama artikel (opsional). Akan tampil di header artikel.",
    },
    {
      name: "body",
      title: "Isi Artikel",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Heading 2", value: "h2" },
            { title: "Heading 3", value: "h3" },
            { title: "Quote", value: "blockquote" },
          ],
          lists: [
            { title: "Bullet", value: "bullet" },
            { title: "Number", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
              { title: "Code", value: "code" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [
                  {
                    name: "href",
                    type: "url",
                    title: "URL",
                  },
                  {
                    name: "blank",
                    type: "boolean",
                    title: "Buka di tab baru",
                    initialValue: true,
                  },
                ],
              },
            ],
          },
        },
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            { name: "alt", type: "string", title: "Alt Text" },
            { name: "caption", type: "string", title: "Caption" },
          ],
        },
      ],
      validation: (Rule: any) => Rule.required().min(1),
      description: "Isi artikel dalam Portable Text. Bisa teks, heading, list, quote, dan gambar.",
    },
  ],

  preview: {
    select: {
      title: "title",
      subtitle: "category",
      media: "coverImage",
    },
  },

  orderings: [
    {
      title: "Tanggal Publish (Terbaru)",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
};
