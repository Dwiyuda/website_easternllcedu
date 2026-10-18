// Mengolah foto PPT dan logo menjadi bahan website. Hanya foto di daftar FOTO yang diproses.
// sharp membuang EXIF (termasuk lokasi GPS) secara bawaan.
// Prasyarat: foto PPT sudah diekstrak ke bahan/ppt-media (unzip -o -j "ACUAN_AWAL/Profil LKP Eastern LLC.pptx" 'ppt/media/*' -d bahan/ppt-media).
import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const PPT = 'bahan/ppt-media';
const LAMPIRAN = 'docs/lampiran/Website Eastern LLC - ';
const DILARANG = new Set(['image2.png', 'image4.jpeg', 'image5.jpeg', 'image7.jpeg']); // logo beralamat, dokumen izin, Zoom
const FOTO = {
  'kelas-kantor': 'image6.jpeg', 'kelas-kantor-2': 'image20.jpeg', 'sekolah-1': 'image8.jpeg', 'sekolah-2': 'image9.jpeg',
  'perusahaan-1': 'image11.jpg', 'perusahaan-2': 'image12.jpg', 'perusahaan-3': 'image13.jpeg',
  'camp-1': 'image14.jpeg', 'camp-2': 'image15.jpeg', 'keberangkatan-1': 'image16.jpeg', 'keberangkatan-2': 'image17.jpg',
  gedung: 'image18.jpeg', 'rak-buku': 'image19.jpeg',
};

await mkdir('src/assets/foto', { recursive: true });
await mkdir('src/assets/merek', { recursive: true });
await mkdir('public/ikon', { recursive: true });

for (const [nama, sumber] of Object.entries(FOTO)) {
  if (DILARANG.has(sumber)) throw new Error(`Foto ${sumber} tidak boleh dipakai`);
  await sharp(`${PPT}/${sumber}`)
    .rotate()
    .resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(`src/assets/foto/${nama}.webp`);
}

for (const [nama, sumber] of [['logo-terang-ringkas', 'Logo Terang Ringkas'], ['logo-terang-lengkap', 'Logo Terang Lengkap'], ['stempel', 'Stempel Dongfang']]) {
  await sharp(`${LAMPIRAN}${sumber}.png`).png().toFile(`src/assets/merek/${nama}.png`);
}

const stempel = `${LAMPIRAN}Stempel Dongfang.png`;
await sharp(stempel).resize(32, 32).png().toFile('public/ikon/favicon-32.png');
// iOS mengisi sudut transparan dengan hitam, jadi ikon layar utama diratakan ke --marun-600 (#642621). Favicon tetap transparan.
await sharp(stempel).resize(180, 180).flatten({ background: '#642621' }).png().toFile('public/ikon/apple-touch-icon.png');
console.log(`${Object.keys(FOTO).length} foto, 3 logo, 2 ikon tab diolah`);
