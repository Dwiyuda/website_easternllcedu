// Satu entri menyimpan dua bahasa dalam satu berkas: blok id (bawaan, juga isian bersama) dan blok zh.
export type Bahasa = 'id' | 'zh';
export const BAHASA: readonly Bahasa[] = ['id', 'zh'];

export interface EntriDuaBahasa {
  id: Record<string, unknown>;
  zh?: Record<string, unknown> | null;
}

export interface Kekurangan {
  bahasa: Bahasa;
  isian: string;
}

export function kosong(nilai: unknown): boolean {
  if (nilai === undefined || nilai === null) return true;
  if (typeof nilai === 'string') return nilai.trim() === '';
  if (Array.isArray(nilai)) return nilai.length === 0;
  return false;
}

export function kekurangan(entri: EntriDuaBahasa, wajib: readonly string[]): Kekurangan[] {
  const hasil: Kekurangan[] = [];
  for (const bahasa of BAHASA) {
    const blok = entri[bahasa] ?? {};
    for (const isian of wajib) if (kosong(blok[isian])) hasil.push({ bahasa, isian });
  }
  return hasil;
}

export const lengkap = (entri: EntriDuaBahasa, wajib: readonly string[]) => kekurangan(entri, wajib).length === 0;

/** Isian terjemahan dari blok bahasanya sendiri, tanpa jatuh ke blok id (bawaan Rencana 4): halaman 中文 tidak pernah menampilkan
 *  teks Indonesia, misalnya keterangan yang baru diisi satu bahasa. Isian bersama (angka, tanggal, gambar, pilihan) dibaca langsung
 *  dari data.id. Isian wajib sudah dijamin terisi dua bahasa oleh gerbang tampil. */
export function ambil<T = string>(entri: EntriDuaBahasa, isian: string, bahasa: Bahasa): T {
  return entri[bahasa]?.[isian] as T;
}

/** Isian opsional teks halaman (misalnya keterangan foto) tampil hanya kalau dua bahasa terisi (Model Konten aturan 1). */
export function bilaLengkap(id: unknown, zh: unknown, bahasa: Bahasa): string | undefined {
  return kosong(id) || kosong(zh) ? undefined : String(bahasa === 'zh' ? zh : id);
}
