import { notFound } from 'next/navigation';
import { ComposedAvatarSvg } from '@/components/avatar/composed-avatar';
import { AtelierDemo } from './atelier-demo';
import {
  NOMBRE_DE_COMBINAISONS,
  TRAITS,
  TRAIT_ORDER,
  avatarDepuisChaine,
  decoderAvatar,
  encoderAvatar,
} from '@/lib/avatars/traits';

/**
 * Recette visuelle des médaillons composés : une planche par emplacement, plus
 * un échantillon aux tailles réelles du classement. Route de développement
 * uniquement — elle ne sert qu'à régler le dessin.
 */
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Recette avatars composés', robots: { index: false, follow: false } };

const BASE = encoderAvatar({ portrait: 1, fond: 2, motif: 1, cadre: 1, couleurCadre: 0, lisere: 1, embleme: 0 });

export default async function Page({ searchParams }: { searchParams: Promise<{ base?: string }> }) {
  if (process.env.NODE_ENV !== 'development') notFound();
  const { base = BASE } = await searchParams;
  const config = decoderAvatar(base);
  return (
    <main style={{ background: '#0B0F14', color: '#F2F3F5', minHeight: '100vh', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      {/* Le bandeau cookies du site masque la planche : sans effet hors développement. */}
      <style dangerouslySetInnerHTML={{ __html: 'body > div.z-\\[60\\]{display:none}' }} />
      <h1 style={{ fontSize: 22, margin: '0 0 4px' }}>Médaillons composés — recette</h1>
      <p style={{ color: '#8B95A3', fontSize: 13, margin: '0 0 24px' }}>
        {NOMBRE_DE_COMBINAISONS.toLocaleString('fr-FR')} combinaisons sur les 24 portraits existants · base <code>{base}</code>
      </p>

      <section style={{ display: 'flex', gap: 20, alignItems: 'flex-end', marginBottom: 32 }}>
        <ComposedAvatarSvg seed={base} size={220} />
        <ComposedAvatarSvg seed={base} size={96} />
        <ComposedAvatarSvg seed={base} size={46} />
        <ComposedAvatarSvg seed={base} size={32} />
        <ComposedAvatarSvg seed={base} size={24} />
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#E4002B', margin: '0 0 8px' }}>
          Douze inscrits, douze médaillons — même Arena
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {Array.from({ length: 12 }, (_, i) => (
            <ComposedAvatarSvg key={i} seed={avatarDepuisChaine(`inscrit-${i}`)} size={132} />
          ))}
        </div>
      </section>

      {TRAIT_ORDER.map((key) => (
        <section key={key} style={{ marginBottom: 26 }}>
          <h2 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#E4002B', margin: '0 0 8px' }}>
            {TRAITS[key].label} — {TRAITS[key].options.length}
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {TRAITS[key].options.map((option, i) => (
              <figure key={i} style={{ margin: 0, width: 96, textAlign: 'center' }}>
                <ComposedAvatarSvg seed={encoderAvatar({ ...config, [key]: i })} size={92} />
                <figcaption style={{ fontSize: 10, color: '#8B95A3', marginTop: 2 }}>{i}. {option.label}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      ))}

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#E4002B', margin: '0 0 8px' }}>Atelier</h2>
        <AtelierDemo />
      </section>

      <section>
        <h2 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#E4002B', margin: '0 0 8px' }}>
          Lisibilité à 46 px (classement) puis 32 px
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {Array.from({ length: 24 }, (_, i) => (
            <ComposedAvatarSvg key={i} seed={avatarDepuisChaine(`inscrit-${i}`)} size={46} />
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
          {Array.from({ length: 24 }, (_, i) => (
            <ComposedAvatarSvg key={i} seed={avatarDepuisChaine(`inscrit-${i}`)} size={32} />
          ))}
        </div>
      </section>
    </main>
  );
}
