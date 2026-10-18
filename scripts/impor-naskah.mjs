// Membuat berkas kampus, artikel, dan alumni dari catatan vault yang sudah diterima, supaya isi website sama persis
// dengan catatan. Data kota, jenjang, dan sampul ada di tabel di bawah.
// Skrip ini untuk isian awal. Setelah panel admin dipakai, ubah isi di panel: menjalankan ulang skrip ini menimpa
// suntingan dari panel. Baris yang dihapus dari Data Alumni juga harus dihapus berkasnya secara manual (berkas lama
// tidak dihapus skrip supaya isi buatan panel tidak hilang).
// Semua keluaran dibangun dan diperiksa dulu, baru ditulis, jadi galat tidak meninggalkan hasil setengah jadi.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { dump } from 'js-yaml';

const CATATAN = 'docs/catatan/Website Eastern LLC - Naskah ';
const keluaran = new Map(); // jalur berkas -> data, ditulis di akhir

// [slug, nama di naskah, kota, jenjang] — jenjang dari Naskah Deskripsi Kampus, [] berarti belum ada data
const KAMPUS = [
  ['zhejiang-university', 'Zhejiang University', 'hangzhou', ['Bahasa', 'S1']],
  ['zhejiang-university-of-science-and-technology', 'Zhejiang University of Science and Technology', 'hangzhou', ['S1', 'S2']],
  ['zhejiang-sci-tech-university', 'Zhejiang Sci-Tech University', 'hangzhou', ['Bahasa', 'S1', 'S2', 'S3']],
  ['zhejiang-university-of-technology', 'Zhejiang University of Technology', 'hangzhou', []],
  ['zhejiang-gongshang-university', 'Zhejiang Gongshang University', 'hangzhou', []],
  ['xiamen-university', 'Xiamen University', 'xiamen', ['S1', 'S2']],
  ['huaqiao-university', 'Huaqiao University', 'xiamen', ['Bahasa', 'S1']],
  ['jimei-high-school', 'Jimei High School', 'xiamen', ['SMA']],
  ['fuzhou-university', 'Fuzhou University', 'fuzhou', ['Bahasa', 'S1', 'S2', 'S3']],
  ['fujian-university-of-technology', 'Fujian University of Technology', 'fuzhou', []],
  ['nanjing-university-of-science-and-technology', 'Nanjing University of Science and Technology', 'nanjing', ['S1']],
  ['nanjing-university-of-finance-and-economics', 'Nanjing University of Finance and Economics', 'nanjing', ['Bahasa', 'S1', 'S2']],
  ['nanjing-normal-university', 'Nanjing Normal University', 'nanjing', ['S1', 'S2']],
  ['tongji-university', 'Tongji University', 'shanghai', ['Bahasa', 'S1']],
  ['shanghai-jiao-tong-university', 'Shanghai Jiao Tong University', 'shanghai', ['S1']],
  ['east-china-normal-university', 'East China Normal University', 'shanghai', ['S1']],
  ['east-china-university-of-science-and-technology', 'East China University of Science and Technology', 'shanghai', []],
  ['shanghai-donghai-vocational-and-technical-college', 'Shanghai Donghai Vocational and Technical College', 'shanghai', ['Diploma']],
  ['east-china-jiaotong-university', 'East China Jiaotong University', 'nanchang', ['Bahasa', 'S1', 'S2', 'S3']],
  ['jiangxi-university-of-finance-and-economics', 'Jiangxi University of Finance and Economics', 'nanchang', ['S1', 'S2', 'S3']],
  ['jiangxi-normal-university', 'Jiangxi Normal University', 'nanchang', ['S1', 'S2', 'S3']],
  ['northwestern-polytechnical-university', 'Northwestern Polytechnical University', 'xian', ['S1', 'S2', 'S3']],
  ['xian-jiaotong-university', "Xi'an Jiaotong University", 'xian', []],
  ['jinan-university', 'Jinan University', 'guangzhou', ['S1']],
  ['south-china-normal-university', 'South China Normal University', 'guangzhou', ['S1']],
  ['peking-university', 'Peking University', 'beijing', []],
  ['harbin-institute-of-technology', 'Harbin Institute of Technology', 'harbin', []],
];

// [nomor bagian di naskah, slug, kategori, sampul, terbit, contoh]
const ARTIKEL = [
  [1, 'beasiswa-kuliah-di-tiongkok', 'kuliah', 'keberangkatan-1', '2026-10-11', false],
  [2, 'kuliah-berbahasa-mandarin-atau-inggris', 'kuliah', 'kelas-kantor', '2026-10-11', false],
  [3, 'dari-nol-sampai-hsk-6', 'belajar-mandarin', 'kelas-kantor-2', '2026-10-11', false],
  [4, 'website-baru-eastern-llc', 'pengumuman', 'gedung', '2026-10-11', true], // tanggal tayang dan domain belum ada
];

const kampusNaskah = new Map(readFileSync(`${CATATAN}Deskripsi Kampus.md`, 'utf8').split(/^### /m).slice(1).map((b) => {
  const [nama, namaZh] = b.split('\n')[0].split(' · ').map((s) => s.trim());
  const deskripsi = b.match(/^- \*\*ID:\*\* (.+)$/m)?.[1].trim();
  const deskripsiZh = b.match(/^- \*\*中文:\*\* (.+)$/m)?.[1].trim();
  return [nama, { namaZh, deskripsi, deskripsiZh }];
}));
if (kampusNaskah.size !== KAMPUS.length) throw new Error(`Naskah memuat ${kampusNaskah.size} kampus, daftar ${KAMPUS.length}`);

for (const [slug, nama, kota, jenjang] of KAMPUS) {
  const d = kampusNaskah.get(nama);
  if (!d?.deskripsi || !d.deskripsiZh) throw new Error(`Deskripsi tidak lengkap di naskah: ${nama}`);
  keluaran.set(`src/content/kampus/${slug}.yaml`, {
    id: { nama, deskripsi: d.deskripsi, kota, jenjang, contoh: false },
    zh: { nama: d.namaZh, deskripsi: d.deskripsiZh },
  });
}

const artikelNaskah = readFileSync(`${CATATAN}Artikel Awal.md`, 'utf8').split(/^## (?=\d+\. )/m).slice(1);
const bersihkan = (s) => s.replace(/ ⚠️[^\]\n]*/g, '').trim();
const isian = (b, label) => b.match(new RegExp(`^- \\*\\*${label}:\\*\\* (.+)$`, 'm'))?.[1].trim();

for (const [nomor, slug, kategori, sampul, terbit, contoh] of ARTIKEL) {
  const b = artikelNaskah.find((x) => x.startsWith(`${nomor}. `));
  if (!b) throw new Error(`Artikel ${nomor} tidak ada di naskah`);
  const isi = b.split('**Isi ID**')[1].split('**Isi 中文**');
  keluaran.set(`src/content/artikel/${slug}.yaml`, {
    id: {
      judul: b.split('\n')[0].replace(/^\d+\. /, '').trim(),
      ringkasan: isian(b, 'Ringkasan'), isi: bersihkan(isi[0]), terbit, kategori,
      sampul: `../../assets/foto/${sampul}.webp`, terkait: [], contoh,
    },
    zh: { judul: isian(b, 'Judul 中文'), ringkasan: isian(b, 'Ringkasan 中文'), isi: bersihkan(isi[1]) },
  });
}
// Alumni dari tabel Data Alumni. Website hanya memuat inisial (naskah Testimoni), kolom Catatan tidak ikut.
// Tahun dan jenjang per orang tidak ada di sumber, jadi tidak ditulis.
const BEASISWA_SAH = ['csc', 'provinsi', 'president', 'guru-mandarin', 'kampus', 'mandiri'];
const slugKampus = new Set(KAMPUS.map(([slug]) => slug));
const barisAlumni = readFileSync('docs/catatan/Website Eastern LLC - Data Alumni.md', 'utf8')
  .split('\n').filter((b) => /^\| \d+ \|/.test(b));
for (const b of barisAlumni) {
  const [no, nama, kampus, beasiswa] = b.split('|').slice(1, 5).map((s) => s.trim());
  if (!slugKampus.has(kampus)) throw new Error(`Alumni ${no}: kampus ${kampus} tidak ada`);
  if (beasiswa && !BEASISWA_SAH.includes(beasiswa)) throw new Error(`Alumni ${no}: beasiswa ${beasiswa} tidak dikenal`);
  const inisial = nama.split(/\s+/).map((k) => `${k[0].toUpperCase()}.`).join(' ');
  const berkas = `src/content/alumni/angkatan-2024-2025-${no.padStart(2, '0')}.yaml`;
  if (keluaran.has(berkas)) throw new Error(`Alumni nomor ${no} muncul dua kali`);
  keluaran.set(berkas, {
    id: { nama: inisial, kampus, ...(beasiswa && { beasiswa }), contoh: false },
  });
}
if (barisAlumni.length === 0) throw new Error('Tabel Data Alumni kosong atau formatnya berubah');

// Semua keluaran diperiksa dulu, baru ditulis.
const teks = new Map([...keluaran].map(([berkas, isi]) => [berkas, dump(isi, { lineWidth: -1 })]));
for (const [berkas, isi] of teks) if (isi.includes('⚠')) throw new Error(`Tanda ⚠ ikut terbawa ke ${berkas}`);
for (const [berkas, isi] of teks) {
  mkdirSync(dirname(berkas), { recursive: true });
  writeFileSync(berkas, isi);
}
console.log(`${KAMPUS.length} kampus, ${ARTIKEL.length} artikel, dan ${barisAlumni.length} alumni ditulis dari catatan`);
