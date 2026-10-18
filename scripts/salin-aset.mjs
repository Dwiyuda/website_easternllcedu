// Menyalin bahan dari paket npm ke repo, supaya build di Cloudflare tidak bergantung pada skrip ini.
import { copyFile, mkdir } from 'node:fs/promises';

const IKON = { expand_more: 'keyboard_arrow_down' }; // nama di MASTER.md → nama berkas di paket 0.48.0
const DAFTAR_IKON = ['expand_more', 'menu', 'close', 'arrow_forward', 'chevron_right', 'open_in_new', 'location_on', 'call',
  'mail', 'schedule', 'calendar_month', 'check', 'play_arrow', 'pause'];
const MEREK = ['whatsapp', 'instagram', 'facebook', 'youtube'];
const AKSARA = [...'东方学留游合成信讯影联申寻校程问'];

await mkdir('src/assets/ikon', { recursive: true });
await mkdir('src/data/hanzi', { recursive: true });
await mkdir('public/lisensi', { recursive: true });

for (const n of DAFTAR_IKON) {
  await copyFile(`node_modules/@material-symbols/svg-400/rounded/${IKON[n] ?? n}-fill.svg`, `src/assets/ikon/${n}.svg`);
}
for (const m of MEREK) await copyFile(`node_modules/simple-icons/icons/${m}.svg`, `src/assets/ikon/merek-${m}.svg`);
for (const a of AKSARA) await copyFile(`node_modules/hanzi-writer-data/${a}.json`, `src/data/hanzi/${a}.json`);

await copyFile('node_modules/hanzi-writer-data/APL/english/ARPHICPL.TXT', 'public/lisensi/arphic.txt');
await copyFile('node_modules/hanzi-writer/LICENSE', 'public/lisensi/hanzi-writer.txt');
await copyFile('node_modules/@material-symbols/svg-400/LICENSE', 'public/lisensi/material-symbols.txt');
console.log(`${DAFTAR_IKON.length} ikon, ${MEREK.length} logo merek, ${AKSARA.length} aksara, 3 lisensi disalin`);
