import type { BEASISWA, Jenjang } from '../content.config';
import type { Bahasa } from '../lib/dua-bahasa';
import type { KunciRute, Program } from './rute';

type ButirMenu = { judul: string; kalimat: string };

interface Kamus {
  lewati: string; navUtama: string; beranda: string;
  menu: Record<'beranda' | 'tentang' | 'program' | 'kegiatan' | 'testimoni' | 'kontak', string>;
  tanyaJawab: string;
  programPengantar: string; semuaProgram: string;
  programButir: Partial<Record<KunciRute, ButirMenu>>;
  kegiatanButir: Partial<Record<KunciRute, ButirMenu>>;
  pilihBahasa: string; konsultasi: string; konsultasiLabel: string; bukaMenu: string; tutupMenu: string;
  wa: { judul: string; tutup: string; studyTourKerjaSama: string };
  kaki: { profil: string; menu: string; kontak: string; sosial: string; legalitasLengkap: string; berlakuSampai: string; hakCipta: string };
  legalitas: { nib: string; izin: string; masaBerlaku: string; badan: string; layanan: string };
  contoh: string; tabBaru: string; judulWaBeranda: string; akhiranTab: string; tersalin: string; titikDua: string;
  kabar: {
    event: string; diterbitkan: string; terkait: string; kembali: string;
    info: Record<'waktu' | 'tempat' | 'online' | 'program', string>;
    daftar: string; sudahSelesai: string; lihatFoto: string; lihatJadwal: string;
    seo: { judul: string; deskripsi: string }; kalimat: string; akanDatang: string; terbaru: string; semua: string; kosong: string;
    arsip: { seo: { judul: string; deskripsi: string }; judul: string; kalimat: string; grup: string; pita: string; pitaKalimat: string; tautan: string };
  };
  galeri: {
    seo: { judul: string; deskripsi: string }; kalimat: string; semua: string; program: Record<Program, string>;
    jumlahFoto: string; jumlahVideo: string; sisa: string; kosong: string;
    perProgram: { seo: string; judul: string; kalimat: string; tautan: string };
    halaman: string; sebelumnya: string; berikutnya: string; lihatProgram: string;
  };
  lightbox: Record<'tutup' | 'sebelumnya' | 'berikutnya' | 'nomor', string>;
  video: { putar: string; cadangan?: string; tonton?: string };
  galat404: { lencana: string; judul: string; kalimat: string; tombol: string; tautan: string; tab: string };
  peran: Record<'siswa' | 'orang-tua' | 'alumni' | 'peserta-camp', string>;
  akanDatang: string; sedangBerlangsung: string; selesai: string;
  jenisEvent: Record<'info-session' | 'pembukaan-kelas' | 'ujian-hsk' | 'kegiatan-budaya' | 'lainnya', string>;
  kategori: Record<'kuliah' | 'belajar-mandarin' | 'kegiatan' | 'pengumuman', string>;
  programHalaman: { seo: { judul: string; deskripsi: string }; judul: string; kalimat: string; penutup: { judul: string; kalimat: string } };
  diperbarui: string;
  jenisStudyTour: Record<'summer-camp' | 'winter-camp' | 'campus-tour' | 'culture-experience', string>;
  hargaKelas: { reguler: string; weekend: string };
  peta: { label: string; pekanbaru: string; titik: string; semuaKota: string; keterangan: string };
  kampus: {
    seo: { judul: string; deskripsi: string }; judul: string; kalimat: string;
    biaya: { judul: string; kalimat: string; kuliah: string; asrama: string; estimasi: string; lencana: string; rentang: string; kelompok: [string, string, string] };
    grup: string; alumniAda: string; kelas: { tujuanAlumni: string; mitra: string };
    saring: { semuaJenjang: string; inggris: string; jumlah: string; hapus: string; kosong: string };
    penutup: { judul: string; kalimat: string };
  };
  jenjang: Record<Jenjang, string>;
  kampusDetail: {
    lokasi: string; tentang: string; jenjang: string; unggulan: string; inggris: string; mandarin: string; mandarinKalimat: string;
    beasiswa: string; alumni: string; situs: string; penutup: { judul: string; kalimat: string };
  };
  beasiswa: Record<(typeof BEASISWA)[number], string>;
}

export const UI: Record<Bahasa, Kamus> = {
  id: {
    lewati: 'Lewati ke isi', navUtama: 'Navigasi utama', beranda: 'Beranda',
    menu: { beranda: 'Beranda', tentang: 'Tentang Kami', program: 'Program', kegiatan: 'Kegiatan', testimoni: 'Testimoni', kontak: 'Kontak' },
    tanyaJawab: 'Tanya Jawab',
    programPengantar: 'Empat program Eastern LLC, dari kursus Mandarin di Pekanbaru sampai kuliah di Tiongkok.',
    semuaProgram: 'Semua program',
    programButir: {
      kursus: { judul: 'Kursus Bahasa', kalimat: 'Mandarin offline dan online, dari dasar sampai HSK 6.' },
      kerjaSama: { judul: 'Kelas Kerja Sama', kalimat: 'Kelas Mandarin di sekolah dan perusahaan sejak 2007.' },
      studyTour: { judul: 'Study Tour', kalimat: 'Summer camp, winter camp, dan campus tour ke Tiongkok setiap tahun.' },
      kuliah: { judul: 'Kuliah ke Tiongkok', kalimat: 'Pendampingan dari pilihan jurusan sampai berangkat.' },
      kampus: { judul: 'Daftar Kampus', kalimat: 'Kampus tujuan per kota, lengkap dengan peta.' },
    },
    kegiatanButir: {
      kabar: { judul: 'Kabar & Event', kalimat: 'Event mendatang, kabar, dan artikel.' },
      galeri: { judul: 'Galeri', kalimat: 'Foto dan video per program.' },
    },
    pilihBahasa: 'Pilih bahasa', konsultasi: 'Konsultasi', konsultasiLabel: 'Chat WhatsApp dengan admin Eastern LLC', bukaMenu: 'Menu', tutupMenu: 'Tutup menu',
    wa: { judul: 'Pilih admin', tutup: 'Tutup', studyTourKerjaSama: 'Study Tour & Kerja Sama' },
    kaki: {
      profil: 'Kursus Mandarin dan pendampingan kuliah ke Tiongkok di Pekanbaru sejak 2006.',
      menu: 'Menu', kontak: 'Kontak', sosial: 'Media sosial', legalitasLengkap: 'Legalitas lengkap',
      berlakuSampai: 'Berlaku sampai', hakCipta: 'Eastern Language Learning Center',
    },
    legalitas: { nib: 'NIB', izin: 'Izin Operasional LKP', masaBerlaku: 'Masa berlaku', badan: 'Badan usaha', layanan: 'Layanan' },
    contoh: 'Contoh', tabBaru: '(terbuka di tab baru)', judulWaBeranda: 'Eastern LLC',
    // Akhiran judul tab halaman detail (Naskah 404 Dan Teks Umum, Judul tab "Halaman tidak ditemukan · Eastern LLC").
    akhiranTab: ' · Eastern LLC',
    // Naskah 404 Dan Teks Umum, Teks kecil lain (Nomor disalin). titikDua: pemisah label untuk pembaca layar, tanda baca lebar penuh di 中文.
    tersalin: 'Tersalin', titikDua: ': ',
    // Naskah Kabar Dan Event: Pola detail artikel (remah, baris tanggal, terkait, kembali), Pola detail event (remah "Event", baris info,
    // tombol Daftar, sesudah lewat), Event awal (tautan jadwal per hari). Bagian 2: "Online" juga awal baris tempat event online.
    kabar: {
      event: 'Event', diterbitkan: 'Diterbitkan {tanggal}', terkait: 'Artikel terkait', kembali: 'Kembali ke Kabar & Event',
      info: { waktu: 'Waktu', tempat: 'Tempat', online: 'Online', program: 'Program' },
      daftar: 'Daftar', sudahSelesai: 'Event ini sudah selesai.', lihatFoto: 'Lihat foto kegiatan', lihatJadwal: 'Lihat jadwal per hari',
      // Naskah Kabar Dan Event: SEO, bagian 1 (kalimat), 2 (judul bagian), 3 (judul, saringan, kosong), 4 (pita), Halaman Event Sebelumnya.
      seo: {
        judul: 'Kabar dan Event Eastern LLC Pekanbaru · Info Session, Kelas Baru, Kegiatan',
        deskripsi: 'Kabar terbaru Eastern LLC: info session kuliah ke China, pembukaan kelas Mandarin, ujian HSK, kegiatan budaya, dan artikel tentang belajar Mandarin dan kuliah di China.',
      },
      kalimat: 'Event yang akan datang, kabar kegiatan, dan artikel dari Eastern LLC.',
      akanDatang: 'Akan datang', terbaru: 'Kabar terbaru', semua: 'Semua', kosong: 'Belum ada kabar di kategori ini.',
      arsip: {
        seo: { judul: 'Event Sebelumnya · Eastern LLC Pekanbaru', deskripsi: 'Arsip event Eastern LLC per tahun: info session, pembukaan kelas, ujian HSK, dan kegiatan budaya.' },
        judul: 'Event Sebelumnya', kalimat: 'Semua event Eastern LLC yang sudah berlangsung, dikelompokkan per tahun.', grup: '{tahun} · {n} event',
        pita: 'Event sebelumnya', pitaKalimat: 'Arsip event Eastern LLC dari tahun ke tahun.', tautan: 'Lihat arsip',
      },
    },
    // Naskah Galeri: SEO, bagian 1 (kalimat), 2 (tab program), 3 (kartu album, kosong), Galeri per program, Pola halaman album, Lightbox.
    galeri: {
      seo: {
        judul: 'Galeri Foto dan Video Eastern LLC · Kelas Mandarin, Study Tour, Kuliah ke China',
        deskripsi: 'Foto dan video kegiatan Eastern LLC Pekanbaru: kelas Mandarin, kelas di sekolah dan perusahaan, study tour ke Tiongkok, dan keberangkatan mahasiswa ke China.',
      },
      kalimat: 'Foto dan video kegiatan Eastern LLC, dikelompokkan per program dan per album.',
      semua: 'Semua', program: { kursus: 'Kursus Bahasa', 'kerja-sama': 'Kerja Sama', 'study-tour': 'Study Tour', kuliah: 'Kuliah ke Tiongkok' },
      jumlahFoto: '{n} foto', jumlahVideo: '{n} video', sisa: '+{n}', kosong: 'Belum ada album untuk program ini.',
      perProgram: { seo: 'Galeri {program} · Eastern LLC', judul: 'Galeri {program}', kalimat: 'Album kegiatan {program} Eastern LLC, terbaru di atas.', tautan: 'Tentang program ini' },
      halaman: 'Halaman {n} dari {total}', sebelumnya: 'Sebelumnya', berikutnya: 'Berikutnya', lihatProgram: 'Lihat program {program}',
    },
    lightbox: { tutup: 'Tutup', sebelumnya: 'Foto sebelumnya', berikutnya: 'Foto berikutnya', nomor: 'Foto {n} dari {total}' },
    // Naskah Galeri, Lightbox (Putar video). Pesan cadangan hanya untuk halaman 中文 (Naskah 404 Dan Teks Umum).
    video: { putar: 'Putar video' },
    galat404: {
      lencana: '404 · Halaman tidak ditemukan', judul: 'Halaman ini tidak ada',
      kalimat: 'Alamatnya mungkin salah ketik, atau halaman ini sudah pindah sejak website Eastern LLC diperbarui.',
      tombol: 'Ke Beranda', tautan: 'Hubungi Eastern LLC', tab: 'Halaman tidak ditemukan · Eastern LLC',
    },
    peran: { siswa: 'Siswa', 'orang-tua': 'Orang tua', alumni: 'Alumni', 'peserta-camp': 'Peserta camp' },
    akanDatang: 'Akan datang', sedangBerlangsung: 'Sedang berlangsung', selesai: 'Selesai',
    jenisEvent: { 'info-session': 'Info Session', 'pembukaan-kelas': 'Pembukaan Kelas', 'ujian-hsk': 'Ujian HSK', 'kegiatan-budaya': 'Kegiatan Budaya', lainnya: 'Lainnya' },
    kategori: { kuliah: 'Kuliah di Tiongkok', 'belajar-mandarin': 'Belajar Mandarin', kegiatan: 'Kegiatan', pengumuman: 'Pengumuman' },
    // Naskah Program (SEO, bagian 1, bagian 3).
    programHalaman: {
      seo: {
        judul: 'Program Eastern LLC · Kursus Mandarin, Kelas Kerja Sama, Study Tour, Kuliah ke China',
        deskripsi: 'Empat program Eastern LLC di Pekanbaru: kursus Mandarin offline dan online, kelas di sekolah dan perusahaan, study tour ke Tiongkok, dan pendampingan kuliah ke China.',
      },
      judul: 'Program',
      kalimat: 'Empat program Eastern LLC, dari kursus Mandarin di Pekanbaru sampai kuliah di Tiongkok (China).',
      penutup: { judul: 'Belum yakin pilih yang mana?', kalimat: 'Ceritakan tujuan belajar ke admin Eastern LLC. Admin membantu memilih program yang cocok.' },
    },
    diperbarui: 'Diperbarui {tanggal}', // Naskah 404 Dan Teks Umum, Teks kecil lain
    // Naskah Study Tour bagian 2 dan 3b.
    jenisStudyTour: { 'summer-camp': 'Summer Camp', 'winter-camp': 'Winter Camp', 'campus-tour': 'Campus Tour', 'culture-experience': 'Culture Experience Tour' },
    hargaKelas: { reguler: 'Kelas reguler', weekend: 'Kelas weekend' }, // Naskah Kursus Bahasa bagian 4
    // Naskah Daftar Kampus bagian 3 (Peta).
    peta: {
      label: 'Pilih kota di peta', pekanbaru: 'Pekanbaru', titik: '{kota} · {jumlah} kampus · ± {jarak} km dari Pekanbaru',
      semuaKota: 'Semua kota', keterangan: 'Peta digambar sederhana: garis pesisir, Sungai Yangtze, Sungai Kuning, dan kota kampus.',
    },
    // Naskah Daftar Kampus: SEO, bagian 1 (kalimat; [jumlah otomatis] menjadi {kampus} dan {kota}), bagian 2 (pita), bagian 4
    // (saringan), bagian 5 (judul kelompok, lencana alumni), bagian 6 (penutup), Pola halaman detail (biaya kalau sakelar menyala).
    // biaya.lencana adalah awal baris kecil estimasi; biaya.kelompok usulan rentang P9, diperiksa sebelum sakelar biaya dinyalakan.
    kampus: {
      seo: {
        judul: 'Daftar Kampus Kuliah di China per Kota · Eastern LLC Pekanbaru',
        deskripsi: "Kampus untuk kuliah ke China bersama Eastern LLC, per kota: Hangzhou, Shanghai, Nanjing, Xiamen, Nanchang, Xi'an, Guangzhou, Beijing, dan lainnya. Jenjang, jurusan berbahasa Inggris, beasiswa, dan alumni Eastern LLC.",
      },
      judul: 'Daftar Kampus',
      kalimat: '{kampus} kampus di {kota} kota di Tiongkok (China), lengkap dengan jenjang, jurusan berbahasa Inggris, beasiswa, dan alumni Eastern LLC di tiap kampus.',
      biaya: {
        judul: 'Biaya dan pendaftaran',
        kalimat: 'Biaya kuliah, asrama, dan beasiswa berbeda per jurusan dan diperbarui setiap tahun ajaran. Admin kuliah Eastern LLC menjelaskan rincian terbaru dan membantu pendaftaran.',
        kuliah: 'Biaya kuliah', asrama: 'Asrama', estimasi: 'Estimasi {tahun} dalam RMB per tahun. Bisa berubah, konfirmasi ke admin kuliah.',
        lencana: 'Estimasi {tahun}', rentang: 'Rentang biaya per tahun', kelompok: ['Di bawah RMB 15.000', 'RMB 15.000–25.000', 'Di atas RMB 25.000'],
      },
      grup: '{kota} · {provinsi} · {n} kampus',
      alumniAda: 'Ada alumni Eastern LLC',
      kelas: { tujuanAlumni: 'Kampus tujuan alumni', mitra: 'Mitra' },
      saring: { semuaJenjang: 'Semua jenjang', inggris: 'Ada jurusan berbahasa Inggris', jumlah: '{n} kampus', hapus: 'Hapus filter', kosong: 'Belum ada kampus yang cocok dengan pilihan ini.' },
      penutup: { judul: 'Kampus lain atau jurusan tertentu?', kalimat: 'Tanyakan kampus dan jurusan di luar daftar ini ke admin kuliah Eastern LLC.' },
    },
    // Naskah Testimoni bagian 4 (label jenjang, sama dengan saringan Daftar Kampus bagian 4).
    jenjang: { SMA: 'SMA', Bahasa: 'Bahasa', Diploma: 'Diploma', S1: 'S1', S2: 'S2', S3: 'S3' },
    // Naskah Daftar Kampus, Pola halaman detail kampus (lokasi "[Kota], [Provinsi]", tabel kolom informasi, penutup marun).
    kampusDetail: {
      lokasi: '{kota}, {provinsi}', tentang: 'Tentang kampus', jenjang: 'Jenjang tersedia', unggulan: 'Jurusan unggulan',
      inggris: 'Jurusan berbahasa Inggris', mandarin: 'Jurusan berbahasa Mandarin',
      mandarinKalimat: 'Daftar lengkap jurusan berbahasa Mandarin ditanyakan ke admin kuliah Eastern LLC.',
      beasiswa: 'Beasiswa', alumni: 'Alumni Eastern LLC di kampus ini', situs: 'Situs resmi kampus',
      penutup: { judul: 'Tanyakan {nama}', kalimat: 'Admin kuliah Eastern LLC menjelaskan jurusan, beasiswa, dan pendaftaran di kampus ini.' },
    },
    // Naskah Testimoni bagian 4 (Label beasiswa); {provinsi} dari koleksi Kota.
    beasiswa: {
      csc: 'Beasiswa Pemerintah Tiongkok', provinsi: 'Beasiswa Pemerintah Provinsi {provinsi}', president: 'President Scholarship',
      'guru-mandarin': 'Beasiswa Guru Bahasa Mandarin', kampus: 'Beasiswa kampus', mandiri: 'Mandiri',
    },
  },
  zh: {
    lewati: '跳到正文', navUtama: '主导航', beranda: '首页',
    menu: { beranda: '首页', tentang: '关于我们', program: '项目', kegiatan: '动态', testimoni: '学员评价', kontak: '联系我们' },
    tanyaJawab: '常见问题',
    programPengantar: '东方四大项目，从北干巴鲁的中文课程到中国留学。',
    semuaProgram: '全部项目',
    programButir: {
      kursus: { judul: '语言课程', kalimat: '线下线上中文课程，从零基础到HSK六级。' },
      kerjaSama: { judul: '合作课程', kalimat: '自2007年起在学校和企业开设中文课。' },
      studyTour: { judul: '游学', kalimat: '每年赴中国参加冬夏令营和院校参访。' },
      kuliah: { judul: '留学中国', kalimat: '从选专业到出发，全程协助。' },
      kampus: { judul: '院校名单', kalimat: '按城市查看院校，附地图。' },
    },
    kegiatanButir: {
      kabar: { judul: '新闻动态', kalimat: '近期活动、最新动态和文章。' },
      galeri: { judul: '相册', kalimat: '各项目的照片和视频。' },
    },
    pilihBahasa: '选择语言', konsultasi: '咨询', konsultasiLabel: '通过WhatsApp联系东方顾问', bukaMenu: '菜单', tutupMenu: '关闭菜单',
    wa: { judul: '选择咨询顾问', tutup: '关闭', studyTourKerjaSama: '游学与合作' },
    kaki: {
      profil: '2006年起在北干巴鲁开设中文课程，并提供中国留学服务。',
      menu: '导航', kontak: '联系方式', sosial: '社交媒体', legalitasLengkap: '查看完整资质',
      berlakuSampai: '有效期至', hakCipta: '东方语言学院',
    },
    legalitas: { nib: '营业登记号（NIB）', izin: '培训机构运营许可', masaBerlaku: '有效期', badan: '机构性质', layanan: '办学项目' },
    contoh: '示例', tabBaru: '（在新标签页打开）', judulWaBeranda: '东方语言学院',
    akhiranTab: ' · 东方语言学院',
    tersalin: '已复制', titikDua: '：',
    kabar: {
      event: '活动', diterbitkan: '发布于{tanggal}', terkait: '相关文章', kembali: '返回新闻动态',
      info: { waktu: '时间', tempat: '地点', online: '线上', program: '项目' },
      daftar: '报名', sudahSelesai: '本活动已结束。', lihatFoto: '查看活动相册', lihatJadwal: '查看每日行程',
      seo: {
        judul: '新闻动态 · 东方语言学院',
        deskripsi: '东方语言学院最新动态：留学说明会、中文课程开班、HSK考试、文化活动，以及关于中文学习和中国留学的文章。',
      },
      kalimat: '东方的近期活动、最新动态和文章。',
      akanDatang: '近期活动', terbaru: '最新动态', semua: '全部', kosong: '该分类暂无内容。',
      arsip: {
        seo: { judul: '往期活动 · 东方语言学院', deskripsi: '东方历年活动回顾，包括留学说明会、开班、HSK考试和文化活动。' },
        judul: '往期活动', kalimat: '东方已举办的全部活动，按年份排列。', grup: '{tahun}年 · {n}场活动',
        pita: '往期活动', pitaKalimat: '东方历年活动回顾。', tautan: '查看往期活动',
      },
    },
    galeri: {
      seo: { judul: '相册 · 东方语言学院', deskripsi: '东方语言学院活动照片和视频：中文课堂、学校与企业合作课程、中国游学和留学生出发。' },
      kalimat: '东方各项目的活动照片和视频，按项目和相册分类。',
      semua: '全部', program: { kursus: '语言课程', 'kerja-sama': '合作课程', 'study-tour': '游学', kuliah: '留学中国' },
      jumlahFoto: '{n}张照片', jumlahVideo: '{n}段视频', sisa: '+{n}', kosong: '该项目暂无相册。',
      perProgram: { seo: '{program}相册 · 东方语言学院', judul: '{program}相册', kalimat: '东方{program}活动相册，按时间由近及远排列。', tautan: '了解该项目' },
      halaman: '第{n}页，共{total}页', sebelumnya: '上一页', berikutnya: '下一页', lihatProgram: '查看{program}',
    },
    lightbox: { tutup: '关闭', sebelumnya: '上一张', berikutnya: '下一张', nomor: '第{n}张，共{total}张' },
    // Naskah 404 Dan Teks Umum, Pesan cadangan video (PRD F12): sampul, kalimat, tautan.
    video: { putar: '播放视频', cadangan: '该视频托管于YouTube，如无法播放，请通过WhatsApp联系东方获取。', tonton: '在YouTube观看' },
    galat404: {
      lencana: '404 · 页面未找到', judul: '找不到该页面',
      kalimat: '网址可能有误，或该页面已随东方网站改版而移动。',
      tombol: '返回首页', tautan: '联系东方', tab: '页面未找到 · 东方语言学院',
    },
    peran: { siswa: '学员', 'orang-tua': '家长', alumni: '校友', 'peserta-camp': '营员' },
    akanDatang: '即将举行', sedangBerlangsung: '进行中', selesai: '已结束',
    jenisEvent: { 'info-session': '留学说明会', 'pembukaan-kelas': '开班', 'ujian-hsk': 'HSK考试', 'kegiatan-budaya': '文化活动', lainnya: '其他' },
    kategori: { kuliah: '留学中国', 'belajar-mandarin': '中文学习', kegiatan: '活动回顾', pengumuman: '通知公告' },
    programHalaman: {
      seo: {
        judul: '东方语言学院项目 · 中文课程、合作课程、游学、中国留学',
        deskripsi: '东方语言学院的四大项目：线下线上中文课程、学校与企业合作课程、中国游学，以及中国留学申请服务。',
      },
      judul: '项目',
      kalimat: '东方的四大项目：从北干巴鲁的中文课程，到赴中国留学。',
      penutup: { judul: '不确定选择哪个项目？', kalimat: '请告诉东方顾问学习目标，顾问会协助选择合适的项目。' },
    },
    diperbarui: '更新于{tanggal}',
    // 夏令营 dari judul "2026广西夏令营", 冬令营 dari bagian 3b, 院校参访 dan 文化体验游 dari bagian 2.
    jenisStudyTour: { 'summer-camp': '夏令营', 'winter-camp': '冬令营', 'campus-tour': '院校参访', 'culture-experience': '文化体验游' },
    hargaKelas: { reguler: '平日班', weekend: '周末班' },
    peta: {
      label: '在地图上选择城市', pekanbaru: '北干巴鲁', titik: '{kota} · {jumlah}所院校 · 距北干巴鲁约{jarak}公里',
      semuaKota: '全部城市', keterangan: '示意图：仅绘制海岸线、长江、黄河和院校所在城市。',
    },
    kampus: {
      seo: {
        judul: '中国院校名单 · 东方语言学院',
        deskripsi: '东方语言学院中国留学院校名单，按城市分类，包括杭州、上海、南京、厦门、南昌、西安、广州和北京等，介绍招生层次、英文授课专业、奖学金及在读东方校友。',
      },
      judul: '院校一览',
      kalimat: '中国{kota}座城市的{kampus}所院校，介绍各校招生层次、英文授课专业、奖学金和在读东方校友。',
      biaya: {
        judul: '费用与申请',
        kalimat: '学费、住宿费和奖学金因专业而异，每学年更新。东方留学顾问将介绍最新详情，并协助办理申请。',
        kuliah: '学费', asrama: '住宿费', estimasi: '{tahun}年参考费用（人民币/年），如有变动以学校公布为准，请向留学顾问确认。',
        lencana: '{tahun}年参考费用', rentang: '每年费用范围', kelompok: ['¥15,000以下', '¥15,000–25,000', '¥25,000以上'],
      },
      grup: '{kota} · {provinsi} · {n}所',
      alumniAda: '有东方校友',
      kelas: { tujuanAlumni: '校友升学院校', mitra: '合作院校' },
      saring: { semuaJenjang: '全部层次', inggris: '有英文授课专业', jumlah: '{n}所院校', hapus: '清除筛选', kosong: '暂无符合条件的院校。' },
      penutup: { judul: '想了解其他院校或专业？', kalimat: '如需了解名单以外的院校和专业，请咨询东方留学顾问。' },
    },
    jenjang: { SMA: '高中', Bahasa: '语言进修', Diploma: '专科', S1: '本科', S2: '硕士', S3: '博士' },
    // Lokasi mengikuti urutan judul kelompok naskah bagian 5, "[城市] · [省份]" (usulan, daftar periksa laoshi K12).
    kampusDetail: {
      lokasi: '{kota} · {provinsi}', tentang: '院校简介', jenjang: '招生层次', unggulan: '优势专业', inggris: '英文授课专业',
      mandarin: '中文授课专业', mandarinKalimat: '中文授课专业完整名单请咨询东方留学顾问。',
      beasiswa: '奖学金', alumni: '在读东方校友', situs: '学校官网',
      penutup: { judul: '咨询{nama}', kalimat: '东方留学顾问介绍该校的专业、奖学金和申请事宜。' },
    },
    beasiswa: {
      csc: '中国政府奖学金', provinsi: '{provinsi}政府奖学金', president: '校长奖学金',
      'guru-mandarin': '国际中文教师奖学金', kampus: '学校奖学金', mandiri: '自费',
    },
  },
};

/** Tanda "(terbuka di tab baru)" untuk aria-label dan teks pembaca layar: spasi pemisah di depan hanya di Indonesia; di 中文 tanpa
 *  spasi karena tanda kurung lebar penuh tidak didahului spasi (Naskah Konten: tanda baca lebar penuh). Satu sumber untuk semua tautan. */
export const tandaTabBaru = (bahasa: Bahasa) => (bahasa === 'zh' ? UI.zh.tabBaru : ` ${UI.id.tabBaru}`);
