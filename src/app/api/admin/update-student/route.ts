import { NextResponse } from 'next/server';
import { requireAdminRequest } from '@/lib/auth/api-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { UpdateStudentSchema } from '@/lib/schemas/student';
import { highestOffer, type Offer } from '@/types/domain';
import { applyGeriatrieMgBonus } from '@/lib/auth/geriatrie-mg-bonus';

export async function PATCH(req: Request) {
  const guard = await requireAdminRequest(req);
  if (!guard.ok) return guard.error;

  const admin = createAdminClient();

  const body = await req.json().catch(() => ({}));
  const parsed = UpdateStudentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Données invalides' }, { status: 400 });
  }

  const { id, first_name, last_name, phone, permission_type, colleges, cours, can_download, download_colleges, voie, evc_session_id, access_end } = parsed.data;
  // Union des formules : `offers` prime ; `offer` (plus haut rang) sert d'offre
  // d'affichage/de rang (paid_offer, paid_formule…).
  const offerList = Array.from(new Set((parsed.data.offers && parsed.data.offers.length > 0 ? parsed.data.offers : [parsed.data.offer]))) as Offer[];
  const offer = highestOffer(offerList);
  const offersField = offerList.length > 1 ? { offers: offerList } : {};

  // Préserve les métadonnées d'inscription (signup, specialty_wish, espace_decouverte)
  // déjà stockées dans permission_scope : l'édition admin reconstruit le scope
  // (type/collèges/offre) et ne doit pas effacer ces informations.
  // paid_voie / paid_specialty sont RECALCULÉS depuis le formulaire (l'admin peut
  // changer la voie / accorder ou retirer Médecine générale), pas préservés.
  const { data: existing } = await (admin as any)
    .from('profiles').select('permission_scope').eq('id', id).maybeSingle();
  const prev = (existing?.permission_scope ?? {}) as Record<string, unknown>;
  const isPaidOffer = offer === 'essentiel' || offer === 'intensif' || offer === 'approfondi';
  const meta: Record<string, unknown> = {};
  // Métadonnées à conserver. Lorsqu'on accorde une offre PAYANTE, on ne reporte
  // pas `espace_decouverte` (flag hérité de l'inscription gratuite) : sinon le
  // profil continue d'afficher « Découverte » et le bandeau « Découverte terminé ».
  for (const k of ['signup', 'specialty_wish', 'espace_decouverte', 'paid_offer', 'paid_formule', 'paid_at'] as const) {
    if (k === 'espace_decouverte' && isPaidOffer) continue;
    if (prev[k] !== undefined) meta[k] = prev[k];
  }
  // Marque l'offre payante comme réglée (débloque l'accès complet côté affichage).
  if (isPaidOffer) {
    meta.paid_offer = offer;
    if (!meta.paid_formule) meta.paid_formule = offer;
    if (!meta.paid_at) meta.paid_at = new Date().toISOString();
  }

  // Bonus « Gériatrie → Médecine générale » (cf. lib/auth/geriatrie-mg-bonus.ts).
  //
  // Le bonus est une propriété INTRINSÈQUE de l'inscription en Gériatrie, pas
  // une permission à cocher : il est donc ré-appliqué à CHAQUE édition tant que
  // l'élève reste en Gériatrie. Ne l'appliquer qu'à la transition
  // « pas de gériatrie » → « gériatrie » faisait perdre l'accès MG à chaque
  // ré-enregistrement du dialog admin (le formulaire ne renvoie pas les
  // sous-collèges MG ni les 60 items bonus, qui étaient donc écrasés).
  // Pour retirer l'accès MG, l'admin retire Gériatrie.
  const nextColleges = colleges ?? [];
  const { colleges: collegesAvecBonus, cours: coursAvecBonus } =
    permission_type === 'college'
      ? await applyGeriatrieMgBonus(admin, nextColleges, cours)
      : { colleges: nextColleges, cours: cours && cours.length > 0 ? cours : undefined };

  // Déduire la spécialité du choix ADMIN, avant l'ajout automatique des bonus.
  // Sinon Gériatrie serait étiquetée « Médecine générale » parce que son bonus
  // ajoute justement `col-medecine-generale` au scope technique.
  const directlyAssignedColleges = nextColleges;
  const voieFields = voie ? { paid_voie: voie } : {};
  const specialtyFields = directlyAssignedColleges.includes('col-geriatrie')
    ? { paid_specialty: 'Gériatrie' }
    : permission_type === 'all' || directlyAssignedColleges.some(
        (college) => college === 'col-medecine-generale' || college.startsWith('col-mg-'),
      )
      ? { paid_specialty: 'Médecine générale' }
      : {};

  const permission_scope =
    permission_type === 'all'
      ? { type: 'all' as const, offer, ...offersField, ...meta, ...specialtyFields, ...voieFields }
      : {
          type: 'college' as const,
          colleges: collegesAvecBonus,
          offer,
          ...offersField,
          ...(coursAvecBonus && coursAvecBonus.length > 0 ? { cours: coursAvecBonus } : {}),
          ...meta,
          ...specialtyFields,
          ...voieFields,
        };

  const { error } = await (admin as any)
    .from('profiles')
    .update({
      first_name,
      last_name,
      phone: phone ?? null,
      permission_scope,
      ...(can_download === undefined ? {} : { can_download }),
      // Droit d'impression par spécialité (vidé si le droit global est accordé).
      ...(download_colleges === undefined ? {} : { download_colleges: can_download ? [] : download_colleges }),
      // Période d'accès : undefined = inchangé ; null = détacher / hériter de la session.
      ...(evc_session_id === undefined ? {} : { evc_session_id }),
      ...(access_end === undefined ? {} : { access_end }),
    } as never)
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
