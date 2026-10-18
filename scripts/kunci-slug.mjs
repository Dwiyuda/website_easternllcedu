// Mengunci slug pinyin entri yang sudah tampil (Model Konten aturan 3; Rencana 3 "sebelum domain final"): slug yang selama ini dibuat
// saat build ditulis ke isian Slug pinyin, supaya pembaruan Node (ICU Intl.Segmenter) atau pinyin-pro tidak mengubah alamat 中文 yang
// sudah diindeks. Slug dibaca dari hasil build (hreflang zh-Hans halaman Indonesia), jadi aturannya persis sama dengan situs.
// Jalankan sesudah `npm run build`. Aman diulang: entri yang sudah punya Slug pinyin atau belum tampil dilewati. Dipakai lagi sebelum tayang.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

const halamanId = { kampus: 'id/kampus', artikel: 'id/kabar/artikel', event: 'id/kabar/event' };
const album = readdirSync('dist/id/galeri', { recursive: true }).map((f) => String(f).replaceAll('\\', '/'));
let dikunci = 0;
for (const folder of ['kampus', 'artikel', 'event', 'album']) {
  for (const f of readdirSync(`src/content/${folder}`).filter((x) => x.endsWith('.yaml'))) {
    const nama = f.slice(0, -5);
    const jalur = `src/content/${folder}/${f}`;
    const yaml = readFileSync(jalur, 'utf8');
    if (/^ {2}slugPinyin:/m.test(yaml)) continue;
    const halaman = folder === 'album'
      ? album.filter((p) => p.endsWith(`/${nama}.html`)).map((p) => `id/galeri/${p}`)[0]
      : `${halamanId[folder]}/${nama}.html`;
    let html;
    try { html = readFileSync(`dist/${halaman}`, 'utf8'); } catch { console.log(`dilewati (belum tampil): ${folder}/${nama}`); continue; }
    const zh = html.match(/hreflang="zh-Hans" href="([^"]+)"/)?.[1];
    if (!zh) throw new Error(`dist/${halaman}: tanpa pasangan zh-Hans`);
    const slug = new URL(zh).pathname.split('/').pop();
    if (!/^id:\r?\n/m.test(yaml)) throw new Error(`${jalur}: baris "id:" tidak ditemukan`);
    writeFileSync(jalur, yaml.replace(/^id:(\r?\n)/m, (_, nl) => `id:${nl}  slugPinyin: ${slug}${nl}`));
    dikunci++;
  }
}
console.log(`${dikunci} slug pinyin dikunci.`);
