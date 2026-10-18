// Remah dan navigasi bagian halaman program (MASTER.md, Pembuka halaman program; Panduan Visual 9b).
import { UI } from '../i18n/ui';
import { RUTE, type KunciRute } from '../i18n/rute';
import type { Bahasa } from './dua-bahasa';

export interface ButirRemah { nama: string; url: string }

/** Beranda › induk › halaman ini. Butir pertama "Beranda"/首页 (Naskah 404 Dan Teks Umum, Bilah menu), induk dari menu Program, menu Kegiatan, atau Testimoni. */
export function butirRemah(bahasa: Bahasa, induk: KunciRute[], judul: string, url: string): ButirRemah[] {
  const ui = UI[bahasa];
  const nama = (k: KunciRute) => (k === 'beranda' ? ui.beranda : k === 'program' ? ui.menu.program : k === 'testimoni' ? ui.menu.testimoni
    : (ui.programButir[k] ?? ui.kegiatanButir[k])!.judul);
  return [...(['beranda', ...induk] as KunciRute[]).map((k) => ({ nama: nama(k), url: RUTE[k][bahasa] })), { nama: judul, url }];
}

export interface ButirNavigasi { label: string; id: string }

/** Navigasi bagian hanya untuk halaman dengan lima bagian tampil atau lebih. Bagian 🔁 yang kosong tidak dihitung. */
export function butirNavigasi(butir: (ButirNavigasi & { tampil?: boolean })[]): ButirNavigasi[] {
  const tampil = butir.filter((b) => b.tampil !== false).map(({ label, id }) => ({ label, id }));
  return tampil.length >= 5 ? tampil : [];
}
