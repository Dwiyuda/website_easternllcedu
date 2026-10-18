// Template pesan WhatsApp (PRD F2, keputusan K4): satu template per bahasa, judul halaman terisi otomatis.
import type { KunciAdmin } from '../data/kontak';
import type { Program } from '../i18n/rute';
import type { Bahasa } from './dua-bahasa';

const TEMPLAT: Record<Bahasa, (judul: string) => string> = {
  id: (judul) => `Halo Eastern, saya ingin bertanya tentang ${judul}.`,
  zh: (judul) => `您好，我想咨询${judul}。`,
};

export function nomorInternasional(nomor: string): string {
  const angka = nomor.replace(/\D/g, '');
  if (!angka.startsWith('0')) throw new Error(`Nomor harus diawali 0: ${nomor}`);
  return `62${angka.slice(1)}`;
}

export function tautanWa(nomor: string, judulHalaman: string, bahasa: Bahasa): string {
  return `https://wa.me/${nomorInternasional(nomor)}?text=${encodeURIComponent(TEMPLAT[bahasa](judulHalaman))}`;
}

// Admin event bawaan per program (Model Konten, Event: "Admin WA tujuan, bawaan mengikuti program"; Peta Halaman, Nomor Per Halaman).
const ADMIN_PROGRAM: Record<Program, KunciAdmin> = { kursus: 'kursusOffline', 'kerja-sama': 'kantor', 'study-tour': 'kantor', kuliah: 'kuliah1' };

/** Admin tombol Daftar di detail event: isian Admin, kalau kosong mengikuti program terkait, tanpa program ke Kantor. */
export const adminEvent = (id: { admin?: KunciAdmin; program?: Program }): KunciAdmin =>
  id.admin ?? (id.program ? ADMIN_PROGRAM[id.program] : 'kantor');
