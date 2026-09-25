import { NextResponse } from 'next/server';

/**
 * Ancienne inscription publique « essai gratuit 7 jours » — FERMÉE le 25/09/2026.
 *
 * Plus aucune page ne l'appelait, mais la route restait ouverte en production :
 * n'importe qui pouvait s'y créer, sans paiement ni authentification, un compte
 * `{ type: 'all', offer: 'intensif' }` (tous les collèges). L'expiration de
 * l'essai n'affichant qu'un bandeau, l'accès n'était jamais coupé — un compte
 * créé ainsi le 29/07/2026 a été utilisé jusqu'en septembre.
 *
 * Les inscriptions passent par le tunnel de paiement Stripe ou par une
 * invitation depuis l'admin.
 */
function fermee() {
  return NextResponse.json(
    { error: 'Les inscriptions se font désormais depuis la page des formules.' },
    { status: 410 },
  );
}

export const POST = fermee;
export const GET = fermee;
