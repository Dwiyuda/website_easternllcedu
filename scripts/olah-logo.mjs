// Mengolah logo kampus dari bahan/logo-kampus/<slug>.<png|jpg|jpeg|webp|svg> menjadi src/assets/logo-kampus/<slug>.png:
// tepi polos dipangkas, sisi terpanjang paling 256 px, tanpa metadata. Lalu mengisi isian logo di src/content/kampus/<slug>.yaml
// kalau belum ada. Logo tidak diberi filter hangat (MASTER.md). bahan/ tidak masuk git, hasilnya masuk.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { basename, extname } from 'node:path';
import sharp from 'sharp';

const BAHAN = 'bahan/logo-kampus';
const HASIL = 'src/assets/logo-kampus';
await mkdir(HASIL, { recursive: true });
const kampus = new Set(readdirSync('src/content/kampus').filter((f) => f.endsWith('.yaml')).map((f) => basename(f, '.yaml')));
let n = 0;
for (const f of existsSync(BAHAN) ? readdirSync(BAHAN) : []) {
  if (!/\.(png|jpe?g|webp|svg)$/i.test(f)) continue;
  const slug = basename(f, extname(f));
  if (!kampus.has(slug)) { console.warn(`Lewati ${f}: tidak ada src/content/kampus/${slug}.yaml`); continue; }
  await sharp(`${BAHAN}/${f}`, { density: 300 }).trim()
    .resize({ width: 256, height: 256, fit: 'inside', withoutEnlargement: true }).png().toFile(`${HASIL}/${slug}.png`);
  const yaml = `src/content/kampus/${slug}.yaml`;
  const isi = readFileSync(yaml, 'utf8');
  if (!/^ {2}logo:/m.test(isi)) writeFileSync(yaml, isi.replace(/^( {2}kota: .+)$/m, `$1\n  logo: ../../assets/logo-kampus/${slug}.png`));
  n++;
}
console.log(`${n} logo kampus diolah ke ${HASIL}`);
