// Post-build: salin sitemap-index.xml → sitemap.xml biar crawler nemu.
import { cpSync } from "fs";
import { resolve } from "path";

const dist = new URL("./dist", import.meta.url).pathname;
cpSync(resolve(dist, "sitemap-index.xml"), resolve(dist, "sitemap.xml"));
console.log("[postbuild] sitemap.xml created from sitemap-index.xml");
