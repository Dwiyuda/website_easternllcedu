// Memangkas font LXGW WenKai GB hasil build dalam tiga langkah:
// 1. CSS: hanya aturan @font-face yang rentang unicode-range-nya mencakup minimal satu aksara di halaman 中文 yang
//    dibangun. Tanpa ini CSS penghalang render halaman 中文 membawa 222 aturan (206 KB) (Task 15, ukuran Lighthouse).
// 2. Glyph: setiap potongan woff2 yang tersisa diganti subset yang hanya memuat aksara terpakai di rentangnya
//    (subset-font, harfbuzz WASM). Sebelumnya /zh/ mengunduh sekitar 519 KB potongan paket lxgw-wenkai-gb-web yang
//    hampir semua glyph-nya tidak pernah dipakai. Aturan lain di @font-face (font-display, unicode-range, local()) tidak disentuh.
// 3. Berkas: potongan asli yang url()-nya ada di aturan LXGW CSS Vite tetapi tidak lagi dirujuk berkas teks mana pun di
//    dist dihapus (sekitar 220 berkas, 11 MB). Berbasis rujukan, bukan pola nama; font lain tidak disentuh.
// Tidak ada perubahan tampilan: aturan yang dibuang tidak akan pernah diminta browser untuk halaman itu, dan setiap
// aksara halaman tetap ada di subset yang melayani rentangnya (tes build memeriksa cmap-nya).
// Subset dan CSS yang diubah diberi nama baru menurut hash isinya (HTML ikut ditulis ulang), karena isinya berubah
// mengikuti teks halaman sementara nama dari Vite tidak. Jadi cache "immutable" untuk /_astro/* kelak tetap aman.
// Berkas teks lain yang masih merujuk nama CSS lama menggagalkan build, karena CSS lama sudah dihapus.
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import subsetFont from 'subset-font';

export type Rentang = [mulai: number, akhir: number];

const KELUARGA = 'LXGW WenKai GB';
const ATURAN_FONT = /@font-face\s*\{[^}]*\}/g;
const URL_FONT = /url\(\s*["']?([^"')]+)["']?\s*\)/;
// Berkas teks di dist yang bisa merujuk berkas lain.
const BERKAS_TEKS = /\.(html|css|js|mjs|json|xml|txt|svg|webmanifest|yml)$|(^|\/)_(redirects|headers)$/;
const TITIK_KODE = /^u\+([0-9a-f?]+)(?:-([0-9a-f]+))?$/i;
const milik = (keluarga: string) => new RegExp(`font-family:\\s*["']?${keluarga}["']?\\s*[;}]`);

/** Membaca nilai unicode-range ("U+4E00-4E3F, U+30, U+4??") menjadi daftar rentang titik kode. */
export function bacaRentang(nilai: string): Rentang[] {
  return nilai.split(',').map((bagian) => {
    const t = bagian.trim();
    const m = TITIK_KODE.exec(t);
    if (!m) throw new Error(`unicode-range tidak dikenal: "${t}"`);
    const [, awal, akhir] = m;
    if (awal.includes('?')) return [parseInt(awal.replaceAll('?', '0'), 16), parseInt(awal.replaceAll('?', 'F'), 16)];
    return [parseInt(awal, 16), akhir ? parseInt(akhir, 16) : parseInt(awal, 16)];
  });
}

/** Semua titik kode yang muncul di teks (satu aksara = satu titik kode, termasuk karakter di luar BMP). */
export function aksaraDari(teks: string): Set<number> {
  return new Set([...teks].map((a) => a.codePointAt(0)!));
}

const di = (rentang: Rentang[], a: number) => rentang.some(([mulai, akhir]) => a >= mulai && a <= akhir);

/** Benar kalau ada aksara yang jatuh di salah satu rentang. */
export const mencakup = (rentang: Rentang[], aksara: Iterable<number>) => [...aksara].some((a) => di(rentang, a));

/** Aksara terpakai yang jatuh di rentang, sebagai teks untuk subsetter. */
export const aksaraDalam = (rentang: Rentang[], aksara: Iterable<number>) =>
  [...aksara].filter((a) => di(rentang, a)).map((a) => String.fromCodePoint(a)).join('');

/** Nama berkas dengan hash isi menggantikan hash Vite: "/_astro/0.DL_E82M7.woff2" -> "/_astro/0.<hash>.woff2". */
export const namaBerhash = (jalur: string, isi: string | Uint8Array) =>
  jalur.replace(/(\.[\w-]+)?(\.\w+)$/, `.${createHash('sha256').update(isi).digest('hex').slice(0, 16)}$2`);

/** Membuang aturan @font-face keluarga LXGW yang tidak mencakup aksara terpakai. Teks CSS lain tidak disentuh. */
export function pangkasCss(css: string, aksara: Set<number>, keluarga = KELUARGA): string {
  return css.replace(ATURAN_FONT, (aturan) => {
    if (!milik(keluarga).test(aturan)) return aturan;
    const nilai = /unicode-range:\s*([^;}]+)/i.exec(aturan)?.[1];
    return !nilai || mencakup(bacaRentang(nilai), aksara) ? aturan : '';
  });
}

/**
 * Mengganti url() setiap aturan LXGW dengan alamat dari `tulis(url, teks)`, yang membuat subset berisi `teks`
 * (aksara terpakai di rentang aturan itu). Aturan tanpa url() atau unicode-range menggagalkan build.
 */
export async function subsetCss(css: string, aksara: Set<number>, tulis: (url: string, teks: string) => Promise<string>, keluarga = KELUARGA) {
  const ganti = new Map<string, string>();
  for (const aturan of css.match(ATURAN_FONT) ?? []) {
    if (!milik(keluarga).test(aturan)) continue;
    const url = URL_FONT.exec(aturan)?.[1];
    const nilai = /unicode-range:\s*([^;}]+)/i.exec(aturan)?.[1];
    if (!url || !nilai) throw new Error(`Aturan ${keluarga} tanpa url() atau unicode-range: ${aturan.slice(0, 120)}`);
    ganti.set(aturan, aturan.replace(url, await tulis(url, aksaraDalam(bacaRentang(nilai), aksara))));
  }
  return css.replace(ATURAN_FONT, (aturan) => ganti.get(aturan) ?? aturan);
}

/** Jalur relatif (dengan garis miring biasa) semua berkas berakhiran tertentu di dalam folder. */
const berkasDi = (dir: string, akhiran: string) =>
  readdirSync(dir, { recursive: true }).map((p) => String(p).replaceAll('\\', '/')).filter((p) => p.endsWith(akhiran));

/**
 * Memangkas CSS dan glyph LXGW di folder hasil build, di tempat. Aksara dikumpulkan dari seluruh HTML halaman 中文
 * (zh/**) dan 404.html (dua bahasa); seluruh isi berkas dipakai, bukan hanya teks tampak, supaya alt,
 * aria-label, title, dan teks apa pun yang bisa tampil dengan font itu ikut terhitung (kelebihan hanya
 * menambah beberapa glyph). Galat subset menggagalkan build; CSS baru ditulis setelah semua subset tertulis.
 * Sesudahnya potongan LXGW asli yang tidak lagi dirujuk dihapus, dan rujukan tersisa ke CSS lama menggagalkan build.
 */
export async function pangkasFontDiDist(dist: string) {
  const hasil = { sebelum: 0, sesudah: 0, byteAsli: 0, byteSubset: 0, dibuang: 0, byteDibuang: 0 };
  const semuaHtml = berkasDi(dist, '.html');
  const html = semuaHtml.filter((p) => p.startsWith('zh/') || p === '404.html');
  // Tanpa halaman 中文 tidak ada dasar untuk membuang apa pun, jadi CSS dibiarkan utuh.
  if (html.length === 0) return hasil;
  const aksara = aksaraDari(html.map((p) => readFileSync(join(dist, p), 'utf8')).join(''));
  const tulis = async (url: string, teks: string) => {
    // Potongan di bawah 4 KB (U+E3F, U+FD5-FD6) sudah disisipkan Vite sebagai data: URI; dibiarkan apa adanya.
    if (url.startsWith('data:')) return url;
    if (!url.startsWith('/')) throw new Error(`url() font LXGW bukan jalur absolut: ${url}`);
    const asli = readFileSync(join(dist, url));
    const font = await subsetFont(asli, teks, { targetFormat: 'woff2' });
    const baru = namaBerhash(url, font);
    writeFileSync(join(dist, baru), font);
    hasil.byteAsli += asli.length;
    hasil.byteSubset += font.length;
    return baru;
  };
  const urlAsli = new Set<string>(); // url() semua aturan LXGW di CSS Vite, sebelum dipangkas
  const cssLama: string[] = [];
  for (const p of berkasDi(dist, '.css')) {
    const isi = readFileSync(join(dist, p), 'utf8');
    for (const aturan of isi.match(ATURAN_FONT) ?? []) {
      const url = URL_FONT.exec(aturan)?.[1];
      if (url?.startsWith('/') && milik(KELUARGA).test(aturan)) urlAsli.add(url);
    }
    const baru = await subsetCss(pangkasCss(isi, aksara), aksara, tulis);
    hasil.sebelum += isi.match(ATURAN_FONT)?.length ?? 0;
    hasil.sesudah += baru.match(ATURAN_FONT)?.length ?? 0;
    if (baru === isi) continue;
    const nama = namaBerhash(p, baru);
    writeFileSync(join(dist, nama), baru);
    unlinkSync(join(dist, p));
    cssLama.push(basename(p));
    for (const h of semuaHtml) {
      const teks = readFileSync(join(dist, h), 'utf8');
      if (teks.includes(`/${p}`)) writeFileSync(join(dist, h), teks.replaceAll(`/${p}`, `/${nama}`));
    }
  }
  // Rujukan dicari menurut nama berkas tanpa folder, supaya rujukan relatif ikut terhitung (kalau ragu, berkas disimpan).
  const berkasTeks = berkasDi(dist, '').filter((p) => BERKAS_TEKS.test(p)).map((p) => [p, readFileSync(join(dist, p), 'utf8')] as const);
  const perujuk = (nama: string) => berkasTeks.filter(([, isi]) => isi.includes(nama)).map(([p]) => p);
  // Hanya HTML yang ditulis ulang ke nama CSS baru. Rujukan lain ke CSS yang sudah dihapus akan putus di situs.
  const putus = cssLama.flatMap((n) => perujuk(n).map((p) => `${p} -> ${n}`));
  if (putus.length) throw new Error(`Berkas di dist masih merujuk CSS font Han lama yang sudah dihapus: ${putus.join(', ')}`);
  for (const url of urlAsli) {
    if (perujuk(basename(url)).length) continue;
    hasil.byteDibuang += statSync(join(dist, url)).size;
    unlinkSync(join(dist, url));
    hasil.dibuang++;
  }
  return hasil;
}

/** Peringatan build (bawaan Rencana 5): ada aturan @font-face dan halaman 中文, tapi tidak satu pun dibuang. Itu tanda pemangkasan diam-diam
 *  tidak jalan (misalnya nama keluarga LXGW berubah), dan halaman 中文 akan mengunduh semua potongan font. Tanpa halaman 中文 sebelum = 0. */
export const peringatanPangkas = (h: { sebelum: number; sesudah: number }) =>
  h.sebelum > 0 && h.sesudah === h.sebelum
    ? `Pemangkas font tidak membuang satu pun dari ${h.sebelum} aturan @font-face: periksa nama keluarga LXGW dan CSS font Han.`
    : undefined;
