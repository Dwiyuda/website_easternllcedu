// Paket font tanpa tipe bawaan; hanya bagian yang dipakai pangkas-font.ts dan tes build-nya.
declare module 'subset-font' {
  export default function subsetFont(font: Uint8Array, teks: string, opsi?: { targetFormat?: 'woff2' | 'woff' | 'truetype' | 'sfnt' }): Promise<Buffer>;
}
declare module 'fontverter' {
  export function convert(font: Uint8Array, format: 'woff2' | 'woff' | 'truetype' | 'sfnt'): Promise<Buffer>;
}
