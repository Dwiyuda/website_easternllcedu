import type { ImageMetadata } from 'astro';
import type { BEASISWA, Jenjang } from '../content.config';
import { UI } from '../i18n/ui';
import type { Bahasa } from './dua-bahasa';
import { isiTempat } from './teks';

// Jimei High School (jenjang SMA saja) tampil di Daftar Kampus tapi tidak dihitung sebagai kampus (2026-10-11).
export const hanyaSma = (jenjang: readonly string[]) => jenjang.length > 0 && jenjang.every((j) => j === 'SMA');

export function hitungPerKota(kampus: { kota: string; jenjang: readonly string[] }[]): Map<string, number> {
  const hasil = new Map<string, number>();
  for (const k of kampus) if (!hanyaSma(k.jenjang)) hasil.set(k.kota, (hasil.get(k.kota) ?? 0) + 1);
  return hasil;
}

const KECIL = new Set(['of', 'and', 'the']);
/** Singkatan nama untuk ubin logo selama logo resmi belum ada (P10): Zhejiang Sci-Tech University → ZSTU, paling empat huruf. */
export const singkatan = (nama: string) =>
  nama.split(/[\s-]+/).filter((k) => k && !KECIL.has(k.toLowerCase())).map((k) => k[0].toUpperCase()).join('').slice(0, 4);

/** Templat lokasi satu kota ("{kota}, {provinsi}", judul kelompok kota). Kota setingkat provinsi (nama Indonesianya sama dengan
 * provinsinya: Beijing, Shanghai) ditulis sekali, jadi provinsi dan pemisahnya dibuang: "Beijing", bukan "Beijing, Beijing";
 * 北京, bukan 北京 · 北京市 (ruling concern Task 10). */
export const templatLokasi = (templat: string, kota: { nama?: string; provinsi?: string }) =>
  kota.nama === kota.provinsi ? templat.replace(/\s*[,·]\s*\{provinsi\}/, '') : templat;

/** Rentang saringan biaya (P9) menurut biaya kuliah termurah: 0 di bawah RMB 15.000, 1 RMB 15.000–25.000, 2 di atas RMB 25.000. */
export const kelompokBiaya = (min: number) => (min < 15000 ? 0 : min <= 25000 ? 1 : 2);

/** Isi satu kartu kampus di Daftar Kampus. biaya hanya diisi kalau sakelar biaya kampus menyala dan angkanya ada. */
export interface DataKartuKampus {
  url: string; nama: string; namaZh: string; logo?: ImageMetadata; jenjang: Jenjang[]; alumni: boolean; contoh: boolean;
  kota: string; inggris: boolean; tujuanAlumni: boolean; biaya?: { min: number; sampai?: number; tahun: number };
}

/** Satu baris alumni (Naskah Testimoni bagian 4, Naskah Daftar Kampus): nama disingkat · jenjang · tahun berangkat · beasiswa, bagian
 *  yang kosong dilewati. {provinsi} di label beasiswa provinsi diisi provinsi kota kampusnya. Dipakai Testimoni dan detail kampus. */
export const barisAlumni = (a: { nama: string; jenjang?: Jenjang; tahun?: number; beasiswa?: (typeof BEASISWA)[number] }, bahasa: Bahasa, provinsi: string) =>
  [a.nama, a.jenjang && UI[bahasa].jenjang[a.jenjang], a.tahun, a.beasiswa && isiTempat(UI[bahasa].beasiswa[a.beasiswa], { provinsi })]
    .filter(Boolean).join(' · ');
