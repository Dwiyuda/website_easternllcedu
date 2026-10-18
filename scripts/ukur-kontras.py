# Mengukur kontras teks kartu-100 di atas bingkai video pembuka dengan --tirai-pembuka (20% di atas → 75% di bawah).
# Kotak teks diperkirakan dari tata letak pembuka: kiri 60% lebar, judul 55–75% tinggi, kalimat 75–92% tinggi.
# Hasil persentil 5 (bagian paling terang). Syarat MASTER.md: judul ≥ 3:1, kalimat ≥ 4,5:1.
# Jalankan dari akar repo: python scripts/ukur-kontras.py
import sys
from pathlib import Path

from PIL import Image, ImageOps

TEKS, TIRAI = (255, 249, 242), (58, 42, 35)
BINGKAI = ['image16.jpeg', 'image6.jpeg', 'image14.jpeg', 'image8.jpeg']


def kanal(c):
    c /= 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def luminans(rgb):
    r, g, b = (kanal(v) for v in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


L_TEKS = luminans(TEKS)


def kontras(gambar, y0, y1):
    lebar, tinggi = gambar.size
    hasil = []
    for y in range(int(tinggi * y0), int(tinggi * y1), 2):
        a = 0.2 + 0.55 * y / tinggi
        for x in range(0, int(lebar * 0.6), 2):
            p = gambar.getpixel((x, y))
            campur = tuple((1 - a) * p[i] + a * TIRAI[i] for i in range(3))
            hasil.append((L_TEKS + 0.05) / (luminans(campur) + 0.05))
    hasil.sort()
    return hasil[len(hasil) // 20]


gagal = False
for nama in BINGKAI:
    gambar = ImageOps.fit(Image.open(Path('bahan/ppt-media') / nama).convert('RGB'), (800, 450))
    judul, kalimat = kontras(gambar, 0.55, 0.75), kontras(gambar, 0.75, 0.92)
    lolos = judul >= 3 and kalimat >= 4.5
    gagal |= not lolos
    print(f'{nama}: judul {judul:.1f}:1, kalimat {kalimat:.1f}:1 {"lolos" if lolos else "GAGAL"}')
sys.exit(1 if gagal else 0)
