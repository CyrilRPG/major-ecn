"""Contrôle de la page de garde d'une fiche PDF : aucun bloc de texte ne doit
en chevaucher un autre (plan sous la légende, titre trop long…).
Usage : python scripts/verifier-couverture-fiche.py <fiche.pdf> [...]
Code de sortie 1 si une couverture est défectueuse."""
import sys
import pymupdf

defauts = 0
for chemin in sys.argv[1:]:
    page = pymupdf.open(chemin)[0]
    blocs = [b for b in page.get_text("blocks") if b[4].strip()]
    chevauchements = []
    for i, a in enumerate(blocs):
        for b in blocs[i + 1:]:
            if min(a[2], b[2]) - max(a[0], b[0]) > 2 and min(a[3], b[3]) - max(a[1], b[1]) > 2:
                chevauchements.append((a[4][:40].replace("\n", " "), b[4][:40].replace("\n", " ")))
    # Titre qui empiète sur le logo (image placée à droite du titre).
    for img in page.get_image_info():
        x0, y0, x1, y1 = img["bbox"]
        if (x1 - x0) > page.rect.width * 0.5:
            continue  # filigrane pleine page
        # Mot par mot : le rectangle d'un bloc de titre déborde des glyphes réels.
        for w in page.get_text("words"):
            if min(x1, w[2]) - max(x0, w[0]) > 1 and min(y1, w[3]) - max(y0, w[1]) > 1:
                chevauchements.append((w[4], "logo"))
    # Fiche réduite à l'impression (élément trop large) : la bande sombre de la
    # couverture n'atteint plus le bas de la page.
    bandes = [d["rect"] for d in page.get_drawings() if d.get("rect") and d["rect"].x0 < 5 and d["rect"].width < 60]
    if bandes and max(r.height for r in bandes) < page.rect.height * 0.9:
        chevauchements.append(("fiche réduite à l'impression", f"bande {max(r.height for r in bandes):.0f} pt"))
    # Plan trop long : la légende serait repoussée hors de la page (rognée).
    texte = page.get_text().upper()
    if "PLAN DU COURS" in texte and "L É G E N D E" not in texte and "LÉGENDE" not in texte:
        chevauchements.append(("légende absente de la page de garde", "plan trop long ?"))
    if chevauchements:
        defauts += 1
        print(f"COUVERTURE DÉFECTUEUSE {chemin} : {chevauchements[:3]}")
    else:
        print(f"couverture ok {chemin}")
sys.exit(1 if defauts else 0)
