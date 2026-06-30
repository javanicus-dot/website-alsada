// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Domain kanonik produksi.
  site: 'https://alsada.my.id',
  integrations: [sitemap()],
});
