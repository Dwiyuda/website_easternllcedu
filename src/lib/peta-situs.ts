// Isi sitemap dari HTML yang sudah dibangun (Ruling Rencana 4, bawaan Rencana 5): pasangan bahasa dibaca dari <link rel="alternate"
// hreflang> halamannya, jadi halaman yang alamat Indonesia dan 中文-nya berbeda (semua kecuali akar) tetap berpasangan, dan halaman
// noindex (mis. Event Sebelumnya yang masih kosong) tidak masuk sitemap build final. Hanya dipakai astro.config.mjs saat build.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { rapikan } from '../i18n/rute';

export const berkasHalaman = (dist: string, url: string) => {
  const j = rapikan(new URL(url).pathname);
  return join(dist, ...(j.endsWith('/') ? `${j}index.html` : `${j}.html`).split('/').filter(Boolean));
};
export const htmlHalaman = (dist: string, url: string) => {
  const b = berkasHalaman(dist, url);
  if (!existsSync(b)) {
    console.warn(`peta-situs: HTML tidak ditemukan untuk ${url} (${b}); halaman dilewati dari sitemap dan hreflang.`);
    return '';
  }
  return readFileSync(b, 'utf8');
};
export const diindeks = (html: string) => !/<meta name="robots" content="[^"]*noindex/.test(html);
export const pasanganHreflang = (html: string) =>
  [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => ({ lang: m[1], url: m[2] }));
