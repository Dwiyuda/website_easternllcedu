// Peta Tiongkok abstrak (MASTER.md): pesisir, dua sungai yang meruncing, dan titik kota. Digambar saat build.
export type LonLat = readonly [number, number];
type Titik = [number, number];

export const PEKANBARU: LonLat = [101.45, 0.51];
export const X = (lon: number) => (lon - 73) * 14 * 0.819;
export const Y = (lat: number) => (54 - lat) * 14;

const keLayar = (daftar: readonly LonLat[]): Titik[] => daftar.map(([lon, lat]) => [X(lon), Y(lat)]);
const tulis = (p: Titik) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;

/** Menghaluskan garis dengan kurva Catmull-Rom. Hasilnya (n − 1) × langkah + 1 titik. */
export function halus(titik: readonly Titik[], langkah: number): Titik[] {
  const p = [titik[0], ...titik, titik[titik.length - 1]];
  const hasil: Titik[] = [];
  for (let i = 1; i < p.length - 2; i++) {
    const [a, b, c, d] = [p[i - 1], p[i], p[i + 1], p[i + 2]];
    for (let s = 0; s < langkah; s++) {
      const t = s / langkah;
      const titikBaru = [0, 1].map((j) => 0.5 * (2 * b[j] + (-a[j] + c[j]) * t
        + (2 * a[j] - 5 * b[j] + 4 * c[j] - d[j]) * t * t + (-a[j] + 3 * b[j] - 3 * c[j] + d[j]) * t * t * t));
      hasil.push(titikBaru as Titik);
    }
  }
  hasil.push([...titik[titik.length - 1]] as Titik);
  return hasil;
}

export function jalurGaris(lonlat: readonly LonLat[]): string {
  return `M${halus(keLayar(lonlat), 6).map(tulis).join('L')}`;
}

/** Bidang sungai yang melebar dari hulu ke muara, seperti sapuan kuas. */
export function jalurSungai(lonlat: readonly LonLat[], lebarHulu: number, lebarMuara: number): string {
  const c = halus(keLayar(lonlat), 8);
  const kiri: Titik[] = [];
  const kanan: Titik[] = [];
  c.forEach((p, i) => {
    const q = c[Math.min(i + 1, c.length - 1)];
    const r = c[Math.max(i - 1, 0)];
    let dx = q[0] - r[0];
    let dy = q[1] - r[1];
    const l = Math.hypot(dx, dy) || 1;
    dx /= l;
    dy /= l;
    const w = (lebarHulu + ((lebarMuara - lebarHulu) * i) / (c.length - 1)) / 2;
    kiri.push([p[0] - dy * w, p[1] + dx * w]);
    kanan.push([p[0] + dy * w, p[1] - dx * w]);
  });
  return `M${[...kiri, ...kanan.reverse()].map(tulis).join('L')}Z`;
}

export function jarakKm([lon1, lat1]: LonLat, [lon2, lat2]: LonLat): number {
  const r = Math.PI / 180;
  const a = Math.sin(((lat2 - lat1) * r) / 2) ** 2
    + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(((lon2 - lon1) * r) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

export const jarakBulat = (a: LonLat, b: LonLat) => Math.round(jarakKm(a, b) / 50) * 50;
export const jariTitik = (jumlahKampus: number) => 3 + jumlahKampus * 1.2;

/** Potongan Tiongkok timur (MASTER.md: di HP peta dipotong ke Tiongkok timur; Daftar Kampus 9c memakai potongan yang sama). */
export const POTONG = { x: 372, y: 84, lebar: 336, tinggi: 384 } as const;

/** Letak titik dalam persen lebar dan tinggi potongan, untuk lapisan HTML di atas SVG. */
export const posisi = (lon: number, lat: number) => ({
  kiri: ((X(lon) - POTONG.x) / POTONG.lebar) * 100,
  atas: ((Y(lat) - POTONG.y) / POTONG.tinggi) * 100,
});
