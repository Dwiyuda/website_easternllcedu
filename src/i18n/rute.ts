// Pasangan alamat Indonesia dan pinyin dari Peta Halaman. "tersedia" berubah true saat halamannya dibangun.
import type { Bahasa } from '../lib/dua-bahasa';

export type KunciRute = 'beranda' | 'tentang' | 'program' | 'kursus' | 'kerjaSama' | 'studyTour' | 'kuliah'
  | 'caraMendaftar' | 'kampus' | 'testimoni' | 'tanyaJawab' | 'kabar' | 'eventSebelumnya' | 'galeri' | 'kontak';

export const RUTE: Record<KunciRute, { id: string; zh: string; tersedia: boolean }> = {
  beranda: { id: '/id/', zh: '/zh/', tersedia: true },
  tentang: { id: '/id/tentang-kami', zh: '/zh/guanyu-women', tersedia: true },
  program: { id: '/id/program', zh: '/zh/xiangmu', tersedia: true },
  kursus: { id: '/id/program/kursus-bahasa', zh: '/zh/xiangmu/yuyan-kecheng', tersedia: true },
  kerjaSama: { id: '/id/program/kerja-sama', zh: '/zh/xiangmu/hezuo-kecheng', tersedia: true },
  studyTour: { id: '/id/program/study-tour', zh: '/zh/xiangmu/youxue', tersedia: true },
  kuliah: { id: '/id/program/kuliah-ke-tiongkok', zh: '/zh/xiangmu/liuxue-zhongguo', tersedia: true },
  caraMendaftar: { id: '/id/program/kuliah-ke-tiongkok/cara-mendaftar', zh: '/zh/xiangmu/liuxue-zhongguo/shenqing-liucheng', tersedia: true },
  kampus: { id: '/id/kampus', zh: '/zh/yuanxiao', tersedia: true },
  testimoni: { id: '/id/testimoni', zh: '/zh/xueyuan-pingjia', tersedia: true },
  tanyaJawab: { id: '/id/tanya-jawab', zh: '/zh/changjian-wenti', tersedia: true },
  kabar: { id: '/id/kabar', zh: '/zh/dongtai', tersedia: true },
  eventSebelumnya: { id: '/id/kabar/event-sebelumnya', zh: '/zh/dongtai/wangqi-huodong', tersedia: true },
  galeri: { id: '/id/galeri', zh: '/zh/xiangce', tersedia: true },
  kontak: { id: '/id/kontak', zh: '/zh/lianxi-women', tersedia: true },
};

export const rapikan = (jalur: string) => {
  const j = jalur.replace(/(index)?\.html$/, '').replace(/\/$/, '');
  return /^\/(id|zh)$/.test(j) ? `${j}/` : j;
};

export type Pasangan = { id: string; zh: string };

export function pasangan(jalur: string): Pasangan | undefined {
  const j = rapikan(jalur);
  const r = Object.values(RUTE).find((x) => x.id === j || x.zh === j);
  return r && { id: r.id, zh: r.zh };
}

/** Tanda menu untuk alamat RUTE: halaman itu sendiri "page"; halaman di bawahnya (detail study tour, nanti kampus dan artikel)
 *  "true", supaya bagian menu yang memuatnya terbuka sendiri (MASTER.md, Menu HP). jalur sudah dirapikan. */
export const tandaKini = (jalur: string, alamat: string) => (jalur === alamat ? 'page' : jalur.startsWith(`${alamat}/`) ? 'true' : undefined);

/** Program di koleksi (Model Konten: empat pilihan tetap) → halaman programnya. Urutan = urutan menu Program dan tab Galeri. */
export const HALAMAN_PROGRAM = { kursus: 'kursus', 'kerja-sama': 'kerjaSama', 'study-tour': 'studyTour', kuliah: 'kuliah' } as const satisfies Record<string, KunciRute>;
export type Program = keyof typeof HALAMAN_PROGRAM;

/** Segmen detail di bawah Kabar & Event (Peta Halaman: /id/kabar/artikel/<slug>, /zh/dongtai/wenzhang/<slug>). */
export const RUTE_DETAIL = { artikel: { id: 'artikel', zh: 'wenzhang' }, event: { id: 'event', zh: 'huodong' } } as const;

/** Alamat detail artikel dan event (Peta Halaman): /id/kabar/artikel/<nama berkas>, /zh/dongtai/wenzhang/<slug pinyin>. */
export const alamatDetail = (jenis: keyof typeof RUTE_DETAIL, slug: string, bahasa: Bahasa) =>
  `${RUTE.kabar[bahasa]}/${RUTE_DETAIL[jenis][bahasa]}/${slug}`;
