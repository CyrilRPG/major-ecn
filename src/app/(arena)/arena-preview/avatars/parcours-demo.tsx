'use client';

import { useCallback, useState } from 'react';
import { AvatarParcours } from '@/components/avatar/avatar-parcours';
import { avatarDepuisChaine, empreinte } from '@/lib/avatars/portraits';

/**
 * Parcours en conditions réelles, dans les deux thèmes. La disponibilité est
 * SIMULÉE côté Arena : un code sur trois est déclaré pris, pour voir le grisé
 * de la dernière étape sans base de données. Développement seul.
 */
export function ParcoursDemo() {
  const [arena, setArena] = useState(avatarDepuisChaine('demo-arena'));
  const [clair, setClair] = useState(avatarDepuisChaine('demo-clair'));

  const simuler = useCallback(async (codes: string[]) => {
    await new Promise((r) => setTimeout(r, 250));
    return codes.filter((c) => empreinte(c) % 3 === 0);
  }, []);

  return (
    <>
      <div style={{ padding: 18, border: '1px solid #1d2733', borderRadius: 18, marginBottom: 18 }}>
        <p style={{ color: '#8B95A3', fontSize: 12, margin: '0 0 12px' }}>EVC Arena — disponibilité simulée</p>
        <AvatarParcours
          valeur={arena}
          onChange={setArena}
          theme="arena"
          verifierDisponibilite={simuler}
          legende="Votre portrait tel qu’il apparaîtra dans le classement."
        />
      </div>
      <div style={{ padding: 18, background: '#fff', borderRadius: 18, color: '#0f1720' }}>
        <p style={{ color: '#5a6874', fontSize: 12, margin: '0 0 12px' }}>Major ECN — sans unicité</p>
        <AvatarParcours valeur={clair} onChange={setClair} legende="Thème clair — espace élève." />
      </div>
    </>
  );
}
