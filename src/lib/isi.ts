// Isi artikel dan event dari panel admin (Sveltia rich_text, Markdown terbatas): paragraf, subjudul, daftar, tabel, tebal, miring,
// tautan. Diurai menjadi data, lalu dirender komponen biasa tanpa set:html (IsiTeks.astro), jadi HTML atau skrip yang diketik staf
// selalu tampil sebagai teks. Tautan hanya https:// (alamatHttps); tautan lain menjadi teks labelnya. Tanpa dependensi baru.
import { alamatHttps } from './teks';

export type Inline = string | { tag: 'strong' | 'em'; isi: Inline[] } | { tag: 'a'; href: string; isi: Inline[] };
export type Blok =
  | { jenis: 'paragraf'; isi: Inline[] }
  | { jenis: 'judul'; tingkat: 2 | 3; isi: Inline[] }
  | { jenis: 'daftar'; urut: boolean; butir: Inline[][] }
  | { jenis: 'tabel'; kepala: Inline[][]; baris: Inline[][][] };

// Garis miring terbalik di depan tanda Markdown (Sveltia menulis \* untuk bintang biasa) dibuang, tandanya tetap.
const lepas = (s: string) => s.replace(/\\([\\`*_{}[\]()#+\-.!|>~<])/g, (_, c: string) => c);
// Tautan [teks](alamat), tebal **teks**, miring *teks* atau _teks_ (garis bawah hanya di batas kata, supaya nama_berkas utuh).
// Tebal boleh berisi miring dan sebaliknya (***teks*** dari Sveltia menjadi tebal berisi miring), tanpa bintang tersisa.
// Tanda yang di-escape (\* \[ \_) tidak pernah membuka gaya.
const POLA = /(?<!\\)\[((?:\\.|[^\]\\])+)\]\(([^()\s]+)\)|(?<!\\)\*\*((?:\\.|\*(?:\\.|[^*\\])+?\*|[^*\\])+?)\*\*(?!\*)|(?<!\\)\*((?:\\.|\*\*(?:\\.|[^*\\])+?\*\*|[^*\\])+?)\*(?!\*)|(?<![\p{L}\p{N}\\])_((?:\\.|[^_\\])+?)_(?![\p{L}\p{N}])/u;

export function potongInline(teks: string): Inline[] {
  const hasil: Inline[] = [];
  const tambah = (x: Inline) => {
    if (typeof x !== 'string') hasil.push(x);
    else if (x && typeof hasil.at(-1) === 'string') hasil[hasil.length - 1] += x;
    else if (x) hasil.push(x);
  };
  let sisa = teks;
  for (let m = POLA.exec(sisa); m; m = POLA.exec(sisa)) {
    tambah(lepas(sisa.slice(0, m.index)));
    const [, label, alamat, tebal, miring, miring2] = m;
    if (label !== undefined) {
      const url = alamatHttps(alamat);
      if (url) tambah({ tag: 'a', href: url.href, isi: potongInline(label) });
      else potongInline(label).forEach(tambah);
    } else if (tebal !== undefined) tambah({ tag: 'strong', isi: potongInline(tebal) });
    else tambah({ tag: 'em', isi: potongInline(miring ?? miring2) });
    sisa = sisa.slice(m.index + m[0].length);
  }
  tambah(lepas(sisa));
  return hasil;
}

const BUTIR = /^\s*(?:[-*+]|(\d+)[.)])\s+(.*)$/;
const BARIS_TABEL = /^\s*\|.*\|\s*$/;
const sel = (baris: string) => baris.trim().replace(/^\|/, '').replace(/(?<!\\)\|$/, '').split(/(?<!\\)\|/).map((s) => potongInline(s.trim()));

export function uraiIsi(md: string): Blok[] {
  const blok: Blok[] = [];
  const baris = md.replace(/\r\n?/g, '\n').split('\n');
  let paragraf: string[] = [];
  const tutup = () => {
    if (paragraf.length) blok.push({ jenis: 'paragraf', isi: potongInline(paragraf.join(' ')) });
    paragraf = [];
  };
  for (let i = 0; i < baris.length; i++) {
    const b = baris[i];
    const judul = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(b);
    if (!b.trim()) tutup();
    else if (judul) {
      tutup();
      // Judul halaman sudah h1, jadi # dan ## menjadi h2, ### ke bawah h3.
      blok.push({ jenis: 'judul', tingkat: judul[1].length <= 2 ? 2 : 3, isi: potongInline(judul[2]) });
    } else if (BUTIR.test(b)) {
      tutup();
      const urut = BUTIR.exec(b)![1] !== undefined;
      const butir: Inline[][] = [];
      // ponytail: daftar bertingkat diratakan menjadi satu daftar; tingkat kedua dibuat kalau staf memakainya.
      for (let x = BUTIR.exec(baris[i]); x && (x[1] !== undefined) === urut; x = BUTIR.exec(baris[++i] ?? '')) butir.push(potongInline(x[2]));
      i--;
      blok.push({ jenis: 'daftar', urut, butir });
    } else if (BARIS_TABEL.test(b) && /^\s*\|?\s*:?-{3,}/.test(baris[i + 1] ?? '')) {
      tutup();
      const kepala = sel(b);
      const isi: Inline[][][] = [];
      for (i += 2; i < baris.length && BARIS_TABEL.test(baris[i]); i++) isi.push(sel(baris[i]));
      i--;
      blok.push({ jenis: 'tabel', kepala, baris: isi });
    } else {
      // ponytail: kutipan (> …) tampil sebagai paragraf biasa; blok kutipan dibuat kalau staf memakainya.
      paragraf.push(b.replace(/^\s*>\s?/, '').trim());
    }
  }
  tutup();
  return blok;
}

const polos = (x: Inline[]): string => x.map((i) => (typeof i === 'string' ? i : polos(i.isi))).join('');

/** Teks polos isi untuk deskripsi Google (detail event tanpa ringkasan): paragraf, subjudul, dan daftar, tanpa tabel. */
export function ringkasIsi(md: string, batas = 160): string {
  const teks = uraiIsi(md).flatMap((b) => (b.jenis === 'tabel' ? [] : b.jenis === 'daftar' ? b.butir.map(polos) : [polos(b.isi)])).join(' ');
  if (teks.length <= batas) return teks;
  const potong = teks.slice(0, batas);
  const spasi = potong.lastIndexOf(' ');
  return `${(spasi > batas / 2 ? potong.slice(0, spasi) : potong).replace(/[\s,.;:，。；：、]+$/u, '')}…`;
}
