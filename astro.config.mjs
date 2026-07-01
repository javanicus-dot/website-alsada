// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Domain kanonik produksi.
  site: 'https://alsada.co.id',
  // Seragamkan trailing slash supaya <link rel="canonical"> selalu cocok
  // dengan URL di sitemap (yang memakai trailing slash). Menghindari
  // duplikasi URL /artikel vs /artikel/ di mata Google.
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  integrations: [sitemap()],
});
