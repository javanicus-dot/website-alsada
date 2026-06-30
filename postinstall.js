// postinstall.js — Jalankan setelah npm install
// FIX: @astrojs/sitemap@3.x broken di Astro 4.16+ kalau Sanity kosong
// Hook astro:routes:resolved tidak dipanggil → _routes undefined → crash.
// PR upstream: https://github.com/withastro/astro/issues/… (belum ada fix)
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const target = resolve(
  import.meta.dirname,
  "node_modules/@astrojs/sitemap/dist/index.js",
);
try {
  let src = readFileSync(target, "utf8");
  const guard = "(_routes || [])";
  if (!src.includes(guard)) {
    src = src.replace(
      "const routeUrls = _routes.reduce",
      `const routeUrls = ${guard}.reduce`,
    );
    writeFileSync(target, src);
    console.log("  [postinstall] ✓ patched @astrojs/sitemap (empty routes guard)");
  } else {
    console.log("  [postinstall] ✔ @astrojs/sitemap already patched");
  }
} catch (e) {
  console.warn("  [postinstall] ⚠ failed to patch sitemap:", e.message);
}
