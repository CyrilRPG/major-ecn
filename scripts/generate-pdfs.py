#!/usr/bin/env python3
"""Génère 3 fiches PDF Biochimie pour la démo Hermione.
Utilise reportlab (pure Python, pas de dépendance native).
Usage : python scripts/generate-pdfs.py
Sortie : supabase/seed-assets/fiches/biochimie-c{1,2,3}.pdf
"""

from __future__ import annotations
import os
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, ListFlowable, ListItem,
)

PRIMARY = HexColor("#7C3AED")
PRIMARY_SOFT = HexColor("#EDE9FE")
INK = HexColor("#0F172A")
INK_SOFT = HexColor("#475569")

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "supabase", "seed-assets", "fiches")
os.makedirs(OUT_DIR, exist_ok=True)


def build_styles():
    base = getSampleStyleSheet()["BodyText"]
    body = ParagraphStyle("body", parent=base, fontName="Helvetica", fontSize=10.5, leading=15, textColor=INK)
    h1 = ParagraphStyle("h1", fontName="Helvetica-Bold", fontSize=22, leading=26, textColor=INK, spaceAfter=4)
    sub = ParagraphStyle("sub", fontName="Helvetica", fontSize=10, leading=14, textColor=INK_SOFT, spaceAfter=12)
    h2 = ParagraphStyle("h2", fontName="Helvetica-Bold", fontSize=14, leading=18, textColor=PRIMARY, spaceBefore=14, spaceAfter=6)
    callout = ParagraphStyle("callout", parent=body, backColor=PRIMARY_SOFT, borderPadding=8, borderRadius=8, leftIndent=4, rightIndent=4)
    return {"body": body, "h1": h1, "sub": sub, "h2": h2, "callout": callout}


def header_footer(canvas, doc, title: str):
    canvas.saveState()
    canvas.setFillColor(PRIMARY)
    canvas.rect(0, A4[1] - 8 * mm, A4[0], 8 * mm, fill=1, stroke=0)
    canvas.setFillColor(HexColor("#FFFFFF"))
    canvas.setFont("Helvetica-Bold", 9)
    canvas.drawString(15 * mm, A4[1] - 5.5 * mm, "HERMIONE MÉDECINE")
    canvas.drawRightString(A4[0] - 15 * mm, A4[1] - 5.5 * mm, "Fiche · Biochimie")
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(INK_SOFT)
    canvas.drawString(15 * mm, 12 * mm, title)
    canvas.drawRightString(A4[0] - 15 * mm, 12 * mm, f"Page {doc.page}")
    canvas.restoreState()


def make_pdf(path: str, title: str, sections: list[tuple[str, list[str]]], take_home: list[str]):
    doc = BaseDocTemplate(path, pagesize=A4, leftMargin=15 * mm, rightMargin=15 * mm, topMargin=22 * mm, bottomMargin=18 * mm, title=title, author="Hermione Médecine")
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="content")
    template = PageTemplate(id="main", frames=[frame], onPage=lambda c, d: header_footer(c, d, title))
    doc.addPageTemplates([template])

    s = build_styles()
    story = []
    story.append(Paragraph(title, s["h1"]))
    story.append(Paragraph("Fiche de cours — résumé pédagogique synthétique pour la révision rapide.", s["sub"]))

    for h, items in sections:
        story.append(Paragraph(h, s["h2"]))
        for it in items:
            story.append(Paragraph(it, s["body"]))
            story.append(Spacer(1, 4))

    story.append(Paragraph("À retenir absolument", s["h2"]))
    story.append(ListFlowable(
        [ListItem(Paragraph(p, s["body"]), bulletColor=PRIMARY) for p in take_home],
        bulletType="bullet", bulletFontName="Helvetica-Bold", bulletColor=PRIMARY, leftIndent=14,
    ))

    doc.build(story)
    return path


# === CONTENT ===

C1 = ("biochimie-c1.pdf", "Cours 1 — Acides aminés et structure des protéines", [
    ("Structure générale d’un acide aminé", [
        "Tout AA possède un carbone α porteur de quatre substituants : un groupement amine (-NH<sub>2</sub>), un groupement carboxyle (-COOH), un atome d’hydrogène, et une chaîne latérale R qui distingue les 20 AA.",
        "À pH physiologique, les AA existent sous forme de <b>zwitterion</b> : -NH<sub>3</sub><sup>+</sup> et -COO<sup>-</sup>, charge nette nulle.",
        "Exception : la <b>glycine</b> est non chirale (R = H) ; tous les autres AA naturels sont de configuration <b>L</b>.",
    ]),
    ("Classification des chaînes latérales", [
        "<b>Apolaires</b> : Gly, Ala, Val, Leu, Ile, Met, Pro, Phe, Trp.",
        "<b>Polaires non chargées</b> : Ser, Thr, Cys, Tyr, Asn, Gln.",
        "<b>Chargées négativement</b> (acides) : Asp, Glu (pKa COOH latéral ≈ 3,9 / 4,1).",
        "<b>Chargées positivement</b> (basiques) : Lys, Arg, His (pKa imidazole ≈ 6, AA tampon physiologique majeur).",
    ]),
    ("Liaison peptidique", [
        "Amide formée par condensation -COOH d’un AA + -NH<sub>2</sub> du suivant, libère une H<sub>2</sub>O.",
        "Plane, configuration <b>trans</b> majoritaire, caractère partiel de double liaison (C–N) — pas de rotation libre.",
    ]),
    ("Structures protéiques", [
        "<b>Primaire</b> : séquence des AA, du N-ter au C-ter.",
        "<b>Secondaire</b> : hélice α (3,6 résidus/tour, liaisons H n↔n+4) et feuillet β (parallèle ou antiparallèle, liaisons H inter-brins).",
        "<b>Tertiaire</b> : repliement 3D global ; stabilisée par interactions hydrophobes, liaisons H, ponts salins et <b>ponts disulfure</b> (Cys-Cys).",
        "<b>Quaternaire</b> : assemblage de plusieurs sous-unités (ex. Hb = α<sub>2</sub>β<sub>2</sub>).",
    ]),
    ("Modifications post-traductionnelles", [
        "Phosphorylation sur Ser/Thr/Tyr (kinases) — clé de la signalisation.",
        "Glycosylation (N- sur Asn, O- sur Ser/Thr).",
        "Ubiquitination → adressage au protéasome 26S pour dégradation.",
    ]),
], [
    "20 AA standards ; Met = codon de démarrage (AUG).",
    "Effet hydrophobe = principale force motrice du repliement.",
    "Dénaturation = perte des structures II/III/IV, séquence primaire conservée.",
])

C2 = ("biochimie-c2.pdf", "Cours 2 — Enzymes : cinétique et régulation", [
    ("Caractéristiques générales", [
        "Catalyseurs biologiques (souvent protéiques, parfois ARN = <b>ribozymes</b>).",
        "Abaissent l’énergie d’activation E<sub>a</sub> sans modifier l’équilibre thermodynamique.",
        "Haute spécificité, site actif petit relatif au volume total de l’enzyme.",
    ]),
    ("Cinétique de Michaelis-Menten", [
        "Modèle : E + S ⇌ ES → E + P.",
        "Équation : v = V<sub>max</sub> × [S] / (K<sub>m</sub> + [S]).",
        "K<sub>m</sub> = [S] tel que v = V<sub>max</sub>/2 ; faible K<sub>m</sub> = forte affinité.",
        "V<sub>max</sub> = k<sub>cat</sub> × [E]<sub>total</sub> ; k<sub>cat</sub>/K<sub>m</sub> = constante de spécificité (limite par diffusion ≈ 10<sup>8</sup> M<sup>-1</sup>·s<sup>-1</sup>).",
    ]),
    ("Inhibitions", [
        "<b>Compétitive</b> : se lie au site actif, K<sub>m</sub> ↑, V<sub>max</sub> inchangée, surmontable par [S]. Ex. malonate / succinate déshydrogénase.",
        "<b>Non compétitive</b> : site distinct, V<sub>max</sub> ↓, K<sub>m</sub> inchangé, non surmontable.",
        "<b>Incompétitive (uncompétitive)</b> : se lie au complexe ES uniquement, V<sub>max</sub> ↓ et K<sub>m</sub> ↓.",
        "<b>Irréversible</b> : modification covalente (ex. aspirine sur COX, DFP sur sérine-protéases).",
    ]),
    ("Régulations", [
        "<b>Allostérie</b> : courbe sigmoïdale, modèle MWC (R↔T concerté) ou KNF (séquentiel).",
        "<b>Phosphorylation/déphosphorylation</b> (kinases/phosphatases) — modification covalente réversible rapide.",
        "<b>Zymogènes</b> : activation par clivage protéolytique (trypsinogène → trypsine).",
        "<b>Feedback négatif</b> : produit final inhibe l’enzyme du carrefour (ex. CTP → ATCase).",
    ]),
    ("Cofacteurs et coenzymes", [
        "Ions métalliques (Mg<sup>2+</sup>, Zn<sup>2+</sup>, Fe<sup>2+</sup>...).",
        "Coenzymes organiques : NAD<sup>+</sup>/NADH, FAD/FADH<sub>2</sub>, NADP<sup>+</sup>/NADPH, CoA, PLP (vit B6).",
        "Holoenzyme = apoenzyme + cofacteur.",
    ]),
], [
    "Lineweaver-Burk : 1/v vs 1/[S], droites discriminent les types d’inhibition.",
    "Triade catalytique sérine-protéases : Ser-His-Asp.",
    "Statines, méthotrexate, aspirine, allopurinol = exemples d’inhibiteurs médicamenteux.",
])

C3 = ("biochimie-c3.pdf", "Cours 3 — Le métabolisme glucidique", [
    ("Glycolyse", [
        "Voie cytosolique : glucose → 2 pyruvates.",
        "Bilan net : +2 ATP, +2 NADH par molécule de glucose.",
        "Trois étapes irréversibles : hexokinase / glucokinase (1), PFK-1 (3), pyruvate kinase (10).",
        "Anaérobie : pyruvate → lactate (LDH, régénère NAD<sup>+</sup>).",
    ]),
    ("Régulation de la glycolyse", [
        "PFK-1 : activée par AMP et F-2,6-BP, inhibée par ATP et citrate (= étape clé).",
        "Hexokinase inhibée par G6P ; glucokinase (K<sub>m</sub> élevé, foie/pancréas) = <b>glucose sensor</b> non inhibée par G6P.",
        "Insuline (post-prandial) ↑ glycolyse ; glucagon (jeûne) ↓ glycolyse, ↑ néoglucogenèse.",
    ]),
    ("Néoglucogenèse", [
        "Synthèse de glucose à partir de précurseurs non glucidiques : lactate (Cori), glycérol, AA glucoformateurs.",
        "Contourne 3 étapes irréversibles via 4 enzymes spécifiques : pyruvate carboxylase, PEPCK, F-1,6-BPase, G6Pase.",
        "Coût : 4 ATP + 2 GTP pour 1 glucose synthétisé.",
        "Foie et cortex rénal ; impossible dans le muscle (pas de G6Pase).",
    ]),
    ("Glycogène", [
        "Polymère ramifié de glucose, liaisons α-1,4 (synthase) et α-1,6 aux branches (enzyme branchante).",
        "Stockage : foie (régulation glycémique) et muscle (énergie locale).",
        "Glycogène phosphorylase (active phosphorylée) ↔ glycogène synthase (active déphosphorylée).",
    ]),
    ("Voie des pentoses phosphates", [
        "Cytosolique, deux phases : oxydative (NADPH × 2, G6PD = enzyme régulatrice) et non oxydative (ribose-5-P pour les nucléotides).",
        "NADPH = pouvoir réducteur des biosynthèses (acides gras, cholestérol) et défense antioxydante (glutathion).",
    ]),
    ("Régulation hormonale et pathologies", [
        "Insuline (anabolique) vs glucagon (catabolique) : antagonistes pour la glycémie.",
        "Diabète type 1 : auto-immun, carence absolue → insulinothérapie.",
        "Diabète type 2 : insulinorésistance + déficit relatif → metformine.",
        "Déficit en G6PD : récessif lié à l’X, anémie hémolytique aux oxydants (favisme).",
        "Glycogénose type I (Von Gierke) : déficit en G6Pase → hypoglycémies sévères.",
    ]),
], [
    "Glycémie à jeun normale : 0,7–1,1 g/L (3,9–6,1 mmol/L).",
    "1 glucose en aérobie complet → ≈ 30–32 ATP.",
    "Cerveau : ≈ 120 g de glucose/jour ; globules rouges = strict glycolytique.",
])


def main():
    for fname, title, sections, takeaway in (C1, C2, C3):
        out = os.path.join(OUT_DIR, fname)
        make_pdf(out, title, sections, takeaway)
        print(f"✔ {out}")


if __name__ == "__main__":
    main()
