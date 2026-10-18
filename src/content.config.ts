// Skema semua koleksi. Bentuk berkas mengikuti Sveltia CMS i18n single_file: blok id (bawaan dan isian bersama)
// dan blok zh (terjemahan). Blok zh boleh tidak lengkap: entri itu disaring saat build (lib/konten.ts).
import { defineCollection, reference, type SchemaContext } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { kosong } from './lib/dua-bahasa';
import { POLA_SLUG, slugZh } from './lib/slug';
import { POLA_TANPA_HAN } from './lib/teks';
import { POLA_YOUTUBE } from './lib/video';

export const JENJANG = ['SMA', 'Bahasa', 'Diploma', 'S1', 'S2', 'S3'] as const;
export type Jenjang = (typeof JENJANG)[number];
export const BEASISWA = ['csc', 'provinsi', 'president', 'guru-mandarin', 'kampus', 'mandiri'] as const;
export const JENIS_EVENT = ['info-session', 'pembukaan-kelas', 'ujian-hsk', 'kegiatan-budaya', 'lainnya'] as const;
export const PROGRAM = ['kursus', 'kerja-sama', 'study-tour', 'kuliah'] as const;
export const KATEGORI = ['kuliah', 'belajar-mandarin', 'kegiatan', 'pengumuman'] as const;
export const PERAN = ['siswa', 'orang-tua', 'alumni', 'peserta-camp'] as const;
export const JENIS_STUDY_TOUR = ['summer-camp', 'winter-camp', 'campus-tour', 'culture-experience'] as const;
// Empat tim Eastern (Naskah Tentang Kami bagian 6, Model Konten Tim). Urutan = urutan kartu tim di halaman.
export const TIM = ['learning-advisor', 'guru', 'kurikulum', 'it-media'] as const;

const teks = z.string();
// Panel admin (Sveltia) menulis isian opsional yang tidak diisi sebagai '' atau null, bukan menghilangkannya. Keduanya sama dengan
// "tidak diisi". Satu pembantu ini dipakai di SEMUA isian opsional; skema yang dibungkus harus sudah menerima undefined (.optional() atau .default()).
const opsional = <T extends z.ZodType>(skema: T) => z.preprocess((v) => (v === '' || v === null ? undefined : v), skema);
// Isian "wajib untuk tampil" boleh kosong di berkas: entri setengah isi harus tetap bisa dibaca. Kosong tetap dihitung kurang
// oleh gerbang tampil (lib/dua-bahasa.ts), jadi entri itu disaring saat build (lib/konten.ts), bukan ditolak skema.
const wajibTampil = opsional(teks.optional());
// Sveltia bisa menulis tanggal tanpa tanda kutip, dan pembaca YAML mengubahnya menjadi Date. Keduanya dijadikan teks YYYY-MM-DD.
const tanggal = z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}/), z.date()])
  .transform((v) => (typeof v === 'string' ? v.slice(0, 10) : v.toISOString().slice(0, 10)));
// Sakelar di form yang menandainya required: false: '' atau null berarti mati. Dipakai semua isian ya/tidak berbawaan mati.
const sakelar = opsional(z.boolean().default(false));
// image() di content layer meloloskan alamat web begitu saja dan impornya diabaikan senyap, padahal hanya foto asli Eastern dari berkas repo yang boleh tayang.
const gambar = (image: SchemaContext['image']) => z.preprocess((v, ctx) => {
  if (typeof v === 'string' && /^(https?:)?\/\//i.test(v)) ctx.addIssue({ code: 'custom', message: 'Gambar harus berkas yang diunggah lewat panel admin, bukan alamat web.' });
  return v;
}, image());
// ponytail: tipe dipersempit ke ZodOptional supaya data.zh.<isian> bertipe string | undefined, padahal isinya preprocess dari opsional().
const terjemahan = <T extends Record<string, z.ZodType>>(isian: T) => z.object(
  Object.fromEntries(Object.entries(isian).map(([k, v]) => [k, opsional(v.optional())])) as unknown as { [K in keyof T]: z.ZodOptional<T[K]> },
).nullish();
const dariFolder = (nama: string) => glob({ pattern: '*.yaml', base: `./src/content/${nama}` });
// Tautan luar dari isian staf: hanya https:// (z.url() saja meloloskan javascript://). Pesan menyebut isiannya, untuk staf.
const urlHttps = (isian: string) => z.url({ protocol: /^https$/, error: `${isian}: alamat harus diawali https://` });
// Video YouTube dengan sampul sendiri (Model Konten aturan 7: setiap video wajib punya sampul), karena halaman 中文 tidak memuat
// gambar dari YouTube. Satu objek, jadi panel admin menolak menyimpan tautan tanpa sampul.
const video = (image: SchemaContext['image']) => z.object({
  youtube: z.string().regex(POLA_YOUTUBE, 'Video: tautan YouTube diawali https://www.youtube.com/watch?v= atau https://youtu.be/'),
  sampul: gambar(image),
});
// Slug pinyin (Model Konten aturan 3): kosong = dibuat dari nama atau judul 中文 saat build (lib/slug.ts).
const isianSlug = opsional(z.string().regex(POLA_SLUG, 'Slug pinyin: huruf kecil, angka, dan tanda hubung, contoh zhejiang-daxue').optional());
// Alamat 中文 kosong tidak boleh lolos: nama atau judul 中文 tanpa aksara atau huruf (mis. hanya tanda baca) menghentikan build di sini.
// Nama atau judul 中文 yang belum diisi tidak diperiksa: entrinya tertahan di gerbang tampil dan belum punya alamat. Slug pinyin yang
// diisi sudah diperiksa isiannya sendiri (refine tetap jalan sesudah isian gagal), jadi dilewati supaya pesannya tidak ganda.
const slugZhSah = (d: { id: { slugPinyin?: string }; zh?: { nama?: string; judul?: string } | null }) =>
  Boolean(d.id.slugPinyin) || kosong(d.zh?.nama ?? d.zh?.judul) || POLA_SLUG.test(slugZh(d));
const PESAN_SLUG = {
  path: ['id', 'slugPinyin'],
  message: 'Alamat 中文 tidak bisa dibuat dari nama atau judul 中文: isi Slug pinyin dengan huruf kecil, angka, dan tanda hubung, contoh zhejiang-daxue',
};

const teksBeranda = z.object({
  seo: z.object({ judul: teks, deskripsi: teks }),
  pembuka: z.object({ judul: teks, kalimat: teks, tombol: teks }),
  angka: z.object({ berdiri: teks, alumni: teks, kampus: teks, siswa: teks }),
  program: z.object({ judul: teks, kartu: z.array(z.object({ judul: teks, kalimat: teks })).length(4) }),
  kenapa: z.object({ judul: teks, kalimat: teks, alasan: z.array(z.object({ judul: teks, bukti: teks })).length(8) }),
  kampus: z.object({ judul: teks, kalimat: teks, tautan: teks }),
  alumni: z.object({ judul: teks, kalimat: teks, tautan: teks }),
  kabar: z.object({ judul: teks, tautan: teks }),
  sekolah: z.object({ judul: teks, kalimat: teks }),
  legalitas: z.object({ judul: teks, tautan: teks }),
  penutup: z.object({ judul: teks, kalimat: teks }),
});

const seo = z.object({ judul: teks, deskripsi: teks });
const bagian = z.object({ judul: teks, kalimat: teks });
const kartuTeks = z.object({ judul: teks, bukti: teks });
// Keterangan foto pembuka (Model Konten aturan 9) opsional: tampil hanya kalau dua bahasa terisi (lib/dua-bahasa.ts bilaLengkap).
const pembuka = z.object({ judul: teks, kalimat: teks, foto: opsional(teks.optional()) });

// Teks tetap satu halaman (Model Konten, Halaman): blok id dan zh wajib lengkap seperti Beranda. Daftar berjumlah tetap,
// sama dengan naskah, supaya urutan dua bahasa selalu berpasangan. Isian khusus blok id (angka, tanggal) di khususId.
const halaman = <T extends z.ZodRawShape, K extends z.ZodRawShape>(berkas: string, isi: z.ZodObject<T>, khususId: K) => defineCollection({
  loader: glob({ pattern: `${berkas}.yaml`, base: './src/content/halaman' }),
  schema: z.object({ id: isi.extend(khususId), zh: isi }),
});

const teksKursus = z.object({
  seo, pembuka, navigasi: z.array(teks).length(6),
  belajar: z.object({ judul: teks, kartu: z.array(kartuTeks).length(2) }),
  jenjang: z.object({ judul: teks, hsk: teks, kalimat: teks }),
  jadwal: bagian, inggris: bagian,
  karya: z.object({ judul: teks, kalimat: teks, tautan: teks }),
  tanya: z.object({ judul: teks, daftar: z.array(z.object({ tanya: teks, jawab: teks })).length(7) }),
  penutup: bagian,
});
const teksKerjaSama = z.object({
  seo, pembuka,
  sekolah: z.object({ judul: teks, kalimat: teks, butir: z.array(teks).length(3), foto: teks }),
  perusahaan: z.object({ judul: teks, kalimat: teks, klien: teks, foto: teks }),
  penutup: bagian,
});
const teksStudyTour = z.object({
  seo, pembuka, navigasi: z.array(teks).length(5),
  jenis: z.object({ judul: teks, kartu: z.array(kartuTeks).length(3) }),
  program: z.object({ judul: teks }),
  detail: z.object({ termasuk: teks, jadwal: teks, biaya: teks }),
  penutup: bagian,
});
const teksKuliah = z.object({
  seo, pembuka: pembuka.extend({ angka: teks }), navigasi: z.array(teks).length(8),
  tiongkok: z.object({ judul: teks, kalimat: teks, alasan: z.array(kartuTeks).length(4) }),
  layanan: z.object({ judul: teks, kalimat: teks, langkah: z.array(bagian).length(5), tautan: teks }),
  jenjang: z.object({ judul: teks, kartu: z.array(kartuTeks).length(5) }),
  // kalimat hanya kalimat tambahan; halaman menggabungkannya di belakang alumni.kalimat Beranda (D4).
  alumni: z.object({ judul: teks, kalimat: teks, tautan: teks }),
  info: bagian,
  penutup: z.object({ judul: teks, kalimat: teks, tautan: teks }),
});
const teksCaraMendaftar = z.object({
  seo, pembuka, langkah: z.array(bagian).length(6),
  dokumen: z.object({ judul: teks, kalimat: teks, daftar: z.array(z.object({ nama: teks, bahasa: opsional(teks.optional()) })).length(14) }),
  tambahan: z.object({ judul: teks, kalimat: teks, singkatan: teks, kampus: z.array(z.object({ nama: teks, dokumen: z.array(teks).min(1) })).length(7) }),
  csca: z.object({ judul: teks, isi: teks }),
  penutup: bagian,
});
// Halaman Tanya Jawab (10 tanya-jawab dipindah dari Cara Mendaftar): pembuka ringkas, akordeon, penutup konsultasi.
const teksTanyaJawab = z.object({
  seo, pembuka: bagian,
  tanya: z.array(z.object({ tanya: teks, jawab: teks })).length(10),
  penutup: bagian,
});
// Halaman Testimoni (Naskah Testimoni). alumni.kalimat memakai {alumni} dan {kampus} (angka otomatis); tahun angkatan ditulis di teks (P20).
const teksTestimoni = z.object({
  seo, pembuka: bagian, video: z.object({ judul: teks }), kutipan: z.object({ judul: teks }),
  alumni: bagian, karya: bagian, camp: z.object({ judul: teks }), penutup: bagian,
});
// Halaman Tentang Kami (Naskah Tentang Kami, Model Konten Halaman). Tahun linimasa, nama pendiri, kunci tim, dan penanda contoh visi
// dan misi adalah isian bersama (＝), jadi hanya di blok id. Pesan pendiri dan visi dan misi opsional: bagiannya tersembunyi kalau kosong.
const pendiri = z.object({ judul: teks, sebutan: opsional(teks.optional()), pesan: opsional(teks.optional()) });
const butirSejarah = z.object({ judul: teks, teks });
const penjelasanTim = z.object({ nama: teks, penjelasan: teks });
const teksTentang = z.object({
  seo, pembuka, legalitas: z.object({ judul: teks }),
  profil: z.object({ judul: teks, paragraf: z.array(teks).length(2), nama: teks }),
  pendiri,
  sejarah: z.object({ judul: teks, butir: z.array(butirSejarah).length(6) }),
  visi: z.object({ judul: teks, visi: opsional(teks.optional()), misi: opsional(z.array(teks).default([])) }),
  tim: z.object({ judul: teks, daftar: z.array(penjelasanTim).length(4) }),
  fasilitas: z.object({ judul: teks, foto: z.array(z.object({ apa: teks, kapan: teks })).length(2) }),
  penutup: z.object({ judul: teks }),
});
// Halaman Kontak (Naskah Kontak). Nomor admin, alamat, jam, koordinat, dan legalitas tidak ada di sini: hanya di src/data/kontak.ts.
const teksKontak = z.object({
  seo, pembuka: bagian,
  kantor: z.object({ judul: teks, foto: teks, peta: teks }),
  admin: z.object({ judul: teks, kalimat: teks, salin: teks, email: teks }),
  sosial: z.object({ judul: teks }),
  legalitas: z.object({ tautan: teks }),
});
const jenjangTeks = z.object({ nama: teks, pertemuan: teks, lama: teks, isi: teks });

export const collections = {
  beranda: defineCollection({
    loader: glob({ pattern: 'beranda.yaml', base: './src/content/halaman' }),
    schema: z.object({ id: teksBeranda.extend({ siswa: teks }), zh: teksBeranda }),
  }),
  halamanKursus: halaman('kursus', teksKursus, {}),
  halamanKerjaSama: halaman('kerja-sama', teksKerjaSama, {}),
  halamanStudyTour: halaman('study-tour', teksStudyTour, {}),
  halamanKuliah: halaman('kuliah', teksKuliah, {}),
  halamanCaraMendaftar: halaman('cara-mendaftar', teksCaraMendaftar, { cscaDiperbarui: tanggal }),
  halamanTanyaJawab: halaman('tanya-jawab', teksTanyaJawab, {}),
  halamanTestimoni: halaman('testimoni', teksTestimoni, {}),
  halamanTentang: defineCollection({
    loader: glob({ pattern: 'tentang.yaml', base: './src/content/halaman' }),
    schema: z.object({
      id: teksTentang.extend({
        pendiri: pendiri.extend({ nama: opsional(teks.optional()) }),
        sejarah: z.object({ judul: teks, butir: z.array(butirSejarah.extend({ tahun: teks })).length(6) }),
        tim: z.object({ judul: teks, daftar: z.array(penjelasanTim.extend({ tim: z.enum(TIM) })).length(4) }),
        visiContoh: sakelar,
      }),
      zh: teksTentang,
    }),
  }),
  halamanKontak: halaman('kontak', teksKontak, {}),
  // Jenjang Kursus (Model Konten, isian tunggal): empat jenjang, satu sakelar harga bawaan mati. Target dan harga di blok id saja.
  jenjang: defineCollection({
    loader: glob({ pattern: 'jenjang.yaml', base: './src/content/halaman' }),
    schema: z.object({
      id: z.object({
        tampilkanHarga: sakelar, contoh: sakelar,
        daftar: z.array(jenjangTeks.extend({
          target: teks, hargaReguler: opsional(z.number().int().optional()), hargaWeekend: opsional(z.number().int().optional()),
        })).length(4),
      }),
      zh: z.object({ daftar: z.array(jenjangTeks).length(4) }),
    }),
  }),
  kota: defineCollection({
    loader: dariFolder('kota'),
    schema: z.object({
      id: z.object({ nama: wajibTampil, provinsi: wajibTampil, lon: z.number(), lat: z.number(), label: opsional(z.enum(['kanan', 'kiri', 'bawah']).default('kanan')), contoh: sakelar }),
      zh: terjemahan({ nama: teks, provinsi: teks }),
    }),
  }),
  kampus: defineCollection({
    loader: dariFolder('kampus'),
    schema: ({ image }) => z.object({
      id: z.object({
        nama: wajibTampil, deskripsi: wajibTampil, kota: reference('kota'),
        slugPinyin: isianSlug,
        jenjang: opsional(z.array(z.enum(JENJANG)).default([])),
        logo: opsional(gambar(image).optional()),
        situs: opsional(urlHttps('Situs').optional()),
        // Nama asli dari website lama, tidak diterjemahkan (Naskah Daftar Kampus, Pola halaman detail kampus).
        jurusanInggris: opsional(z.array(z.object({ nama: teks, jenjang: z.enum(JENJANG) })).default([])),
        jurusanUnggulan: opsional(z.array(teks).default([])), beasiswa: opsional(z.array(teks).default([])),
        // Biaya per tahun dalam RMB, boleh rentang. Tampil hanya kalau sakelar biaya kampus di Pengaturan Situs menyala (PRD F3).
        biayaKuliah: opsional(z.number().int().positive().optional()), biayaKuliahSampai: opsional(z.number().int().positive().optional()),
        biayaAsrama: opsional(z.number().int().positive().optional()), biayaAsramaSampai: opsional(z.number().int().positive().optional()),
        tahunBiaya: opsional(z.number().int().default(2026)),
        // Enam kampus top hanya muncul di alumni, Eastern bukan agen resminya: "kampus tujuan alumni", bukan mitra (keputusan pemilik 2026-10-17). Bawaan mati = mitra.
        tujuanAlumni: sakelar,
        contoh: sakelar,
      }),
      zh: terjemahan({ nama: teks, deskripsi: teks, jurusanUnggulan: z.array(teks), beasiswa: z.array(teks) }),
    }).refine(slugZhSah, PESAN_SLUG),
  }),
  alumni: defineCollection({
    loader: dariFolder('alumni'),
    schema: z.object({
      id: z.object({
        nama: teks, kampus: reference('kampus'), tahun: opsional(z.number().int().optional()),
        jenjang: opsional(z.enum(JENJANG).optional()), beasiswa: opsional(z.enum(BEASISWA).optional()), keterangan: opsional(teks.optional()), contoh: sakelar,
      }),
      zh: terjemahan({ keterangan: teks }),
    }),
  }),
  event: defineCollection({
    loader: dariFolder('event'),
    schema: ({ image }) => z.object({
      id: z.object({
        judul: wajibTampil, isi: wajibTampil, tempat: opsional(teks.optional()), jenis: z.enum(JENIS_EVENT), program: opsional(z.enum(PROGRAM).optional()),
        slugPinyin: isianSlug,
        // Jam event ditulis di isi, dua bahasa (P14). Event sehari cukup tanggal mulai.
        mulai: tanggal, selesai: opsional(tanggal.optional()), online: opsional(urlHttps('Tautan online').optional()), tayang: opsional(tanggal.optional()),
        // Kosong = mengikuti program terkait (Model Konten), lib/wa.ts adminEvent.
        admin: opsional(z.enum(['kursusOffline', 'kursusOnline', 'kuliah1', 'kantor']).optional()),
        // Program study tour yang sama dengan event ini: detail event menautkan jadwal per harinya (Naskah Kabar Dan Event, Event awal).
        studyTour: opsional(reference('studyTour').optional()),
        poster: opsional(gambar(image).optional()), contoh: sakelar,
      }),
      zh: terjemahan({ judul: teks, isi: teks, tempat: teks }),
    }).refine(slugZhSah, PESAN_SLUG),
  }),
  artikel: defineCollection({
    loader: dariFolder('artikel'),
    schema: ({ image }) => z.object({
      id: z.object({
        judul: wajibTampil, ringkasan: wajibTampil, isi: wajibTampil, slugPinyin: isianSlug,
        // Tanggal terbit juga tanggal tayang: artikel tampil mulai tanggal ini (Model Konten, Batasan Panel Admin).
        terbit: tanggal, kategori: z.enum(KATEGORI), sampul: gambar(image),
        terkait: opsional(z.array(reference('artikel')).default([])), contoh: sakelar,
      }),
      zh: terjemahan({ judul: teks, ringkasan: teks, isi: teks }),
    }).refine(slugZhSah, PESAN_SLUG),
  }),
  // Album Galeri (Model Konten). Foto disimpan di repo sampai Cloudflare R2 tersedia (P19): unggahan panel ke src/content/album/media.
  album: defineCollection({
    loader: dariFolder('album'),
    schema: ({ image }) => z.object({
      id: z.object({
        judul: wajibTampil, slugPinyin: isianSlug, program: z.enum(PROGRAM), tanggal, tayang: opsional(tanggal.optional()),
        deskripsi: opsional(teks.optional()),
        // Sampul dipotong 4:3 di kartu album (Panduan Visual 9e2) dan tampil hangat, seperti sampul program study tour.
        sampul: gambar(image),
        // Warna per foto (Model Konten aturan 7). Keterangan per foto opsional, dua isian supaya selalu berpasangan dengan fotonya;
        // tampil di lightbox hanya kalau keduanya terisi (bilaLengkap).
        foto: opsional(z.array(z.object({
          gambar: gambar(image), warna: opsional(z.enum(['hangat', 'asli']).default('hangat')),
          // Teks alternatif foto dan keterangan lightbox di halaman Indonesia: tanpa aksara Han (Ruling Rencana 4). Han di keteranganZh.
          keterangan: opsional(teks.regex(POLA_TANPA_HAN, 'Keterangan foto: aksara Han ditulis di Keterangan 中文').optional()),
          keteranganZh: opsional(teks.optional()),
        })).default([])),
        video: opsional(z.array(video(image)).default([])),
        // Album dokumentasi satu event atau satu program study tour: detail event dan detail study tour menautkannya (P15).
        event: opsional(reference('event').optional()), studyTour: opsional(reference('studyTour').optional()),
        contoh: sakelar,
      }),
      zh: terjemahan({ judul: teks, deskripsi: teks }),
    }).refine(slugZhSah, PESAN_SLUG),
  }),
  mitra: defineCollection({
    loader: dariFolder('mitra'),
    schema: z.object({
      // Tampil di Beranda berbawaan ya, jadi wajib di form (centang dan tidak dicentang keduanya ditulis): kalau opsional, nilai kosong
      // akan terbaca sebagai bawaan ya walau staf mematikannya.
      id: z.object({ nama: teks, jenis: z.enum(['sekolah', 'perusahaan']), keterangan: opsional(teks.optional()), tampilDiBeranda: z.boolean(), contoh: sakelar }),
      zh: terjemahan({ keterangan: teks }),
    }),
  }),
  testimoni: defineCollection({
    loader: dariFolder('testimoni'),
    schema: ({ image }) => z.object({
      id: z.object({
        nama: teks, peran: z.enum(PERAN), program: z.enum(PROGRAM), kampus: opsional(reference('kampus').optional()),
        tahun: opsional(z.number().int().optional()), kutipan: opsional(teks.optional()),
        // Kutipan atau video, minimal salah satu: diperiksa gerbang tampil (lib/wajib.ts), bukan skema (bawaan Rencana 4).
        video: opsional(video(image).optional()),
        tampilDiBeranda: sakelar, contoh: sakelar,
      }),
      zh: terjemahan({ kutipan: teks }),
    }),
  }),
  // Tim (Model Konten): anggota tampil di kartu timnya, diurutkan isian Urutan lalu nama. Tanpa foto: inisial (aturan 10).
  tim: defineCollection({
    loader: dariFolder('tim'),
    schema: ({ image }) => z.object({
      id: z.object({
        nama: teks, tim: z.enum(TIM), jabatan: opsional(teks.optional()), foto: opsional(gambar(image).optional()),
        warna: opsional(z.enum(['hangat', 'asli']).default('hangat')), deskripsi: opsional(teks.optional()),
        urutan: opsional(z.number().int().default(0)), contoh: sakelar,
      }),
      zh: terjemahan({ jabatan: teks, deskripsi: teks }),
    }),
  }),
  studyTour: defineCollection({
    loader: dariFolder('study-tour'),
    schema: ({ image }) => z.object({
      id: z.object({
        judul: wajibTampil, ringkasan: opsional(teks.optional()), jenis: z.enum(JENIS_STUDY_TOUR),
        mulai: tanggal, selesai: tanggal,
        kota: opsional(z.array(reference('kota')).default([])),
        termasuk: opsional(z.array(teks).default([])),
        itinerary: opsional(z.array(z.object({ judul: teks, isi: opsional(teks.optional()) })).default([])),
        // Harga disimpan untuk admin, tampil hanya kalau sakelar dinyalakan (diputuskan 2026-10-11, bawaan mati).
        harga: opsional(z.number().int().optional()), tampilkanHarga: sakelar,
        sampul: gambar(image), contoh: sakelar,
      }),
      zh: terjemahan({ judul: teks, ringkasan: teks, termasuk: z.array(teks), itinerary: z.array(z.object({ judul: teks, isi: opsional(teks.optional()) })) }),
    }),
  }),
  // Pengaturan Situs (Model Konten, isian tunggal). Rencana 3 baru memakai sakelar biaya kampus, bawaan mati (PRD F3, cece 2026-10-11).
  pengaturan: defineCollection({
    loader: glob({ pattern: 'pengaturan.yaml', base: './src/content/halaman' }),
    schema: z.object({ id: z.object({ tampilkanBiayaKampus: sakelar }), zh: z.object({}).nullish() }),
  }),
};
