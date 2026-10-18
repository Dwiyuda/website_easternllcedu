// Alamat situs untuk kanonik, hreflang, sitemap, dan og:image (bawaan Rencana 5). Build final selalu domain final, apa pun CF_PAGES_URL:
// di produksi Cloudflare Pages CF_PAGES_URL adalah alamat per-deploy (contoh.pages.dev). Pratinjau cabang dan build lokal
// memakai alamat Pages-nya sendiri, supaya tautan di pratinjau bisa diklik.
export const DOMAIN_FINAL = 'https://contoh.example';

export const modeFinal = (argv: readonly string[]) => argv.some((a, i) => a === '--mode=final' || (a === '--mode' && argv[i + 1] === 'final'));

export const situsBuild = (argv: readonly string[], env: Record<string, string | undefined>) =>
  (modeFinal(argv) ? DOMAIN_FINAL : env.CF_PAGES_URL ?? DOMAIN_FINAL);
