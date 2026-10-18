// Slug pinyin alamat 中文 (Model Konten aturan 3, Peta Halaman): dibuat dari teks Mandarin saat build kalau isian slug pinyin kosong.
// Kata dipotong Intl.Segmenter bawaan Node (ICU, tanpa kamus tambahan); tiap kata diubah ke pinyin tanpa nada oleh pinyin-pro,
// yang membawa kamus aksara berbunyi ganda (厦门 = xiamen). Hasil: 浙江大学 → zhejiang-daxue.
import { pinyin } from 'pinyin-pro';

export const POLA_SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const KATA = new Intl.Segmenter('zh', { granularity: 'word' });
const SATU_HAN = /^\p{Script=Han}$/u;

/** Kata Mandarin dalam teks. ICU memecah nama diri yang tidak ada di kamusnya menjadi aksara tunggal (暨|南, 集|美, 武|宁):
 *  aksara tunggal yang berurutan digabung, dan aksara tunggal di ujung (夏令|营) ikut kata sebelumnya. Tanda baca memisah kata. */
export function kataMandarin(teks: string): string[] {
  const hasil: string[] = [];
  let run: { teks: string; tunggal: boolean }[] = [];
  const tutup = () => {
    const akhir = run.at(-1);
    if (run.length > 1 && akhir!.tunggal && akhir!.teks.length === 1) run.at(-2)!.teks += run.pop()!.teks;
    hasil.push(...run.map((r) => r.teks));
    run = [];
  };
  for (const { segment, isWordLike } of KATA.segment(teks)) {
    if (!isWordLike) { tutup(); continue; }
    const tunggal = SATU_HAN.test(segment);
    const akhir = run.at(-1);
    if (tunggal && akhir?.tunggal) akhir.teks += segment;
    else run.push({ teks: segment, tunggal });
  }
  tutup();
  return hasil;
}

/** 浙江大学 → zhejiang-daxue: kata dipisah tanda hubung, suku kata dalam satu kata disambung, huruf kecil, ü ditulis v. */
export function slugPinyin(teks: string): string {
  return kataMandarin(teks.normalize('NFKC'))
    .map((k) => pinyin(k, { toneType: 'none', type: 'array', v: true, nonZh: 'consecutive' }).join('').toLowerCase().replace(/[^a-z0-9]/g, ''))
    .filter(Boolean)
    .join('-');
}

/** Alamat 中文 (Model Konten aturan 3): isian Slug pinyin kalau diisi, kalau kosong dibuat dari nama 中文 (kampus) atau judul 中文
 *  (artikel, event, album). Satu aturan untuk pemeriksaan skema (content.config.ts) dan alamat halaman (lib/konten.ts, lib/galeri.ts). */
export const slugZh = (data: { id: { slugPinyin?: string }; zh?: { nama?: string; judul?: string } | null }) =>
  data.id.slugPinyin || slugPinyin(data.zh?.nama ?? data.zh?.judul ?? '');

/** Dua entri dengan slug sama akan saling menimpa tanpa peringatan: build dihentikan dengan pesan untuk staf. */
export function pastikanUnik(daftar: { slug: string; asal: string }[]): void {
  const sudah = new Map<string, string>();
  for (const { slug, asal } of daftar) {
    const lain = sudah.get(slug);
    if (lain) throw new Error(`Alamat ${slug} dipakai dua entri (${lain} dan ${asal}). Isi "Slug pinyin" salah satunya di panel admin.`);
    sudah.set(slug, asal);
  }
}
