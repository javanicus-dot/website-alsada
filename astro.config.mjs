// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  // Domain kanonik produksi.
  site: 'https://alsada.co.id',

  integrations: [sitemap()],
  output: "hybrid",
  adapter: cloudflare()
});