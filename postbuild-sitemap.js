// Post-build: salin sitemap-index.xml → sitemap.xml + inject lastmod + ping IndexNow biar Bing crawl.
import { readFileSync, writeFileSync, cpSync } from "fs";
import { resolve } from "path";

const dist = new URL("./dist", import.meta.url).pathname;

// Copy sitemap-index → sitemap.xml
cpSync(resolve(dist, "sitemap-index.xml"), resolve(dist, "sitemap.xml"));

// Inject <lastmod> ke sitemap-0.xml dengan tanggal build hari ini
const sitemapPath = resolve(dist, "sitemap-0.xml");
const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

let xml = readFileSync(sitemapPath, "utf-8");

// Tambahkan <lastmod> setelah <loc> untuk setiap <url>
xml = xml.replace(
  /<loc>(https:\/\/alsada\.co\.id\/[^<]*)<\/loc>/g,
  (_, url) =>
    `<loc>${url}</loc>\n      <lastmod>${today}</lastmod>`,
);

writeFileSync(sitemapPath, xml);
console.log(`[postbuild] sitemap.xml + lastmod=${today} injected`);

// ===== IndexNow — notify Bing + Yandex (zero dep, via fetch) =====
const INDEXNOW_KEY = "c06b3a5d8e7f4219a0b2c4d6f8e1a3b7"; // Unique key untuk Alsada
const urls = [...xml.matchAll(/<loc>(https:\/\/alsada\.co\.id\/[^<]+)<\/loc>/g)].map(m => m[1]);

Promise.all(
  ["https://www.bing.com", "https://yandex.com"].map(host =>
    fetch(`${host}/indexnow?url=${encodeURIComponent(urls[0])}&key=${INDEXNOW_KEY}`)
      .then(r => console.log(`[postbuild] IndexNow ${host}: ${r.status}`))
      .catch(e => console.log(`[postbuild] IndexNow ${host}: ${e.message}`))
  )
);
