// Isi robots.txt. Dipisah dari src/pages/robots.txt.ts supaya cabang build final bisa diuji tanpa build final
// (build final sengaja gagal selama masih ada isi contoh).
export function isiRobots(mode: string, situs: URL | string): string {
  return mode === 'final'
    ? `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /entri-tertahan\n\nSitemap: ${new URL('sitemap-index.xml', situs)}\n`
    : 'User-agent: *\nDisallow: /\n';
}
