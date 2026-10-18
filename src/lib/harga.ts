import type { Bahasa } from './dua-bahasa';

/** Harga rupiah untuk jenjang kursus dan study tour. Hanya dipanggil kalau sakelar tampilkan harga menyala. */
export const formatRupiah = (n: number) => `Rp${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;

/** Biaya kampus per tahun (Desain Teknis bagian 4): "RMB 24.800 / tahun" dan "¥24,800/年", boleh rentang. Hanya dipanggil
 *  kalau sakelar biaya kampus menyala. */
export function formatRmb(min: number, sampai: number | undefined, bahasa: Bahasa): string {
  const f = new Intl.NumberFormat(bahasa === 'zh' ? 'zh-CN' : 'id-ID');
  const angka = sampai && sampai > min ? `${f.format(min)}–${f.format(sampai)}` : f.format(min);
  return bahasa === 'zh' ? `¥${angka}/年` : `RMB ${angka} / tahun`;
}
