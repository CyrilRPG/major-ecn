import assert from "node:assert/strict";
import { test } from "node:test";
import {
  lienChoixFormule,
  lienPaiement,
  PAGE_FORMULES_PAR_SPECIALITE,
} from "../src/lib/tunnel-inscription";
import {
  ENROLLABLE_SPECIALTIES,
  specialtyByName,
  voieImposeePourSpecialite,
} from "../src/lib/data/enrollable-colleges";
import {
  getApprofondiSpecialty,
  getApprofondiTier,
} from "../src/lib/stripe/approfondi";
import { purchaseScopeNotice } from "../src/lib/stripe/copy";

test("chaque page de spécialité rejoint ses propres tarifs et conserve la spécialité pour chaque formule", () => {
  for (const [specialty, route] of Object.entries(
    PAGE_FORMULES_PAR_SPECIALITE,
  )) {
    const landing = new URL(
      lienChoixFormule(specialty),
      "https://major-ecn.fr",
    );
    assert.equal(landing.pathname, route);
    assert.equal(landing.hash, "#formules");
    assert.equal(
      specialtyByName(landing.searchParams.get("specialite"))?.name,
      specialty,
    );
    for (const formula of [
      "essentielle",
      "intensive",
      "programme-approfondi",
    ]) {
      const checkout = new URL(
        lienPaiement(`/formules/${formula}`, specialty),
        landing,
      );
      assert.equal(checkout.pathname, `/formules/${formula}`);
      assert.equal(checkout.hash, "#choisir-formule");
      assert.equal(checkout.searchParams.get("specialite"), specialty);
    }
  }
});

test("le programme Approfondi retrouve la spécialité canonique et ses variantes historiques", () => {
  for (const alias of ["Psychiatrie", "psychiatrie"])
    assert.equal(getApprofondiSpecialty(alias)?.key, "psychiatrie");
  for (const alias of [
    "Radiologie",
    "Radiodiagnostic et imagerie médicale",
    "Radiologie et imagerie médicale",
  ])
    assert.equal(getApprofondiSpecialty(alias)?.tiers[0].id, "radio");
  assert.equal(
    getApprofondiSpecialty("Médecine d’urgence")?.key,
    "medecine-urgence",
  );
  assert.equal(
    getApprofondiSpecialty("Médecine interne polyvalente")?.key,
    "mipic",
  );
  assert.equal(
    getApprofondiSpecialty("Gynécologie-obstétrique")?.key,
    "gynecologie-obstetrique",
  );
  // Ne jamais présélectionner ni accorder le collège d'une autre spécialité.
  assert.equal(getApprofondiSpecialty("Cardiologie"), null);
  assert.equal(getApprofondiSpecialty("spécialité inconnue"), null);
});

test("les tarifs des nouvelles pages correspondent aux offres et les contenus absents ne débloquent pas un autre collège", () => {
  assert.equal(getApprofondiTier("psy")?.amountCents, 209500);
  assert.equal(getApprofondiTier("psy")?.targetCollege, "col-psychiatrie");
  assert.equal(getApprofondiTier("radio")?.amountCents, 229500);
  assert.equal(getApprofondiTier("radio")?.targetCollege, null);
  assert.equal(getApprofondiTier("radio")?.contentPending, true);
  assert.equal(specialtyByName("Radiologie")?.contentPending, true);
});

test("Médecine intensive et réanimation est une spécialité distincte de Médecine d’urgence", () => {
  const mir = specialtyByName("Médecine intensive et réanimation");
  assert.equal(mir?.collegeId, "col-medecine-intensive-reanimation");
  // L'ancien libellé du collège col-mir résout désormais vers MIR, plus vers
  // Médecine d'urgence.
  for (const alias of ["Médecine Intensive-Réanimation", "MIR", "medecine intensive reanimation"])
    assert.equal(specialtyByName(alias)?.collegeId, "col-medecine-intensive-reanimation");
  assert.equal(specialtyByName("Médecine d’urgence")?.collegeId, "col-mir");
  assert.equal(specialtyByName("Médecine d'urgence")?.collegeId, "col-mir");
  // Ajoutée en fin de tableau : la palette de l'agenda est indexée sur l'ordre.
  assert.equal(ENROLLABLE_SPECIALTIES.at(-1)?.collegeId, "col-medecine-intensive-reanimation");
});

test("le programme Approfondi MIR reprend les prix de Médecine d’urgence sans jamais partager son collège", () => {
  assert.equal(getApprofondiSpecialty("Médecine intensive et réanimation")?.key, "medecine-intensive-reanimation");
  assert.equal(getApprofondiSpecialty("Médecine Intensive-Réanimation")?.key, "medecine-intensive-reanimation");
  assert.equal(getApprofondiSpecialty("Médecine d’urgence")?.key, "medecine-urgence");
  assert.equal(getApprofondiTier("mir")?.amountCents, getApprofondiTier("urg")?.amountCents);
  assert.equal(getApprofondiTier("mir-plus")?.amountCents, getApprofondiTier("urg-plus")?.amountCents);
  assert.equal(getApprofondiTier("mir")?.amountCents, 209500);
  assert.equal(getApprofondiTier("mir-plus")?.amountCents, 269500);
  for (const id of ["mir", "mir-plus"]) {
    assert.equal(getApprofondiTier(id)?.targetCollege, "col-medecine-intensive-reanimation");
    assert.equal(getApprofondiTier(id)?.specialtyName, "Médecine intensive et réanimation");
  }
  assert.equal(getApprofondiTier("mir")?.envPriceId, "STRIPE_PRICE_APPRO_MIR");
  assert.equal(getApprofondiTier("mir-plus")?.envPriceId, "STRIPE_PRICE_APPRO_MIR_PLUS");
});

test("la voie interne est imposée pour MIR et la page Stripe l'annonce en QCM", () => {
  assert.equal(voieImposeePourSpecialite("Médecine intensive et réanimation"), "interne");
  assert.equal(voieImposeePourSpecialite("MIR"), "interne");
  assert.equal(voieImposeePourSpecialite(getApprofondiTier("mir")?.specialtyName), "interne");
  assert.equal(voieImposeePourSpecialite("Médecine d’urgence"), null);
  assert.equal(voieImposeePourSpecialite("Médecine générale"), null);
  // Même logique que l'API checkout : la voie imposée prime sur celle du client.
  const voie = voieImposeePourSpecialite("Médecine intensive et réanimation") ?? "externe";
  const notice = purchaseScopeNotice({
    offerLabel: "Formule Intensive",
    specialtyName: "Médecine intensive et réanimation",
    voie,
  });
  assert.match(notice, /voie interne \(QCM\)/);
  assert.doesNotMatch(notice, /externe/);
});
