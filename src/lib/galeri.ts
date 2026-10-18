// Alamat Galeri per program dan album (Peta Halaman): segmen program = segmen terakhir alamat halaman programnya
// (/id/galeri/kursus-bahasa, /zh/xiangce/yuyan-kecheng); album = nama berkas di Indonesia, slug pinyin di 中文 (lib/konten.ts urlAlbum).
import { HALAMAN_PROGRAM, RUTE, type Program } from '../i18n/rute';
import type { Bahasa } from './dua-bahasa';

export const segmenProgram = (program: Program, bahasa: Bahasa) => RUTE[HALAMAN_PROGRAM[program]][bahasa].split('/').at(-1)!;
export const alamatGaleriProgram = (program: Program, bahasa: Bahasa) => `${RUTE.galeri[bahasa]}/${segmenProgram(program, bahasa)}`;

/** Halaman 1 album tanpa nomor; album di atas FOTO_PER_HALAMAN foto berlanjut ke …/<album>/2 (MASTER.md, Halaman album). */
export const alamatAlbum = (program: Program, slug: string, bahasa: Bahasa, halaman = 1) =>
  `${alamatGaleriProgram(program, bahasa)}/${slug}${halaman > 1 ? `/${halaman}` : ''}`;

export const FOTO_PER_HALAMAN = 60;
/** Foto album per halaman. Album tanpa foto (hanya video) tetap satu halaman. */
export const bagiHalaman = <T>(daftar: T[], per = FOTO_PER_HALAMAN): T[][] =>
  daftar.length === 0 ? [[]] : Array.from({ length: Math.ceil(daftar.length / per) }, (_, i) => daftar.slice(i * per, (i + 1) * per));
