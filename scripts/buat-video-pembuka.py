# Video pembuka CONTOH untuk prototipe (keputusan 2026-10-11): empat foto Eastern bergantian dengan lintas pudar,
# 12,6 detik, tanpa suara. Diganti klip asli dari Eastern, masing-masing maksimal 15 detik.
# Jalankan dari akar repo: python scripts/buat-video-pembuka.py
import subprocess
from pathlib import Path

import imageio_ffmpeg
from PIL import Image, ImageOps

SUMBER = Path('bahan/ppt-media')
FOTO = ['image16.jpeg', 'image6.jpeg', 'image14.jpeg', 'image8.jpeg']  # keberangkatan, kelas, camp, sekolah
TAMPIL, PUDAR, LEBAR, TINGGI = 3.6, 0.6, 1280, 720
KELUAR = Path('public/video/pembuka-contoh.mp4')

masukan = []
for f in FOTO:
    masukan += ['-loop', '1', '-t', str(TAMPIL), '-i', str(SUMBER / f)]

skala = ';'.join(
    f'[{i}]scale={LEBAR}:{TINGGI}:force_original_aspect_ratio=increase,crop={LEBAR}:{TINGGI},setsar=1,fps=30[v{i}]'
    for i in range(len(FOTO)))
rantai, sebelumnya = [], 'v0'
for i in range(1, len(FOTO)):
    keluar = f'x{i}'
    rantai.append(f'[{sebelumnya}][v{i}]xfade=transition=fade:duration={PUDAR}:offset={round(i * (TAMPIL - PUDAR), 2)}[{keluar}]')
    sebelumnya = keluar

KELUAR.parent.mkdir(parents=True, exist_ok=True)
# Foto JPEG berskala penuh (yuvj420p). Tanpa konversi, ffmpeg hanya menempelkan penanda yuv420p dan Chrome membaca
# aliran sebagai rentang terbatas: kontras ±17% terlalu keras. Skala ke rentang TV BT.709 dan tandai lengkap lewat setparams
# (opsi -color_* saja tidak menembus: primaries dan trc tetap "unknown" di aliran).
rantai.append(f'[{sebelumnya}]scale=in_range=pc:in_color_matrix=bt601:out_range=tv:out_color_matrix=bt709,format=yuv420p,setparams=range=tv:colorspace=bt709:color_primaries=bt709:color_trc=bt709[akhir]')
subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), '-y', *masukan,
                '-filter_complex', f'{skala};{";".join(rantai)}', '-map', '[akhir]',
                '-c:v', 'libx264', '-preset', 'slow', '-crf', '28', '-pix_fmt', 'yuv420p',
                '-movflags', '+faststart', '-an', str(KELUAR)], check=True)

# Sampul = bingkai pertama (potongan tengah 16:9 yang sama), tampil lebih dulu dan menjadi elemen LCP.
sampul = ImageOps.fit(Image.open(SUMBER / FOTO[0]).convert('RGB'), (1600, 900), method=Image.Resampling.LANCZOS)
sampul.save('src/assets/foto/pembuka-sampul.webp', 'WEBP', quality=82)
print(f'{KELUAR} {KELUAR.stat().st_size / 1e6:.1f} MB, durasi {len(FOTO) * TAMPIL - (len(FOTO) - 1) * PUDAR:.1f} detik')
