/** Menyiapkan SVG ikon: ukuran tetap, warna mengikuti teks, label hanya untuk ikon tanpa teks (MASTER.md, Ikon). */
const aman = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

export function siapkanSvg(mentah: string, ukuran: number, label?: string): string {
  const atribut = label ? `role="img" aria-label="${aman(label)}"` : 'aria-hidden="true"';
  return mentah
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/\s(width|height|role)="[^"]*"/g, '')
    // Fungsi pengganti: pola seperti $& di label tidak ditafsirkan sebagai rujukan hasil cocok.
    .replace('<svg', () => `<svg width="${ukuran}" height="${ukuran}" fill="currentColor" focusable="false" ${atribut}`);
}
