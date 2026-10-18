/** Mengisi {nama} di teks naskah dengan angka otomatis, misalnya jumlah kampus. */
export function isiTempat(teks: string, nilai: Record<string, string | number>): string {
  return teks.replace(/\{(\w+)\}/g, (_, kunci: string) => {
    if (!Object.hasOwn(nilai, kunci)) throw new Error(`Nilai {${kunci}} tidak tersedia untuk teks: ${teks}`);
    return String(nilai[kunci]);
  });
}

/** Potongan aksara Han dan bukan Han, untuk diberi lang="zh-Hans" di halaman Indonesia (WCAG 3.1.2). */
export function potongHan(teks: string): { teks: string; han: boolean }[] {
  return teks.split(/(\p{Script=Han}+)/u).filter(Boolean).map((t) => ({ teks: t, han: /\p{Script=Han}/u.test(t) }));
}

/** Tautan luar dari isian staf (situs kampus, tautan online event, tautan di isi): hanya https://, alamat yang tidak terbaca tidak
 *  menjadi tautan. Halaman memakai .href hasil URL ini, bukan nilai mentah: "https:host" tanpa // lolos skema Zod dan form,
 *  tapi sebagai href mentah menjadi tautan relatif yang 404 (parkir perbaikan akhir Rencana 3). */
export const alamatHttps = (alamat?: string) => {
  const url = alamat ? URL.parse(alamat) : null;
  return url?.protocol === 'https:' ? url : undefined;
};

/** Teks tanpa aksara Han: isian Indonesia yang menjadi atribut (alt, title, judul pemutar) atau nama kota dan kampus (Ruling Rencana 4,
 *  WCAG 3.1.2: atribut tidak bisa diberi lang sebagian). Rentang BMP (Ext A, Unified, Compatibility) tanpa \p{}, supaya pola yang sama
 *  berlaku di form panel admin, yang membuat RegExp tanpa flag u. */
// ponytail: radikal, 〇, dan aksara di luar BMP (Ext B+) tidak tertangkap; sapuan build \p{Script=Han} tetap menangkapnya di tes.
export const POLA_TANPA_HAN = /^[^\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]*$/;

/** Nama host tautan luar tanpa "www." (baris tempat event "Online · zoom.us" dan baris Online detail event). */
export const namaHost = (url: URL) => url.hostname.replace(/^www\./, '');

/** Inisial anggota tim tanpa foto (Model Konten aturan 10): huruf pertama dua kata pertama, huruf besar. Nama ber-Han: aksara pertama. */
export const inisial = (nama: string) => nama.trim().split(/\s+/).slice(0, 2).map((k) => [...k][0]).join('').toUpperCase();
