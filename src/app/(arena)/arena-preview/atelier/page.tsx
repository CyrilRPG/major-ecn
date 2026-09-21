import { notFound } from 'next/navigation';
import { AtelierDemo } from '../avatars/atelier-demo';

/** Recette de l'atelier seul — page légère, développement uniquement. */
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Recette atelier', robots: { index: false, follow: false } };

export default function Page() {
  if (process.env.NODE_ENV !== 'development') notFound();
  return (
    <main style={{ background: '#0B0F14', color: '#F2F3F5', minHeight: '100vh', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <style dangerouslySetInnerHTML={{ __html: 'body > div.z-\[60\]{display:none}' }} />
      <h1 style={{ fontSize: 20, margin: '0 0 16px' }}>Atelier en quatre étapes</h1>
      <AtelierDemo />
    </main>
  );
}
