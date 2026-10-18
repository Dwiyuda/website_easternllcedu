// Tanggal "Diperbarui" otomatis dari riwayat Git (Model Konten aturan 4). Klon dangkal (riwayat terpotong, mungkin di Cloudflare
// Pages) atau berkas yang belum di-commit memberi undefined: halaman menyembunyikan barisnya, bukan menulis tanggal yang salah.
import { execFileSync } from 'node:child_process';

const git = (...arg: string[]) => execFileSync('git', arg, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
let dangkal: boolean | undefined;

export function tanggalUbah(berkas: string): string | undefined {
  try {
    dangkal ??= git('rev-parse', '--is-shallow-repository') === 'true';
    if (dangkal) return undefined;
    return git('log', '-1', '--format=%cs', '--', berkas) || undefined;
  } catch {
    return undefined;
  }
}
