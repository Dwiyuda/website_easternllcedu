// Situs statis dua bahasa. Format "preserve" membuat src/pages/id/404.astro menjadi dist/id/404.html,
// yang dibutuhkan Cloudflare Pages untuk 404 per bahasa.
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { fileURLToPath } from 'node:url';
import { rapikan } from './src/i18n/rute';
import { pangkasFontDiDist, peringatanPangkas } from './src/lib/pangkas-font';
import { diindeks, htmlHalaman, pasanganHreflang } from './src/lib/peta-situs';
import { modeFinal, situsBuild } from './src/lib/situs';

const DIST = fileURLToPath(new URL('./dist/', import.meta.url));
const FINAL = modeFinal(process.argv);

// Setiap `astro build` (build, build:final, test:build, Cloudflare Pages) memangkas CSS, glyph, dan berkas font LXGW di dist.
// Hook build:done dipilih karena berjalan setelah semua berkas tertulis dan hanya saat build, bukan di dev server.
// Galat subset font dan rujukan tersisa ke CSS font Han lama menggagalkan build.
const pangkasFont = {
  name: 'pangkas-font-han',
  hooks: {
    'astro:build:done': async ({ dir, logger }) => {
      const h = await pangkasFontDiDist(fileURLToPath(dir));
      logger.info(`Aturan @font-face di CSS (LXGW dipangkas): ${h.sebelum} -> ${h.sesudah}`);
      logger.info(`Font LXGW yang ditautkan (subset glyph): ${h.byteAsli} -> ${h.byteSubset} byte`);
      logger.info(`Potongan LXGW asli yang tidak dirujuk, dihapus dari dist: ${h.dibuang} berkas, ${h.byteDibuang} byte`);
      const peringatan = peringatanPangkas(h);
      if (peringatan) logger.warn(peringatan);
    },
  },
};

export default defineConfig({
  site: situsBuild(process.argv, process.env),
  output: 'static',
  build: { format: 'preserve' },
  i18n: {
    locales: ['id', 'zh'],
    defaultLocale: 'id',
    // Astro 7 mewajibkan src/pages/index.astro kalau redirectToDefaultLocale true.
    // Akar / dialihkan lewat public/_redirects, jadi opsi ini dimatikan.
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
  integrations: [
    pangkasFont,
    // Sitemap dibaca dari HTML yang sudah dibangun (src/lib/peta-situs.ts): pasangan bahasa dari hreflang halamannya; build final
    // melewati halaman noindex. Halaman staf dan 404 tidak pernah masuk. Hanya akar bahasa berakhir "/" (rapikan di rute.ts).
    sitemap({
      filter: (halaman) => !/\/(404|entri-tertahan)(\.html)?$/.test(halaman) && (!FINAL || diindeks(htmlHalaman(DIST, halaman))),
      serialize(item) {
        const x = new URL(item.url);
        item.url = new URL(rapikan(x.pathname), x).href;
        const links = pasanganHreflang(htmlHalaman(DIST, item.url));
        item.links = links.length > 0 ? links : undefined;
        return item;
      },
    }),
  ],
});
