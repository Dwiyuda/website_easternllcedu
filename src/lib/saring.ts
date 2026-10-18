// Saringan Daftar Kampus (Naskah Daftar Kampus bagian 4). Dipakai skrip halaman dan tes unit; kartu membawa data-kota,
// data-jenjang (dipisah spasi), data-inggris (ada = punya jurusan berbahasa Inggris), dan data-biaya (rentang 0–2).
export type JenisSaring = 'kota' | 'jenjang' | 'inggris' | 'biaya';
export type KeadaanSaring = Record<JenisSaring, string>;
export const SARING_KOSONG: KeadaanSaring = { kota: '', jenjang: '', inggris: '', biaya: '' };

/** Kartu tampil kalau cocok dengan setiap saringan yang aktif (nilai kosong = tanpa saringan). */
export function cocokKampus(kartu: Partial<Record<JenisSaring, string>>, s: KeadaanSaring): boolean {
  return (!s.kota || kartu.kota === s.kota)
    && (!s.jenjang || (kartu.jenjang ?? '').split(' ').includes(s.jenjang))
    && (!s.inggris || kartu.inggris !== undefined)
    && (!s.biaya || kartu.biaya === s.biaya);
}

/** Menekan pilihan yang sedang terpilih melepasnya; "Semua" (nilai kosong) selalu berarti tanpa saringan. */
export const pilihSaring = (s: KeadaanSaring, jenis: JenisSaring, nilai: string): KeadaanSaring =>
  ({ ...s, [jenis]: s[jenis] === nilai ? '' : nilai });

/** Saringan Kabar terbaru (Naskah Kabar Dan Event bagian 3): '' semua, 'event', atau kategori artikel. Baris membawa data-jenis
 *  dan data-kategori (artikel). */
export const cocokKabar = (baris: { jenis?: string; kategori?: string }, saring: string) =>
  !saring || (saring === 'event' ? baris.jenis === 'event' : baris.kategori === saring);
