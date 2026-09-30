"""
Produit public/homepage/hero-plateforme-base.png à partir de la capture
public/homepage/hero-plateforme.png (1504×914, PNG détouré ordinateur + tablette).

POURQUOI. La capture figeait « J-146 », la période d'inscription et les postes
de la carte « Médecine Générale — EVC Session 2026 » du tableau de bord : une
information datée, fausse dès le lendemain de la prise de vue. On efface ici,
proprement, tout ce qui dépend du calendrier :
  1. dans la carte de droite : le titre (spécialité + session), l'encart rose
     du compte à rebours, la période d'inscription et les deux cases de
     postes — l'icône et le filet rouge, invariants, sont conservés ;
  2. toute la seconde carte « EVC (PAE) 2026 » (second J-146), remplacée par
     le fond du tableau de bord, SANS toucher à la tablette qui la chevauche.
La page d'accueil superpose ensuite un bloc HTML vivant (hero-capture-carte.tsx)
qui redessine la carte à partir de la table `evc_calendrier`.

Fonds reconstruits par interpolation ligne à ligne entre deux colonnes de
référence situées de part et d'autre de la zone (le fond du tableau de bord
et l'intérieur des cartes ont un léger dégradé : un aplat se verrait).
Le liseré de la tablette est recomposé par « matting » en luminance : chaque
pixel du liseré garde son assombrissement relatif, appliqué au nouveau fond.

Usage : python scripts/nettoyer-hero-plateforme.py   (Pillow requis)
Idempotent : relit toujours la capture d'origine, qui n'est jamais modifiée.
"""

from pathlib import Path
from PIL import Image

RACINE = Path(__file__).resolve().parent.parent
SOURCE = RACINE / "public" / "homepage" / "hero-plateforme.png"
CIBLE = RACINE / "public" / "homepage" / "hero-plateforme-base.png"

im = Image.open(SOURCE).convert("RGBA")
src = im.copy().load()
px = im.load()


def interp(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3)) + (255,)


def ref(x, y, y_max=None):
    """Couleur de référence lissée (fenêtre 3 × 9) : une colonne brute porte le
    grain de la capture, et l'interpoler tel quel dessinerait des stries. Les
    lignes au-delà de y_max (sous le bord de la tablette) sont ignorées."""
    tot, n = [0, 0, 0], 0
    for dy in range(-4, 5):
        yy = y + dy
        if y_max is not None and yy > y_max:
            continue
        for dx in (-1, 0, 1):
            c = src[x + dx, yy]
            for i in range(3):
                tot[i] += c[i]
            n += 1
    if n == 0:
        return ref(x, y_max, y_max)
    return tuple(round(v / n) for v in tot) + (255,)


def remplir_rect(x0, x1, y0, y1, ref_g, ref_d):
    """Remplit [x0, x1] × [y0, y1] par interpolation, ligne à ligne, entre les
    colonnes de référence ref_g et ref_d (lues dans la capture d'origine)."""
    for y in range(y0, y1 + 1):
        g, d = ref(ref_g, y), ref(ref_d, y)
        for x in range(x0, x1 + 1):
            px[x, y] = interp(g, d, (x - ref_g) / (ref_d - ref_g))


# ── 1. Carte « Médecine Générale » : intérieur blanc de la carte ──────────
# Carte : x 968 → 1186, y 89 → 397. Colonnes 976 et 1180 = intérieur blanc,
# sans contenu (l'encart rose et les cases de postes vont de 983 à 1172).
remplir_rect(1019, 1181, 97, 143, 976, 1182)   # titre + « EVC – Session 2026 »
remplir_rect(977, 1181, 153, 392, 976, 1182)   # encart, inscription, postes

# ── 2. Seconde carte « EVC (PAE) 2026 » ───────────────────────────────────
# Fond du tableau de bord : colonnes 959 (à gauche de la carte) et 1190
# (entre la carte et le bord de l'écran). La carte commence en y = 410 ; son
# ombre portée remonte jusqu'à ~404, sous l'ombre de la première carte : on
# fond progressivement de l'original vers le fond reconstruit sur 404 → 411.
X0, X1, REF_G, REF_D = 961, 1188, 959, 1190
Y_DEBUT, Y_PLEIN = 404, 411
BANDE = 4  # épaisseur du liseré clair qui borde le haut de la tablette

def bord_tablette(x):
    return next(y for y in range(440, 560) if max(src[x, y][:3]) < 70)


# Colonnes de référence : elles croisent elles aussi la tablette (plus haut à
# droite qu'à gauche) ; sous leur propre liseré, on prolonge leur dernier fond.
MAX_G = bord_tablette(REF_G) - BANDE - 2
MAX_D = bord_tablette(REF_D) - BANDE - 2

for x in range(X0, X1 + 1):
    # Bord supérieur de la tablette : premier pixel quasi noir sous le titre
    # de la carte (le titre, bleu nuit, s'arrête avant y = 440).
    y_bord = bord_tablette(x)
    y_liseré = y_bord - BANDE
    t = (x - REF_G) / (REF_D - REF_G)
    for y in range(Y_DEBUT, y_bord):
        fond = interp(ref(REF_G, y, MAX_G), ref(REF_D, y, MAX_D), t)
        if y < Y_PLEIN:
            a = (y - Y_DEBUT + 1) / (Y_PLEIN - Y_DEBUT + 1)
            px[x, y] = interp(src[x, y], fond, a)
        elif y < y_liseré:
            px[x, y] = fond
        else:
            # Liseré : même assombrissement relatif, sur le nouveau fond. Il se
            # mesure sur le canal ROUGE : le fond, le blanc de la carte, le rose
            # de l'encart, son pictogramme et même le chiffre rouge ont tous un
            # rouge entre 240 et 255, alors que le liseré est gris neutre — le
            # rapport ne dépend donc pas de ce que la tablette recouvrait.
            ratio = min(1.0, src[x, y][0] / max(1.0, src[x, y_liseré - 3][0]))
            px[x, y] = tuple(round(c * ratio) for c in fond[:3]) + (src[x, y][3],)

im.save(CIBLE, optimize=True)
print(f"écrit : {CIBLE.relative_to(RACINE)} ({im.width}×{im.height})")
