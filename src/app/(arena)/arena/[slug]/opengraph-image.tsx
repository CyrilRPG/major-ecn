import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import { getTournamentBySlug } from '@/lib/arena/db';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'EVC Arena — tournoi de QCM Major ECN';

async function dataUrl(file: string, mime: string): Promise<string | null> {
  try {
    const buf = await readFile(path.join(process.cwd(), 'public', 'arena', file));
    return `data:${mime};base64,${buf.toString('base64')}`;
  } catch {
    return null;
  }
}

/** Image Open Graph dédiée, 1200 × 630 (§8.1) : visuel de l'arène, casque, EVC ARENA by Major ECN, spécialité. */
export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = await getTournamentBySlug(slug);
  const specialty = t?.specialty ?? 'Tournoi de QCM';
  const edition = t?.edition_label ?? '';
  const [photo, helmet] = await Promise.all([dataUrl('hero-arena.jpg', 'image/jpeg'), dataUrl('helmet-320.png', 'image/png')]);
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', background: '#0B0F14', color: '#F2F3F5', fontFamily: 'sans-serif' }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse (Satori) exige une balise img native */}
        {photo && <img src={photo} alt="" width={1200} height={630} style={{ position: 'absolute', inset: 0, width: 1200, height: 630, objectFit: 'cover', objectPosition: 'center 30%', opacity: 0.8 }} />}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', background: 'linear-gradient(180deg, rgba(11,15,20,0.25) 0%, rgba(11,15,20,0.35) 45%, rgba(11,15,20,0.95) 100%)' }} />
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', height: '100%', padding: 56 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 24, letterSpacing: 6, textTransform: 'uppercase', color: '#FF3B57', fontWeight: 800 }}>
            <span style={{ display: 'flex', width: 46, height: 4, background: '#E4002B' }} />
            Tournoi de QCM · {specialty}{edition ? ` · ${edition}` : ''}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- idem */}
            {helmet && <img src={helmet} alt="" width={119} height={160} style={{ width: 119, height: 160 }} />}
            <div style={{ display: 'flex', gap: 26, fontSize: 150, fontWeight: 900, letterSpacing: 4, lineHeight: 0.9, marginTop: 4 }}>
              <span>EVC</span>
              <span style={{ color: '#E4002B' }}>ARENA</span>
            </div>
            <div style={{ display: 'flex', fontSize: 20, letterSpacing: 12, textTransform: 'uppercase', color: '#F2F3F5', marginTop: 6, fontWeight: 700 }}>By Major ECN</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', fontSize: 30, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2 }}>3 manches · 12 questions · 12 minutes · 1 tentative</div>
            <div style={{ display: 'flex', fontSize: 24, color: '#B8BEC8' }}>major-ecn.fr</div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
