import assert from "node:assert/strict";
import { test } from "node:test";
import {
  lienChoixFormule,
  lienPaiement,
  PAGE_FORMULES_PAR_SPECIALITE,
} from "../src/lib/tunnel-inscription";
import { specialtyByName } from "../src/lib/data/enrollable-colleges";
import {
  getApprofondiSpecialty,
  getApprofondiTier,
} from "../src/lib/stripe/approfondi";

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
