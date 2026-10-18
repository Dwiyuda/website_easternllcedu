// Peta kantor statis untuk halaman Kontak 中文 (Naskah Kontak bagian 2, Panduan Visual 9g, P21 A). Halaman 中文 tidak memuat layanan
// Google, jadi petanya gambar milik sendiri dari ubin OpenStreetMap standar: diunduh sekali, dijahit dengan sharp, ditambah penanda kantor.
// Atribusi "© OpenStreetMap" wajib tampil di halaman (kebijakan ubin dan lisensi ODbL). Jalankan ulang hanya kalau kantor pindah:
//   node scripts/buat-peta-kantor.mjs
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { KOORDINAT } from '../src/data/kontak.ts';

// Satu sumber koordinat: KOORDINAT di src/data/kontak.ts (titik Google Maps, Riset Konten).
const { lintang: LINTANG, bujur: BUJUR } = KOORDINAT;
const ZOOM = 17;
const LEBAR = 480;
const TINGGI = 320;
const UBIN = 256;
// Warna penanda dari MASTER.md: marun-600 dan kartu-100 (berkas di luar src/, tidak memakai token CSS).
const MARUN = '#642621';
const KARTU = '#FFF9F2';

const n = 2 ** ZOOM;
const px = ((BUJUR + 180) / 360) * n * UBIN;
const rad = (LINTANG * Math.PI) / 180;
const py = ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n * UBIN;
const kiri = Math.round(px - LEBAR / 2);
const atas = Math.round(py - TINGGI / 2);
const x0 = Math.floor(kiri / UBIN);
const y0 = Math.floor(atas / UBIN);
const x1 = Math.floor((kiri + LEBAR - 1) / UBIN);
const y1 = Math.floor((atas + TINGGI - 1) / UBIN);

const ubin = [];
for (let x = x0; x <= x1; x++) {
  for (let y = y0; y <= y1; y++) {
    const r = await fetch(`https://tile.openstreetmap.org/${ZOOM}/${x}/${y}.png`, {
      headers: { 'User-Agent': 'EasternLLC-website/1.0 (peta kantor statis, sekali unduh; kontak@contoh.example)' },
    });
    if (!r.ok) throw new Error(`Ubin ${ZOOM}/${x}/${y}: HTTP ${r.status}`);
    ubin.push({ input: Buffer.from(await r.arrayBuffer()), left: (x - x0) * UBIN, top: (y - y0) * UBIN });
  }
}
const kanvas = await sharp({ create: { width: (x1 - x0 + 1) * UBIN, height: (y1 - y0 + 1) * UBIN, channels: 3, background: KARTU } })
  .composite(ubin).png().toBuffer();
const penanda = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${LEBAR}" height="${TINGGI}">
  <circle cx="${Math.round(px - kiri)}" cy="${Math.round(py - atas)}" r="11" fill="${MARUN}" stroke="${KARTU}" stroke-width="4"/></svg>`);
// Jalur keluaran dari lokasi skrip (import.meta.url), bukan cwd, supaya tidak pecah kalau dijalankan dari folder lain.
const keluaran = fileURLToPath(new URL('../src/assets/peta/kantor-osm.webp', import.meta.url));
mkdirSync(fileURLToPath(new URL('../src/assets/peta/', import.meta.url)), { recursive: true });
await sharp(kanvas).extract({ left: kiri - x0 * UBIN, top: atas - y0 * UBIN, width: LEBAR, height: TINGGI })
  .composite([{ input: penanda }]).webp({ quality: 85 }).toFile(keluaran);
console.log(`Peta kantor: ${ubin.length} ubin zoom ${ZOOM} -> ${keluaran} (${LEBAR}x${TINGGI})`);
