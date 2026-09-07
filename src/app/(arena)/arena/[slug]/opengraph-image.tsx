import { ImageResponse } from 'next/og';
import { getTournamentBySlug } from '@/lib/arena/db';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'EVC Arena — tournoi de QCM Major ECN';

/** Image Open Graph dédiée, 1200 × 630 (§8.1), générée depuis le tournoi. */
export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = await getTournamentBySlug(slug);
  const specialty = t?.specialty ?? 'Tournoi de QCM';
  const edition = t?.edition_label ?? '';
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(180deg, #060A14 0%, #0C1322 100%)', color: '#F4F6FB', padding: 64, fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 26, letterSpacing: 4, textTransform: 'uppercase', color: '#F25667', fontWeight: 800 }}>
          <span style={{ display: 'flex', width: 46, height: 4, background: '#E4002B' }} />
          Tournoi de QCM · {specialty}{edition ? ` · ${edition}` : ''}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 150, fontWeight: 900, letterSpacing: -10, lineHeight: 0.9 }}>EVC</div>
          <div style={{ display: 'flex', fontSize: 150, fontWeight: 900, letterSpacing: -10, lineHeight: 0.9, color: '#E4002B' }}>ARENA</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', fontSize: 34, fontWeight: 700, color: '#F4F6FB' }}>Trois manches · Douze questions · Douze minutes · Une seule tentative</div>
          <div style={{ display: 'flex', fontSize: 26, color: '#A5AFC4' }}>major-ecn.fr</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
