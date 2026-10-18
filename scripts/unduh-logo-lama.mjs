// Sekali jalan, HANYA SETELAH IZIN PEMILIK: mengunduh gambar halaman kampus website lama (Google Sites) sebagai kandidat logo
// ke bahan/logo-kampus/lama/<slug>-<n>.<ext>. Gambar kepala situs yang muncul di banyak halaman dilewati. Kandidat dipilih
// dengan mata lalu disalin ke bahan/logo-kampus/<slug>.<ext>, sesudah itu jalankan scripts/olah-logo.mjs.
// Pakai: node scripts/unduh-logo-lama.mjs "D:/History/Lampiran/Website Eastern LLC/Website Eastern LLC - Arsip Website Lama.txt"
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

// Respons server tidak dipercaya: hanya gambar raster (SVG bisa memuat skrip), paling 2 MB, dari server gambar Google.
const MAKS = 2 * 1024 * 1024;
const EKSTENSI = new Map([['image/png', 'png'], ['image/jpeg', 'jpg'], ['image/webp', 'webp'], ['image/gif', 'gif']]);
export const ekstensiAman = (tipe) => EKSTENSI.get((tipe ?? '').split(';')[0].trim().toLowerCase());
export const hostAman = (url) => {
  const host = URL.parse(url)?.hostname ?? '';
  return host === 'sites.google.com' || host.endsWith('.googleusercontent.com');
};
export const dalamFolder = (folder, nama) => resolve(folder, nama).startsWith(resolve(folder) + sep);

// Alamat halaman website lama → nama berkas kampus (19 kampus berlogo di website lama, Arsip Website Lama).
const HALAMAN = {
  zust: 'zhejiang-university-of-science-and-technology', zju: 'zhejiang-university', zstu: 'zhejiang-sci-tech-university',
  hqu: 'huaqiao-university', 'xiamen-university': 'xiamen-university', 'fuzhou-university': 'fuzhou-university',
  njust: 'nanjing-university-of-science-and-technology', nufe: 'nanjing-university-of-finance-and-economics', nnu: 'nanjing-normal-university',
  'tongji-university': 'tongji-university', 'dong-hai-college': 'shanghai-donghai-vocational-and-technical-college',
  'shanghai-jiao-tong-university': 'shanghai-jiao-tong-university', 'east-china-normal-university': 'east-china-normal-university',
  ecjtu: 'east-china-jiaotong-university', jxufe: 'jiangxi-university-of-finance-and-economics', jxnu: 'jiangxi-normal-university',
  npu: 'northwestern-polytechnical-university', jnu: 'jinan-university', scnu: 'south-china-normal-university',
};
const LAMA = 'bahan/logo-kampus/lama';

// Bagian utama hanya saat dijalankan langsung, bukan saat diimpor tes.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const GAMBAR = /^https:\/\/sites\.google\.com\/sitesv-images-rt\/\S+$/gm;
  const arsip = readFileSync(process.argv[2], 'utf8');
  const bagian = arsip.split(/^===== /m).slice(1);
  const hitung = new Map();
  for (const b of bagian) for (const u of new Set([...b.matchAll(GAMBAR)].map((m) => m[0].replace(/=w\d+$/, '')))) hitung.set(u, (hitung.get(u) ?? 0) + 1);
  mkdirSync(LAMA, { recursive: true });
  for (const b of bagian) {
    const slug = HALAMAN[/^\/list-of-university\/[\w-]+\/([\w-]+)\s/.exec(b)?.[1] ?? ''];
    if (!slug) continue;
    // Logo kampus muncul di halaman kampus dan halaman provinsinya (≤ 3 halaman); kepala situs muncul di puluhan halaman.
    const kandidat = [...new Set([...b.matchAll(GAMBAR)].map((m) => m[0].replace(/=w\d+$/, '')))].filter((u) => hitung.get(u) <= 3);
    for (const [i, u] of kandidat.entries()) {
      const r = await fetch(`${u}=w800`);
      const tipe = r.headers.get('content-type');
      const berkas = `${slug}-${i + 1}.${ekstensiAman(tipe)}`;
      const tolak = !r.ok ? `HTTP ${r.status}`
        : !hostAman(r.url) ? `dialihkan ke host lain (${URL.parse(r.url)?.hostname})`
        : !ekstensiAman(tipe) ? `tipe tidak diizinkan (${tipe})`
        : Number(r.headers.get('content-length')) > MAKS ? 'lebih dari 2 MB'
        : !dalamFolder(LAMA, berkas) ? 'jalur di luar folder' : '';
      if (tolak) { console.warn(`${slug} ${i + 1}: ${tolak}`); await r.body?.cancel(); continue; }
      const potong = [];
      let ukuran = 0;
      for await (const c of r.body ?? []) { ukuran += c.length; if (ukuran > MAKS) break; potong.push(c); }
      if (ukuran > MAKS) { console.warn(`${slug} ${i + 1}: lebih dari 2 MB`); continue; }
      writeFileSync(resolve(LAMA, berkas), Buffer.concat(potong));
      console.log(berkas);
    }
  }
}
