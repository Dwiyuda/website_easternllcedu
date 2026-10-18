// Satu-satunya tempat halaman membaca koleksi. Entri yang belum lengkap dua bahasa tidak pernah tampil (Model Konten aturan 1).
import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import type { ImageMetadata } from 'astro';
import { ASET_CONTOH } from '../data/aset-contoh';
import { alamatDetail, HALAMAN_PROGRAM, RUTE } from '../i18n/rute';
import { UI } from '../i18n/ui';
import type { PenandaContoh } from './contoh';
import { ambil, type Bahasa, type EntriDuaBahasa, type Kekurangan } from './dua-bahasa';
import { alamatAlbum } from './galeri';
import { barisAlumni, hanyaSma, hitungPerKota } from './kampus';
import { pastikanUnik, slugZh } from './slug';
import { statusEvent, sudahTayang, urutTerbaru, type StatusEvent } from './tanggal';
import { alamatHttps, namaHost } from './teks';
import { kekuranganTampil, WAJIB, type Koleksi } from './wajib';

const entri = (data: unknown) => data as EntriDuaBahasa;
const KOLEKSI = Object.keys(WAJIB) as Koleksi[];

export async function ambilTampil<K extends Koleksi>(koleksi: K): Promise<CollectionEntry<K>[]> {
  const semua = (await getCollection(koleksi)) as CollectionEntry<K>[];
  return semua.filter((e) => kekuranganTampil(koleksi, entri(e.data)).length === 0);
}

export interface BarisTertahan { koleksi: Koleksi; entri: string; judul: string; kurang: Kekurangan[] }

export async function daftarTertahan(): Promise<BarisTertahan[]> {
  const hasil: BarisTertahan[] = [];
  for (const koleksi of KOLEKSI) {
    for (const e of await getCollection(koleksi)) {
      const data = entri(e.data);
      const kurang = kekuranganTampil(koleksi, data);
      if (kurang.length) hasil.push({ koleksi, entri: e.id, judul: String(data.id.nama || data.id.judul || e.id), kurang });
    }
  }
  return hasil;
}

export async function daftarContoh(): Promise<PenandaContoh[]> {
  const hasil: PenandaContoh[] = ASET_CONTOH.map((berkas) => ({ koleksi: 'aset', entri: berkas }));
  for (const koleksi of KOLEKSI) {
    for (const e of await getCollection(koleksi)) if (entri(e.data).id.contoh) hasil.push({ koleksi, entri: e.id });
  }
  // Isian tunggal contoh (Model Konten aturan 10).
  if ((await getEntry('jenjang', 'jenjang'))?.data.id.contoh) hasil.push({ koleksi: 'jenjang', entri: 'jenjang' });
  // Visi dan misi Tentang Kami: rumusan contoh sampai rumusan resmi dari cece (Naskah Tentang Kami bagian 5).
  if ((await getEntry('halamanTentang', 'tentang'))?.data.id.visiContoh) hasil.push({ koleksi: 'tentang', entri: 'visi-misi' });
  // Logo kampus yang belum ada: ubin singkatan berlabel Contoh di prototipe, build final tertahan sampai logo resmi dipasang (P10).
  for (const k of await getCollection('kampus')) if (!k.data.id.logo) hasil.push({ koleksi: 'logo-kampus', entri: k.id });
  return hasil;
}

/** Kampus yang tampil: lengkap dua bahasa dan kotanya juga tampil. Satu sumber untuk peta, angka Beranda dan Kuliah ke Tiongkok,
 *  Daftar Kampus, dan detail kampus (bawaan Rencana 1: angka dulu menghitung kampus di kota yang tertahan). */
export async function kampusTampil(): Promise<{ kampus: CollectionEntry<'kampus'>[]; kota: Map<string, CollectionEntry<'kota'>> }> {
  const kota = new Map((await ambilTampil('kota')).map((k) => [k.id, k]));
  const kampus = (await ambilTampil('kampus')).filter((k) => kota.has(k.data.id.kota.id));
  pastikanUnik(kampus.map((k) => ({ slug: slugZhKampus(k), asal: k.id })));
  return { kampus, kota };
}

/** Slug alamat 中文 kampus (aturan di lib/slug.ts). Hanya untuk kampus yang tampil: nama 中文 pasti terisi. */
export const slugZhKampus = (k: CollectionEntry<'kampus'>) => slugZh(k.data);

/** Alamat detail kampus: nama berkas di versi Indonesia, slug pinyin di versi 中文 (Peta Halaman). */
export const alamatKampus = (k: CollectionEntry<'kampus'>, bahasa: Bahasa) =>
  `${RUTE.kampus[bahasa]}/${bahasa === 'zh' ? slugZhKampus(k) : k.id}`;

export interface KotaPeta { slug: string; nama: string; lon: number; lat: number; label: 'kanan' | 'kiri' | 'bawah'; jumlah: number }

/** Kota kampus untuk peta dan angka "{kampus} kampus di {kota} kota"; jumlah kampus berjurusan bahasa Inggris untuk Kuliah ke
 *  Tiongkok (alasan 2). Sekolah SMA saja (Jimei High School) tidak dihitung. */
export async function petaKampus(bahasa: Bahasa): Promise<{ kota: KotaPeta[]; jumlahKampus: number; jumlahInggris: number }> {
  const { kampus, kota } = await kampusTampil();
  const perKota = hitungPerKota(kampus.map((k) => ({ kota: k.data.id.kota.id, jenjang: k.data.id.jenjang })));
  return {
    kota: [...kota.values()].filter((k) => perKota.has(k.id)).map((k) => ({
      slug: k.id, nama: ambil<string>(k.data, 'nama', bahasa), lon: k.data.id.lon, lat: k.data.id.lat,
      label: k.data.id.label, jumlah: perKota.get(k.id)!,
    })),
    jumlahKampus: [...perKota.values()].reduce((a, b) => a + b, 0),
    jumlahInggris: kampus.filter((k) => !hanyaSma(k.data.id.jenjang) && k.data.id.jurusanInggris.length > 0).length,
  };
}

/** Rute kota program study tour, dipisah seperti judul di naskah: "–" dan "、" (Naskah Study Tour bagian 3). Kota yang belum tampil dilewati. */
export async function ruteKota(kota: { id: string }[], bahasa: Bahasa): Promise<string> {
  const nama = new Map((await ambilTampil('kota')).map((k) => [k.id, ambil<string>(k.data, 'nama', bahasa)]));
  return kota.map((k) => nama.get(k.id)).filter(Boolean).join(bahasa === 'zh' ? '、' : '–');
}

export interface EventKartu {
  url: string;
  judul: string; mulai: string; selesai?: string; tempat?: string;
  jenis: CollectionEntry<'event'>['data']['id']['jenis']; contoh: boolean; status: StatusEvent;
}

/** Event yang sudah tayang dan belum selesai, terdekat lebih dulu. Bisa disaring per jenis (Info Session di Kuliah ke Tiongkok). */
export async function eventMendatang(bahasa: Bahasa, hariIni: string, jenis?: EventKartu['jenis']): Promise<EventKartu[]> {
  return (await eventTampil(hariIni))
    .map((e) => ({ e, status: statusEvent(e.data.id.mulai, e.data.id.selesai, hariIni) }))
    .filter(({ e, status }) => status !== 'selesai' && (!jenis || e.data.id.jenis === jenis))
    .sort((a, b) => a.e.data.id.mulai.localeCompare(b.e.data.id.mulai))
    .map(({ e, status }) => ({
      url: alamatKabar('event', e, bahasa), judul: ambil<string>(e.data, 'judul', bahasa), mulai: e.data.id.mulai, selesai: e.data.id.selesai,
      tempat: tempatEvent(e, bahasa), jenis: e.data.id.jenis, contoh: e.data.id.contoh, status,
    }));
}

export interface Kutipan {
  teks: string; nama: string; peran: CollectionEntry<'testimoni'>['data']['id']['peran'];
  program: CollectionEntry<'testimoni'>['data']['id']['program']; tahun?: number; contoh: boolean;
}

/** Kutipan testimoni untuk Beranda, Kuliah ke Tiongkok, dan Testimoni (minor T10 #1 Rencana 2): kalimat dari blok bahasanya,
 *  lalu nama, peran, program, tahun. Testimoni berkutipan dijamin punya kutipan dua bahasa oleh gerbang tampil (lib/wajib.ts). */
export const kutipanTestimoni = (t: CollectionEntry<'testimoni'>, bahasa: Bahasa): Kutipan => ({
  teks: ambil(t.data, 'kutipan', bahasa), nama: t.data.id.nama, peran: t.data.id.peran, program: t.data.id.program,
  tahun: t.data.id.tahun, contoh: t.data.id.contoh,
});

/** Album yang tampil: lengkap dua bahasa dan sudah tayang, terbaru lebih dulu. Alamat 中文 dipastikan unik (lib/slug.ts). */
export async function albumTampil(hariIni: string): Promise<CollectionEntry<'album'>[]> {
  const album = (await ambilTampil('album')).filter((a) => sudahTayang(a.data.id.tayang, hariIni))
    .sort((a, b) => urutTerbaru({ tanggal: a.data.id.tanggal, id: a.id }, { tanggal: b.data.id.tanggal, id: b.id }));
  pastikanUnik(album.map((a) => ({ slug: slugZh(a.data), asal: a.id })));
  return album;
}

/** Alamat album (lib/galeri.ts): nama berkas di versi Indonesia, slug pinyin di versi 中文. */
export const urlAlbum = (a: CollectionEntry<'album'>, bahasa: Bahasa, halaman = 1) =>
  alamatAlbum(a.data.id.program, bahasa === 'zh' ? slugZh(a.data) : a.id, bahasa, halaman);

/** Artikel yang tampil: lengkap dua bahasa dan tanggal terbitnya sudah lewat (tanggal terbit = tanggal tayang, Model Konten),
 *  terbaru lebih dulu. Alamat 中文 dipastikan unik. */
export async function artikelTampil(hariIni: string): Promise<CollectionEntry<'artikel'>[]> {
  const artikel = (await ambilTampil('artikel')).filter((a) => sudahTayang(a.data.id.terbit, hariIni))
    .sort((a, b) => urutTerbaru({ tanggal: a.data.id.terbit, id: a.id }, { tanggal: b.data.id.terbit, id: b.id }));
  pastikanUnik(artikel.map((a) => ({ slug: slugZh(a.data), asal: a.id })));
  return artikel;
}

/** Event yang tampil: lengkap dua bahasa dan sudah tayang, termasuk yang sudah selesai (detail dan arsip tetap ada). */
export async function eventTampil(hariIni: string): Promise<CollectionEntry<'event'>[]> {
  const event = (await ambilTampil('event')).filter((e) => sudahTayang(e.data.id.tayang, hariIni));
  pastikanUnik(event.map((e) => ({ slug: slugZh(e.data), asal: e.id })));
  return event;
}

/** Alamat detail artikel atau event: nama berkas di versi Indonesia, slug pinyin di versi 中文 (Peta Halaman). */
export const alamatKabar = (jenis: 'artikel' | 'event', e: { id: string; data: Parameters<typeof slugZh>[0] }, bahasa: Bahasa) =>
  alamatDetail(jenis, bahasa === 'zh' ? slugZh(e.data) : e.id, bahasa);

/** Baris tempat event (Naskah Kabar Dan Event bagian 2): tempat dari blok bahasanya (tanpa jatuh ke blok id), atau
 *  "Online · <platform>" dengan platform = nama host tautan online, misalnya zoom.us. */
export function tempatEvent(e: CollectionEntry<'event'>, bahasa: Bahasa): string | undefined {
  const tempat = bahasa === 'zh' ? e.data.zh?.tempat : e.data.id.tempat;
  const online = alamatHttps(e.data.id.online);
  return tempat || (online ? `${UI[bahasa].kabar.info.online} · ${namaHost(online)}` : undefined);
}

/** Album dokumentasi event (Naskah Kabar Dan Event, Pola detail event): album yang menunjuk event ini, atau program study tour
 *  yang sama dengan event ini. */
export async function albumEvent(e: CollectionEntry<'event'>, hariIni: string): Promise<CollectionEntry<'album'> | undefined> {
  const studyTour = e.data.id.studyTour?.id;
  return (await albumTampil(hariIni)).find((a) => a.data.id.event?.id === e.id || (studyTour !== undefined && a.data.id.studyTour?.id === studyTour));
}

/** Satu baris aliran Kabar terbaru dan Event Sebelumnya (MASTER.md, Aliran kabar). Artikel bertanggal terbit, event bertanggal mulai. */
export interface BarisKabar {
  jenis: 'artikel' | 'event'; id: string; url: string; tanggal: string; judul: string; contoh: boolean;
  ringkasan?: string; tempat?: string; sampul?: ImageMetadata;
  kategori?: CollectionEntry<'artikel'>['data']['id']['kategori']; jenisEvent?: CollectionEntry<'event'>['data']['id']['jenis'];
}

/** Event yang sudah selesai, terbaru lebih dulu (Kabar terbaru dan Event Sebelumnya). */
export async function eventSelesai(bahasa: Bahasa, hariIni: string): Promise<BarisKabar[]> {
  return (await eventTampil(hariIni)).filter((e) => statusEvent(e.data.id.mulai, e.data.id.selesai, hariIni) === 'selesai')
    .map((e): BarisKabar => ({
      jenis: 'event', id: e.id, url: alamatKabar('event', e, bahasa), tanggal: e.data.id.mulai, judul: ambil<string>(e.data, 'judul', bahasa),
      contoh: e.data.id.contoh, tempat: tempatEvent(e, bahasa), jenisEvent: e.data.id.jenis,
    }))
    .sort(urutTerbaru);
}

/** Kabar terbaru (Naskah Kabar Dan Event bagian 3): artikel yang sudah terbit dan event yang sudah selesai, terbaru lebih dulu. */
export async function aliranKabar(bahasa: Bahasa, hariIni: string): Promise<BarisKabar[]> {
  const artikel = (await artikelTampil(hariIni)).map((a): BarisKabar => ({
    jenis: 'artikel', id: a.id, url: alamatKabar('artikel', a, bahasa), tanggal: a.data.id.terbit, judul: ambil<string>(a.data, 'judul', bahasa),
    contoh: a.data.id.contoh, ringkasan: ambil<string>(a.data, 'ringkasan', bahasa), sampul: a.data.id.sampul, kategori: a.data.id.kategori,
  }));
  return [...artikel, ...(await eventSelesai(bahasa, hariIni))].sort(urutTerbaru);
}

/** Keterangan testimoni (Naskah Testimoni bagian 2 dan 3): nama · peran · program · tahun, tahun dilewati kalau kosong. */
export const keteranganTestimoni = (t: { nama: string; peran: Kutipan['peran']; program: Kutipan['program']; tahun?: number }, bahasa: Bahasa) =>
  [t.nama, UI[bahasa].peran[t.peran], UI[bahasa].programButir[HALAMAN_PROGRAM[t.program]]!.judul, t.tahun].filter(Boolean).join(' · ');

export interface KampusAlumni { url: string; nama: string; kota: string; alumni: string[]; contoh: boolean }

/** Alumni per kampus (Naskah Testimoni bagian 4): kampus tampil yang punya alumni tampil, alumni terbanyak lebih dulu, lalu nama kampus. */
export async function alumniPerKampus(bahasa: Bahasa): Promise<KampusAlumni[]> {
  const [{ kampus, kota }, alumni] = await Promise.all([kampusTampil(), ambilTampil('alumni')]);
  const urut = new Intl.Collator(bahasa === 'zh' ? 'zh-Hans' : 'id').compare;
  return kampus.map((k) => {
    const kotaKampus = kota.get(k.data.id.kota.id)!;
    const provinsi = ambil<string>(kotaKampus.data, 'provinsi', bahasa);
    const milik = alumni.filter((a) => a.data.id.kampus.id === k.id);
    return {
      url: alamatKampus(k, bahasa), nama: ambil<string>(k.data, 'nama', bahasa), kota: ambil<string>(kotaKampus.data, 'nama', bahasa),
      alumni: milik.map((a) => barisAlumni(a.data.id, bahasa, provinsi)), contoh: milik.some((a) => a.data.id.contoh),
    };
  }).filter((k) => k.alumni.length > 0).sort((a, b) => b.alumni.length - a.alumni.length || urut(a.nama, b.nama));
}
