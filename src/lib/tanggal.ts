// Tanggal disimpan sebagai teks YYYY-MM-DD supaya tidak bergeser karena zona waktu.
import { UI } from '../i18n/ui';
import type { Bahasa } from './dua-bahasa';

const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const BULAN_PENDEK = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const bagian = (iso: string) => iso.slice(0, 10).split('-').map(Number) as [number, number, number];

export function formatTanggal(iso: string, bahasa: Bahasa): string {
  const [t, b, h] = bagian(iso);
  return bahasa === 'zh' ? `${t}年${b}月${h}日` : `${h} ${BULAN[b - 1]} ${t}`;
}

export function formatRentang(mulai: string, selesai: string | undefined, bahasa: Bahasa): string {
  if (!selesai || selesai.slice(0, 10) === mulai.slice(0, 10)) return formatTanggal(mulai, bahasa);
  const [t1, b1, h1] = bagian(mulai);
  const [t2, b2, h2] = bagian(selesai);
  if (t1 !== t2) return bahasa === 'zh'
    ? `${formatTanggal(mulai, 'zh')}至${formatTanggal(selesai, 'zh')}`
    : `${formatTanggal(mulai, 'id')} – ${formatTanggal(selesai, 'id')}`;
  if (bahasa === 'zh') return b1 === b2 ? `${t1}年${b1}月${h1}日至${h2}日` : `${t1}年${b1}月${h1}日至${b2}月${h2}日`;
  return b1 === b2 ? `${h1}–${h2} ${BULAN[b1 - 1]} ${t1}` : `${h1} ${BULAN[b1 - 1]} – ${h2} ${BULAN[b2 - 1]} ${t1}`;
}

/** Tanggal n hari setelah iso, dihitung di UTC supaya tidak bergeser zona waktu (jadwal per hari study tour). */
export function tambahHari(iso: string, n: number): string {
  const [t, b, h] = bagian(iso);
  return new Date(Date.UTC(t, b - 1, h + n)).toISOString().slice(0, 10);
}

/** Kotak tanggal (MASTER.md): event memakai hari lalu bulan dan tahun, artikel memakai bulan lalu tahun. */
export function kotakTanggal(iso: string, bahasa: Bahasa, satuan: 'hari' | 'bulan' = 'hari'): { angka: string; bawah: string } {
  const [t, b, h] = bagian(iso);
  if (satuan === 'bulan') return bahasa === 'zh' ? { angka: `${b}月`, bawah: `${t}年` } : { angka: BULAN_PENDEK[b - 1], bawah: String(t) };
  return { angka: String(h), bawah: bahasa === 'zh' ? `${t}年${b}月` : `${BULAN_PENDEK[b - 1]} ${t}` };
}

/** Arsip per tahun (Event Sebelumnya): tahun terbaru lebih dulu, urutan di dalam tahun mengikuti urutan masukan. */
export function kelompokPerTahun<T extends { tanggal: string }>(daftar: T[]): { tahun: number; isi: T[] }[] {
  const peta = new Map<number, T[]>();
  for (const x of daftar) {
    const tahun = bagian(x.tanggal)[0];
    peta.set(tahun, [...(peta.get(tahun) ?? []), x]);
  }
  return [...peta].sort((a, b) => b[0] - a[0]).map(([tahun, isi]) => ({ tahun, isi }));
}

/** WIB = UTC+7 tanpa musim panas, jadi cukup digeser 7 jam. Tidak bergantung format tanggal lokal (en-CA) di ICU. */
export function hariIniJakarta(sekarang: Date = new Date()): string {
  return new Date(sekarang.getTime() + 7 * 3600e3).toISOString().slice(0, 10);
}

const belumMulai = (mulai: string, hariIni: string) => mulai.slice(0, 10) > hariIni;
export const sudahLewat = (selesai: string, hariIni: string) => selesai.slice(0, 10) < hariIni;

export type StatusEvent = 'akan' | 'berlangsung' | 'selesai';
/** Event sehari (tanpa tanggal selesai) berlangsung hanya pada hari mulainya. Event selesai sehari setelah tanggal selesainya. */
export function statusEvent(mulai: string, selesai: string | undefined, hariIni: string): StatusEvent {
  if (belumMulai(mulai, hariIni)) return 'akan';
  return sudahLewat(selesai ?? mulai, hariIni) ? 'selesai' : 'berlangsung';
}
/** Label status otomatis dan kelas lencananya: hijau sampai selesai, lalu krem (Kabar Beranda, kartu dan detail study tour). */
export function lencanaStatus(status: StatusEvent, bahasa: Bahasa): [label: string, kelas: string] {
  const ui = UI[bahasa];
  const peta: Record<StatusEvent, [string, string]> = {
    akan: [ui.akanDatang, 'lencana-sukses'], berlangsung: [ui.sedangBerlangsung, 'lencana-sukses'], selesai: [ui.selesai, 'lencana-selesai'],
  };
  return peta[status];
}
export const sudahTayang = (tayang: string | undefined, hariIni: string) => !tayang || tayang.slice(0, 10) <= hariIni;
/** Terbaru lebih dulu. Tanggal sama diurutkan menurut nama berkas, supaya urutan tidak berubah antar build (bawaan Rencana 4). */
export const urutTerbaru = (a: { tanggal: string; id: string }, b: { tanggal: string; id: string }) =>
  b.tanggal.localeCompare(a.tanggal) || a.id.localeCompare(b.id);
