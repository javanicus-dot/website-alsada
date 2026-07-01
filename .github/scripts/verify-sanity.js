#!/usr/bin/env node
/**
 * Verifikasi koneksi dan data Sanity sebelum build.
 * Script ini memastikan artikel yang baru dipublish sudah tersedia di API.
 */

import https from 'https';

const PROJECT_ID = process.env.PUBLIC_SANITY_PROJECT_ID || 'fisaenba';
const DATASET = process.env.PUBLIC_SANITY_DATASET || 'production';

// GROQ query untuk cek artikel terbaru
const query = '*[_type == "post" && defined(slug.current)] | order(publishedAt desc)[0...3] {_id, title, publishedAt}';
const url = `https://${PROJECT_ID}.api.sanity.io/v1/data/query/${DATASET}?query=${encodeURIComponent(query)}`;

console.log('🔍 Verifying Sanity data availability...');
console.log(`   Project: ${PROJECT_ID}`);
console.log(`   Dataset: ${DATASET}`);

https.get(url, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const articles = json.result || [];
      
      if (articles.length === 0) {
        console.log('⚠️  Warning: No articles found in Sanity');
        console.log('   Build will continue but site may have no content');
        process.exit(0);
      }
      
      console.log(`✅ Sanity data ready: ${articles.length} articles found`);
      console.log(`   Latest: "${articles[0].title}"`);
      console.log(`   Published: ${articles[0].publishedAt}`);
      process.exit(0);
      
    } catch (err) {
      console.error('❌ Failed to parse Sanity response:', err.message);
      process.exit(1);
    }
  });
  
}).on('error', (err) => {
  console.error('❌ Failed to connect to Sanity:', err.message);
  process.exit(1);
});
