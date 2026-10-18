# website_easternllcedu

Versi **publik (showcase)** dari website Eastern LLC — sebuah lembaga kursus
bahasa Mandarin: situs statis dua bahasa (Indonesia & 中文) dengan panel admin
berbasis Git (Sveltia CMS).

Repo ini dibuat sebagai contoh karya. **Semua data asli sudah diganti data
contoh**: nomor kontak, email, alamat, koordinat, legalitas, akun media sosial,
data alumni, harga, mitra, dan foto bukan nilai sebenarnya. Dokumen internal,
materi klien, dan riwayat Git proyek asli tidak disertakan.

## Teknologi

- **Astro** (output statis, tanpa bundel JavaScript kecuali yang diperlukan)
- **i18n** dua bahasa (Indonesia / 中文), satu berkas per konten
- **Sveltia CMS** (Git-based) untuk panel admin editorial
- **Cloudflare Pages** sebagai target build (opsional)
- Komponen `.astro`, token desain di CSS, uji dengan Vitest (uji tidak disertakan di versi publik)

## Struktur

```
src/
├── components/   # komponen UI (.astro)
├── layouts/      # kerangka halaman
├── pages/        # rute halaman (ID + 中文)
├── content/      # koleksi konten (DATA CONTOH)
├── data/         # kontak dsb. (DATA CONTOH)
├── lib/          # util (link WhatsApp, tanggal, dua bahasa)
├── i18n/         # teks antarmuka & rute
├── styles/       # token & gaya
└── assets/       # ikon, logo, foto (foto diganti placeholder)
public/           # admin CMS, ikon, lisensi
scripts/          # skrip media & build
```

## Menjalankan

```bash
npm install
npm run dev
```

> Catatan: karena data sudah diganti contoh, tampilan dan isi tidak mewakili
> layanan, harga, atau data nyata Eastern LLC.
