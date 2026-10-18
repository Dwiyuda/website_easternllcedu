// Data terstruktur Google untuk Beranda (Desain Teknis bagian 6). Telepon memakai nomor Kursus Offline, yang ada di semua sumber,
// dan diturunkan dari src/data/kontak.ts (bawaan Rencana 5). Dicek sama dengan Google Business Profile sebelum tayang (Tayang, langkah 6).
import { ADMIN, ALAMAT_POS, EMAIL, KOORDINAT, SOSIAL } from '../data/kontak';
import type { Bahasa } from './dua-bahasa';
import { nomorInternasional } from './wa';

export function organisasi(situs: string, bahasa: Bahasa) {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Eastern Language Learning Center',
    alternateName: ['Eastern LLC', 'LKP Eastern Language Learning Center', '东方语言学院'],
    url: new URL(bahasa === 'zh' ? '/zh/' : '/id/', situs).href,
    foundingDate: '2006-09-01',
    email: EMAIL,
    telephone: `+${nomorInternasional(ADMIN.kursusOffline.nomor)}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: ALAMAT_POS.jalan,
      addressLocality: ALAMAT_POS.kota,
      addressRegion: ALAMAT_POS.provinsi,
      postalCode: ALAMAT_POS.kodePos,
      addressCountry: 'ID',
    },
    geo: { '@type': 'GeoCoordinates', latitude: KOORDINAT.lintang, longitude: KOORDINAT.bujur },
    sameAs: SOSIAL.map((s) => s.url),
  };
}

/** Isi <script type="application/ld+json">: `<` di-escape supaya teks dari panel admin (misalnya "</script>") tidak menutup skrip. */
export function jsonAman(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/** Jejak navigasi untuk Google (Desain Teknis bagian 6), sama dengan remah yang tampil. */
export function jejak(situs: string, butir: { nama: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: butir.map((b, i) => ({ '@type': 'ListItem', position: i + 1, name: b.nama, item: new URL(b.url, situs).href })),
  };
}

const PENYELENGGARA = { '@type': 'Organization', name: 'Eastern Language Learning Center' } as const;
const bahasaLd = (bahasa: Bahasa) => (bahasa === 'zh' ? 'zh-Hans' : 'id');

/** Artikel untuk Google (Desain Teknis bagian 6). Tanggal diubah dari riwayat Git kalau ada, kalau tidak sama dengan tanggal terbit. */
export function artikelLd(situs: string, a: { judul: string; url: string; terbit: string; diperbarui?: string; gambar: string; bahasa: Bahasa }) {
  return {
    '@context': 'https://schema.org', '@type': 'Article', headline: a.judul, inLanguage: bahasaLd(a.bahasa),
    datePublished: a.terbit, dateModified: a.diperbarui ?? a.terbit, image: [new URL(a.gambar, situs).href],
    mainEntityOfPage: new URL(a.url, situs).href, author: PENYELENGGARA, publisher: PENYELENGGARA,
  };
}

/** Event untuk Google (Desain Teknis bagian 6): tempat menjadi Place, tautan online menjadi VirtualLocation, keduanya Mixed.
 *  Tanpa keduanya (tempat opsional per bahasa), location dan eventAttendanceMode dihilangkan, bukan location kosong. */
export function eventLd(situs: string, e: { judul: string; url: string; mulai: string; selesai?: string; tempat?: string; online?: string; deskripsi: string; bahasa: Bahasa }) {
  const lokasi = [
    ...(e.tempat ? [{ '@type': 'Place', name: e.tempat, address: e.tempat }] : []),
    ...(e.online ? [{ '@type': 'VirtualLocation', url: e.online }] : []),
  ];
  const cara = e.tempat && e.online ? 'Mixed' : e.online ? 'Online' : 'Offline';
  return {
    '@context': 'https://schema.org', '@type': 'Event', name: e.judul, description: e.deskripsi, inLanguage: bahasaLd(e.bahasa),
    startDate: e.mulai, endDate: e.selesai ?? e.mulai, url: new URL(e.url, situs).href,
    eventStatus: 'https://schema.org/EventScheduled', organizer: { ...PENYELENGGARA, url: situs },
    ...(lokasi.length > 0 && {
      eventAttendanceMode: `https://schema.org/${cara}EventAttendanceMode`, location: lokasi.length === 1 ? lokasi[0] : lokasi,
    }),
  };
}
