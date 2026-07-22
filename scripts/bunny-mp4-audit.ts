/**
 * Audit MP4 Fallback de la librairie Bunny Stream (lecture seule par défaut).
 *
 * Le téléchargement hors ligne de l'app mobile exige des renditions MP4
 * (`hasMP4Fallback`). Les vidéos uploadées AVANT l'activation du MP4 Fallback
 * sur la librairie n'en ont pas et doivent être ré-encodées.
 *
 * Usage :
 *   pnpm tsx scripts/bunny-mp4-audit.ts              → rapport uniquement
 *   pnpm tsx scripts/bunny-mp4-audit.ts --reencode   → relance l'encodage des
 *                                                      vidéos sans MP4 (long !)
 *
 * Env requises (.env.local) : BUNNY_STREAM_LIBRARY_ID, BUNNY_STREAM_API_KEY.
 */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as dotenv } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv({ path: join(__dirname, '..', '.env.local') });
dotenv({ path: join(__dirname, '..', '.env') });

const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID?.trim();
const apiKey = process.env.BUNNY_STREAM_API_KEY?.trim();
const doReencode = process.argv.includes('--reencode');

if (!libraryId || !apiKey) {
  console.error('BUNNY_STREAM_LIBRARY_ID / BUNNY_STREAM_API_KEY manquantes.');
  process.exit(1);
}

type BunnyVideo = {
  guid: string;
  title: string;
  status: number;
  length: number;
  hasMP4Fallback: boolean;
  availableResolutions: string | null;
  storageSize: number;
};

async function listAll(): Promise<BunnyVideo[]> {
  const all: BunnyVideo[] = [];
  for (let page = 1; page <= 100; page++) {
    const res = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos?page=${page}&itemsPerPage=100&orderBy=date`,
      { headers: { AccessKey: apiKey!, accept: 'application/json' } },
    );
    if (!res.ok) throw new Error(`Bunny list a échoué (${res.status}) : ${(await res.text()).slice(0, 200)}`);
    const data = (await res.json()) as { items?: BunnyVideo[]; totalItems?: number };
    const items = data.items ?? [];
    all.push(...items);
    if (items.length < 100) break;
  }
  return all;
}

async function main() {
  const videos = await listAll();
  const withMp4 = videos.filter((v) => v.hasMP4Fallback);
  const withoutMp4 = videos.filter((v) => !v.hasMP4Fallback);
  const gb = (n: number) => (n / 1024 ** 3).toFixed(2);

  console.log(`Librairie ${libraryId} — ${videos.length} vidéo(s), ${gb(videos.reduce((s, v) => s + v.storageSize, 0))} Go`);
  console.log(`  ✓ MP4 Fallback présent : ${withMp4.length}`);
  console.log(`  ✗ MP4 Fallback ABSENT  : ${withoutMp4.length}`);

  if (withoutMp4.length > 0) {
    console.log('\nVidéos sans MP4 (à ré-encoder après activation du MP4 Fallback sur la librairie) :');
    for (const v of withoutMp4) {
      console.log(`  - ${v.guid}  [status ${v.status}, ${Math.round(v.length / 60)} min]  ${v.title}`);
    }
  }

  if (doReencode && withoutMp4.length > 0) {
    console.log('\n--reencode : relance de l’encodage…');
    let ok = 0;
    for (const v of withoutMp4) {
      const res = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos/${v.guid}/reencode`, {
        method: 'POST',
        headers: { AccessKey: apiKey!, accept: 'application/json' },
      });
      console.log(`  ${res.ok ? '✓' : '✗'} ${v.guid} ${res.ok ? '' : `(${res.status})`}`);
      if (res.ok) ok++;
      await new Promise((r) => setTimeout(r, 300)); // ménage l'API
    }
    console.log(`\n${ok}/${withoutMp4.length} ré-encodage(s) lancé(s). L'encodage peut prendre des heures — relancez l'audit plus tard.`);
  } else if (withoutMp4.length > 0) {
    console.log('\nActivez d’abord « MP4 Fallback » dans la config de la librairie Bunny, puis relancez avec --reencode.');
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
