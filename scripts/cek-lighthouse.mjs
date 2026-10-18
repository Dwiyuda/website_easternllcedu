// Mengukur halaman dengan Lighthouse versi HP. Gagal kalau ada kategori di bawah 90, LCP lebih dari 2,5 detik,
// atau CLS 0,1 ke atas (PRD ukuran keberhasilan 2). Hanya empat kategori PRD yang dinilai: Lighthouse 13 menambah
// agentic-browsing yang bukan target. is-crawlable dilewati karena prototipe sengaja noindex.
import { execFileSync } from 'node:child_process';

const BATAS_LCP_MS = 2500;
const BATAS_CLS = 0.1;

// Argumen berawalan -- diteruskan ke Lighthouse apa adanya (mis. --throttling-method=devtools); sisanya alamat halaman.
const opsi = process.argv.slice(2).filter((a) => a.startsWith('--'));
const halaman = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (halaman.length === 0) throw new Error('Pakai: npm run lighthouse -- [--throttling-method=devtools] http://localhost:4321/id/ http://localhost:4321/zh/');

let adaYangGagal = false;
for (const url of halaman) {
  try {
    const keluaran = execFileSync(process.execPath, ['node_modules/lighthouse/cli/index.js', url, '--quiet', '--output=json',
      '--only-categories=performance,accessibility,best-practices,seo',
      '--chrome-flags=--headless=new', '--skip-audits=is-crawlable', ...opsi], { encoding: 'utf8', maxBuffer: 1e8 });
    const r = JSON.parse(keluaran);
    const skor = Object.fromEntries(Object.entries(r.categories).map(([k, v]) => [k, Math.round(v.score * 100)]));
    const lcp = r.audits['largest-contentful-paint'];
    const cls = r.audits['cumulative-layout-shift'];
    const fcp = r.audits['first-contentful-paint'];
    console.log(url, skor, 'FCP', `${Math.round(fcp.numericValue)} ms`, 'LCP', `${Math.round(lcp.numericValue)} ms`, 'CLS', cls.displayValue);
    const gagal = [
      ...Object.entries(skor).filter(([, s]) => s < 90).map(([k, s]) => `${k} ${s} (minimal 90)`),
      ...(lcp.numericValue > BATAS_LCP_MS ? [`LCP ${Math.round(lcp.numericValue)} ms (maksimal ${BATAS_LCP_MS} ms)`] : []),
      ...(cls.numericValue >= BATAS_CLS ? [`CLS ${cls.displayValue} (harus di bawah 0,1)`] : []),
    ];
    if (gagal.length) throw new Error(gagal.join(', '));
  } catch (galat) {
    // Satu halaman gagal tidak menghentikan halaman berikutnya.
    console.error(`GAGAL ${url}: ${galat.message}`);
    adaYangGagal = true;
  }
}
if (adaYangGagal) process.exitCode = 1;
