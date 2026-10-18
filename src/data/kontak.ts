// VERSI PUBLIK (SHOWCASE): semua nilai di berkas ini adalah DATA CONTOH.
// Nomor WhatsApp, email, alamat, koordinat, legalitas, dan akun media sosial
// asli milik klien TIDAK disertakan di repo publik ini.
import type { Bahasa } from '../lib/dua-bahasa';

type Dua = Record<Bahasa, string>;
export interface Admin { nomor: string; layanan: Dua; keterangan: Dua }

export const ADMIN = {
  kursusOffline: {
    nomor: '0800 0000 001',
    layanan: { id: 'Kursus Offline', zh: '线下课程' },
    keterangan: { id: 'Kursus Mandarin di kantor (alamat contoh).', zh: '线下中文课程（示例地址）。' },
  },
  kursusOnline: {
    nomor: '0800 0000 002',
    layanan: { id: 'Kursus Online', zh: '线上课程' },
    keterangan: { id: 'Kursus Mandarin lewat Zoom.', zh: '通过Zoom上课的中文课程。' },
  },
  kuliah1: {
    nomor: '0800 0000 003',
    layanan: { id: 'Kuliah ke Tiongkok', zh: '中国留学' },
    keterangan: { id: 'Jurusan, kampus, beasiswa, pendaftaran, dan visa.', zh: '专业、院校、奖学金、申请和签证。' },
  },
  kuliah2: {
    nomor: '0800 0000 004',
    layanan: { id: 'Kuliah ke Tiongkok', zh: '中国留学' },
    keterangan: { id: 'Nomor kedua admin kuliah.', zh: '留学顾问的第二个号码。' },
  },
  kantor: {
    nomor: '0800 0000 005',
    layanan: { id: 'Kantor', zh: '办公室' },
    keterangan: { id: 'Study tour, kelas di sekolah dan perusahaan, dan keperluan lain.', zh: '游学、学校与企业合作课程及其他事务。' },
  },
} as const satisfies Record<string, Admin>;

export type KunciAdmin = keyof typeof ADMIN;

export const EMAIL = 'kontak@contoh.example';
// Alamat contoh untuk data terstruktur Google.
export const ALAMAT_POS = { jalan: 'Jl. Contoh No. 1, Kecamatan Contoh', kota: 'Pekanbaru', provinsi: 'Riau', kodePos: '00000' } as const;
const alamatLengkap = `${ALAMAT_POS.jalan}, ${ALAMAT_POS.kota}, ${ALAMAT_POS.provinsi} ${ALAMAT_POS.kodePos}`;
export const ALAMAT: Dua = {
  id: alamatLengkap,
  zh: `${alamatLengkap}, Indonesia（印度尼西亚廖内省北干巴鲁市）`,
};
export const ALAMAT_RINGKAS: Dua = {
  id: 'Jl. Contoh No. 1, Pekanbaru, Riau 00000',
  zh: '印度尼西亚北干巴鲁 Jl. Contoh No. 1（邮编00000）',
};
export const JAM: Dua = {
  id: 'Senin–Jumat 09.00–17.00 · Sabtu 09.00–16.00 · Minggu tutup',
  zh: '周一至周五 09:00–17:00 · 周六 09:00–16:00 · 周日休息',
};
// Koordinat contoh (pusat kota Pekanbaru), bukan lokasi kantor asli.
export const KOORDINAT = { lintang: 0.5071, bujur: 101.4478 } as const;
export const PETA = {
  google: `https://www.google.com/maps/search/?api=1&query=${KOORDINAT.lintang}%2C${KOORDINAT.bujur}`,
  sematan: `https://maps.google.com/maps?q=${KOORDINAT.lintang},${KOORDINAT.bujur}&z=17&output=embed`,
  osm: `https://www.openstreetmap.org/?mlat=${KOORDINAT.lintang}&mlon=${KOORDINAT.bujur}#map=18/${KOORDINAT.lintang}/${KOORDINAT.bujur}`,
} as const;

// Legalitas contoh (bukan nomor NIB/izin asli).
export const LEGALITAS = {
  nib: '0000000000000',
  izin: 'No. 00/00.00/CONTOH/0000',
  mulai: '2025-01-01',
  sampai: '2028-01-01',
  badan: { id: 'Persekutuan Perdata', zh: '合伙企业（Persekutuan Perdata）' },
  layanan: { id: 'Kursus Bahasa Mandarin dan Bahasa Inggris', zh: '中文课程、英语课程' },
} as const;

// Akun media sosial contoh.
export const SOSIAL = [
  { nama: 'Instagram', akun: '@contoh', url: 'https://www.instagram.com/', ikon: 'merek-instagram' },
  { nama: 'Facebook', akun: 'Eastern Language Learning Center', url: 'https://www.facebook.com/', ikon: 'merek-facebook' },
  { nama: 'YouTube', akun: 'Eastern LLC', url: 'https://www.youtube.com/', ikon: 'merek-youtube' },
] as const;
