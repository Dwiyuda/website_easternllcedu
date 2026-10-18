// Isian 🌐 bertanda * di Model Konten. Entri tampil hanya kalau isian ini terisi di dua bahasa.
import { kekurangan, kosong, type EntriDuaBahasa, type Kekurangan } from './dua-bahasa';
import { POLA_TANPA_HAN } from './teks';

export const WAJIB = {
  kota: ['nama', 'provinsi'],
  kampus: ['nama', 'deskripsi'],
  alumni: [],
  event: ['judul', 'isi'],
  artikel: ['judul', 'ringkasan', 'isi'],
  album: ['judul'],
  mitra: [],
  testimoni: [],
  studyTour: ['judul'],
  tim: [],
} as const satisfies Record<string, readonly string[]>;

export type Koleksi = keyof typeof WAJIB;

export function isianWajib(koleksi: Koleksi, entri: EntriDuaBahasa): readonly string[] {
  // Testimoni butuh kutipan atau video (Model Konten). Video saja: tanpa isian terjemahan wajib. Selain itu kutipan wajib dua bahasa,
  // jadi testimoni tanpa kutipan dan tanpa video tertahan (bawaan Rencana 4: aturan ini dulu .refine di skema dan menggagalkan build).
  if (koleksi === 'testimoni') return kosong(entri.id.kutipan) && !kosong(entri.id.video) ? [] : ['kutipan'];
  return WAJIB[koleksi];
}

// Isian blok Indonesia yang juga menjadi atribut (alt poster, judul pemutar video, title titik peta, judul kartu) atau nama kota dan
// kampus. Isian ini diterjemahkan, jadi pola di form ikut berlaku di tab 中文 dan tidak bisa dipakai: aksara Han di sini membuat entri
// tertahan sampai teksnya dipindah ke isian 中文 (Ruling Rencana 4, WCAG 3.1.2). Situs tetap terbangun, staf melihatnya di Entri Tertahan.
export const TANPA_HAN_ID: Partial<Record<Koleksi, readonly string[]>> = {
  kota: ['nama', 'provinsi'], kampus: ['nama'], event: ['judul'], album: ['judul'], studyTour: ['judul'],
};

/** Semua alasan entri belum tampil: isian wajib yang kosong di salah satu bahasa, lalu isian Indonesia yang berisi aksara Han. */
export function kekuranganTampil(koleksi: Koleksi, entri: EntriDuaBahasa): Kekurangan[] {
  const han = (TANPA_HAN_ID[koleksi] ?? []).filter((i) => !POLA_TANPA_HAN.test(String(entri.id[i] ?? '')))
    .map((isian) => ({ bahasa: 'id' as const, isian: `${isian} (aksara Han)` }));
  return [...kekurangan(entri, isianWajib(koleksi, entri)), ...han];
}
