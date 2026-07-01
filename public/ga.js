// Konfigurasi Google Analytics 4 (GA4).
// Di-host sebagai file eksternal (bukan <script> inline) supaya otomatis
// tercakup oleh direktif script-src 'self' di CSP — TIDAK perlu hash sha256
// yang rapuh. Kalau ganti Measurement ID, cukup ubah di sini.
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', 'G-30SL5DP3H3');
