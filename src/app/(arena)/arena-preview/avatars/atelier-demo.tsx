'use client';

import { useCallback, useState } from 'react';
import { AvatarAtelier } from '@/components/avatar/avatar-atelier';
import { avatarDepuisChaine, empreinte } from '@/lib/avatars/traits';

/**
 * Atelier en conditions réelles, dans les deux thèmes et les deux périmètres.
 * La disponibilité est SIMULÉE : un code sur trois est déclaré pris, pour voir
 * le grisé de la dernière étape sans base de données. Développement seul.
 */
export function AtelierDemo() {
  const [arena, setArena] = useState(avatarDepuisChaine('demo-arena', 'arena'));
  const [clair, setClair] = useState(avatarDepuisChaine('demo-clair', 'plateforme'));

  const simuler = useCallback(async (codes: string[]) => {
    await new Promise((r) => setTimeout(r, 250));
    return codes.filter((c) => empreinte(c) % 3 === 0);
  }, []);

  return (
    <>
      <div style={{ padding: 18, border: '1px solid #1d2733', borderRadius: 18, marginBottom: 18 }}>
        <p style={{ color: '#8B95A3', fontSize: 12, margin: '0 0 12px' }}>EVC Arena — 24 portraits, disponibilité simulée</p>
        <AvatarAtelier
          valeur={arena}
          onChange={setArena}
          theme="arena"
          perimetre="arena"
          verifierDisponibilite={simuler}
          legende="Votre médaillon tel qu’il apparaîtra dans le classement."
        />
      </div>
      <div style={{ padding: 18, background: '#fff', borderRadius: 18, color: '#0f1720' }}>
        <p style={{ color: '#5a6874', fontSize: 12, margin: '0 0 12px' }}>Major ECN — 23 portraits (le gladiateur reste à l’Arena)</p>
        <AvatarAtelier
          valeur={clair}
          onChange={setClair}
          perimetre="plateforme"
          verifierDisponibilite={simuler}
          legende="Thème clair — espace élève."
        />
      </div>
    </>
  );
}
