import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import { getTournamentBySlug } from '@/lib/arena/db';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'EVC Arena — tournoi de QCM Major ECN';

/** Image Open Graph dédiée, 1200 × 630 (§8.1) : stade sous lumière rouge, casque, EVC ARENA, spécialité. */
export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = await getTournamentBySlug(slug);
  const specialty = t?.specialty ?? 'Tournoi de QCM';
  const edition = t?.edition_label ?? '';
  let photo: string | null = null;
  try {
    const buf = await readFile(path.join(process.cwd(), 'public', 'arena', 'stadium-red.jpg'));
    photo = `data:image/jpeg;base64,${buf.toString('base64')}`;
  } catch {
    photo = null;
  }
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', background: '#0B0F14', color: '#F2F3F5', fontFamily: 'sans-serif' }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse (Satori) exige une balise img native */}
        {photo && <img src={photo} alt="" width={1200} height={630} style={{ position: 'absolute', inset: 0, width: 1200, height: 630, objectFit: 'cover', opacity: 0.55 }} />}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', background: 'linear-gradient(180deg, rgba(228,0,43,0.25) 0%, rgba(11,15,20,0.2) 40%, rgba(11,15,20,0.95) 100%)' }} />
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', height: '100%', padding: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 26, letterSpacing: 6, textTransform: 'uppercase', color: '#FF3B57', fontWeight: 800 }}>
            <span style={{ display: 'flex', width: 46, height: 4, background: '#E4002B' }} />
            Tournoi de QCM · {specialty}{edition ? ` · ${edition}` : ''}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <svg width="110" height="110" viewBox="0 0 64 64">
              <path d="M32 3 C 22.5 3, 15.5 10.5, 15.5 20 L 21 20 C 21 13.5, 25.8 9, 32 9 C 38.2 9, 43 13.5, 43 20 L 48.5 20 C 48.5 10.5, 41.5 3, 32 3 Z" fill="#E4002B" />
              <path d="M13 40 C 13 25, 21 17, 32 17 C 43 17, 51 25, 51 40 L 51 51 L 43 61 L 39.5 61 L 39.5 50 L 24.5 50 L 24.5 61 L 21 61 L 13 51 Z" fill="#E4002B" />
              <path d="M18.5 35 h9.5 v6.5 h-9.5 z" fill="#0B0F14" />
              <path d="M36 35 h9.5 v6.5 h-9.5 z" fill="#0B0F14" />
              <path d="M27.5 50 h9 v11 h-9 z" fill="#0B0F14" />
            </svg>
            <div style={{ display: 'flex', gap: 28, fontSize: 168, fontWeight: 900, letterSpacing: 4, lineHeight: 0.9, marginTop: 8 }}>
              <span>EVC</span>
              <span style={{ color: '#E4002B' }}>ARENA</span>
            </div>
            <div style={{ display: 'flex', fontSize: 22, letterSpacing: 12, textTransform: 'uppercase', color: '#B8BEC8', marginTop: 6 }}>Major ECN</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', fontSize: 32, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2 }}>3 manches · 12 questions · 12 minutes · 1 tentative</div>
            <div style={{ display: 'flex', fontSize: 26, color: '#B8BEC8' }}>major-ecn.fr</div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
