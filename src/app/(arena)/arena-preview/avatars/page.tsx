import { notFound } from 'next/navigation';
import { PortraitAvatar } from '@/components/avatar/portrait-avatar';
import { ParcoursDemo } from './parcours-demo';
import { CRITERES, OPTIONS, PORTRAITS, decrireAvatar, libelleOption } from '@/lib/avatars/portraits';

/**
 * Recette du catalogue : les 320 portraits avec leur description, puis la
 * répartition de chaque trait — c'est ici qu'on repère un portrait mal
 * étiqueté. Route de développement uniquement.
 */
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Recette avatars', robots: { index: false, follow: false } };

const titre = { fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#E4002B', margin: '0 0 8px' } as const;

export default function Page() {
  if (process.env.NODE_ENV !== 'development') notFound();
  return (
    <main style={{ background: '#0B0F14', color: '#F2F3F5', minHeight: '100vh', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      {/* Le bandeau cookies du site masque la planche : sans effet hors développement. */}
      <style dangerouslySetInnerHTML={{ __html: 'body > div.z-\[60\]{display:none}' }} />
      <h1 style={{ fontSize: 22, margin: '0 0 4px' }}>Portraits — recette</h1>
      <p style={{ color: '#8B95A3', fontSize: 13, margin: '0 0 24px' }}>{PORTRAITS.length} portraits</p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={titre}>Répartition des traits</h2>
        {CRITERES.map((c) => (
          <p key={c} style={{ fontSize: 12, color: '#8B95A3', margin: '0 0 4px' }}>
            <strong style={{ color: '#F2F3F5' }}>{c}</strong> —{' '}
            {OPTIONS[c].map((o) => `${o.label} ${PORTRAITS.filter((p) => p.traits[c] === o.valeur).length}`).join(' · ')}
          </p>
        ))}
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={titre}>Catalogue</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
          {PORTRAITS.map((p) => (
            <figure key={p.code} style={{ margin: 0, textAlign: 'center' }}>
              <PortraitAvatar seed={p.code} size={96} style={{ margin: '0 auto' }} />
              <figcaption style={{ fontSize: 10, color: '#8B95A3', marginTop: 4, lineHeight: 1.35 }} title={decrireAvatar(p.code)}>
                <strong style={{ color: '#F2F3F5' }}>{p.code}</strong><br />
                {CRITERES.map((c) => libelleOption(c, p.traits[c])).join(' · ')}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section>
        <h2 style={titre}>Parcours</h2>
        <ParcoursDemo />
      </section>
    </main>
  );
}
