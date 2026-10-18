// Sekali jalan: mengambil garis pesisir dan sungai dari pratinjau Panduan Visual yang disetujui (commit 34025e4).
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const html = execFileSync('git', ['show', '34025e4:docs/pratinjau/panduan-visual-eastern.html'], { encoding: 'utf8', maxBuffer: 1e8 });
const ambil = (nama) => {
  const m = html.match(new RegExp(`const ${nama} = (\\[\\[[^;]*\\]\\]);`));
  if (!m) throw new Error(`${nama} tidak ditemukan di pratinjau`);
  return m[1];
};

writeFileSync('src/data/peta-tiongkok.ts', `// Garis pesisir daratan, Sungai Yangtze, dan Sungai Kuning dalam [bujur, lintang].
// Diambil dari pratinjau Panduan Visual 2026-10-10 (commit 34025e4) lewat scripts/ekstrak-peta.mjs.
// Tanpa garis batas, pulau, dan wilayah laut (MASTER.md, Peta kampus mitra).
import type { LonLat } from '../lib/peta';

export const PESISIR: readonly LonLat[] = ${ambil('PESISIR')};
export const YANGTZE: readonly LonLat[] = ${ambil('YANGTZE')};
export const HUANGHE: readonly LonLat[] = ${ambil('HUANGHE')};
`);
console.log('src/data/peta-tiongkok.ts ditulis');
