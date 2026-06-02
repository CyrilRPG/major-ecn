import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/require-role';
import { siteUrl } from '@/lib/email/send';

export const dynamic = 'force-dynamic';

/**
 * Diagnostic envoi Resend.
 * GET /api/admin/email-status (admin only)
 *
 * Renvoie ce que le runtime serveur voit dans les variables d'env,
 * sans exposer la valeur de la clé.
 */
export async function GET() {
  await requireAdmin();
  const key = process.env.RESEND_API_KEY ?? '';
  const from = process.env.EMAIL_FROM ?? null;
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? null;
  const resolved = siteUrl(); // cascade NEXT_PUBLIC_SITE_URL > VERCEL_PROJECT_PRODUCTION_URL > VERCEL_URL
  return NextResponse.json({
    resend_api_key_set: key.length > 0,
    resend_api_key_prefix: key ? key.slice(0, 6) + '…' : null,
    email_from: from ?? 'Major ECN <onboarding@resend.dev> (sandbox par défaut)',
    site_url: site,
    site_url_resolved: resolved,
    vercel_production_url: process.env.VERCEL_PROJECT_PRODUCTION_URL ?? null,
    vercel_url: process.env.VERCEL_URL ?? null,
    fallback_in_use: from === null,
    note: from === null
      ? 'EMAIL_FROM non défini → on utilise l\'adresse sandbox Resend qui marche sans configuration DNS. Définir EMAIL_FROM une fois le domaine vérifié.'
      : 'EMAIL_FROM défini. Vérifiez que le domaine est validé sur resend.com/domains pour éviter les rejets 403.',
  });
}
