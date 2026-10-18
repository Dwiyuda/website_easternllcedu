// Isi contoh boleh tampil di prototipe (berlabel), tapi build untuk domain final ditolak selama masih ada.
export interface PenandaContoh {
  koleksi: string;
  entri: string;
}

export function tolakIsiContoh(mode: string, contoh: readonly PenandaContoh[]): void {
  if (mode !== 'final' || contoh.length === 0) return;
  const daftar = contoh.map((c) => `${c.koleksi}/${c.entri}`).join(', ');
  throw new Error(`Build final ditolak: masih ada ${contoh.length} isi contoh (${daftar}). Ganti dengan data asli atau hapus tanda contoh.`);
}
