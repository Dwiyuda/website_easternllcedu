// Video YouTube (Desain Teknis bagian 3, PRD F12). MP4 di Cloudflare R2 menyusul (P19). Pola yang sama dipakai skema
// (content.config.ts) dan form panel admin (pattern), supaya tautan salah ditolak panel, bukan menggagalkan build.
export const POLA_YOUTUBE = /^https:\/\/(www\.youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)([\w-]{11})/;

/** Alamat tonton (tautan biasa, juga di halaman 中文) dan alamat sematan tanpa cookie (hanya halaman Indonesia, setelah diklik). */
export function videoYoutube(alamat: string): { id: string; tonton: string; sematan: string } | undefined {
  const id = POLA_YOUTUBE.exec(alamat)?.[3];
  return id ? { id, tonton: `https://www.youtube.com/watch?v=${id}`, sematan: `https://www.youtube-nocookie.com/embed/${id}` } : undefined;
}
