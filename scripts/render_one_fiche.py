"""Render d'une `FicheData` JSON en HTML standalone + PDF + push Supabase.

Ce script remplace l'appel à l'API Anthropic dans le pipeline major-ecn-fiche
par une étape MANUELLE : le JSON `FicheData` est fourni en entrée (produit
par un sub-agent Claude Code qui tourne sur l'abonnement Claude Max de
l'utilisateur, sans frais d'API).

Usage :
  python3 render_one_fiche.py \\
      --fiche-json /tmp/fiches_json/HTA.json \\
      --cours-id 4f64f867-3860-4eee-9803-4fe45ab87d06 \\
      --cours-titre "Hypertension artérielle de l'adulte et de l'enfant"

Variables d'env :
  SUPABASE_URL                 https://mrrgfnirpwsknuyiwcqy.supabase.co
  SUPABASE_SERVICE_ROLE_KEY    JWT service_role
  PLAYWRIGHT_BROWSERS_PATH     /opt/pw-browsers  (déjà set dans la sandbox)
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
import urllib.parse
import urllib.request
from dataclasses import asdict
from pathlib import Path
from urllib.error import HTTPError

# Greffe le générateur Python sur le path
sys.path.insert(0, str(Path("/home/user/major-ecn-fiche/src").resolve()))

from major_ecn.html_standalone import render_fiche_html_standalone  # noqa: E402
from major_ecn.models import (  # noqa: E402
    AnalyzedImage, ExtractedImage, FicheData, FicheRow, Partie, PlanPartie,
    PlanSousPartie, SousPartie, TableauSynthese,
)
from major_ecn.pdf_generator import render_pdf  # noqa: E402

os.environ.setdefault("PLAYWRIGHT_BROWSERS_PATH", "/opt/pw-browsers")

SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")


def fiche_from_json(data: dict) -> FicheData:
    """Désérialise un dict JSON en FicheData avec dataclasses imbriquées.

    Le JSON attendu suit la structure de FicheData (matiere, nom_cours, plan,
    parties, tableaux, chiffres_cles, points_cles, fiche_eclair_md). Les
    images sont optionnelles (legacy : pas d'images si pas de vision).
    """
    def _plan_partie(d: dict) -> PlanPartie:
        return PlanPartie(
            numero=d.get("numero", ""),
            titre=d.get("titre", ""),
            resume=d.get("resume", ""),
            sous_parties=[
                PlanSousPartie(
                    lettre=sp.get("lettre", ""),
                    titre=sp.get("titre", ""),
                    resume=sp.get("resume", ""),
                )
                for sp in d.get("sous_parties", [])
            ],
        )

    def _ficherow(r: dict) -> FicheRow:
        return FicheRow(
            concept=r.get("concept", ""),
            detail_md=r.get("detail_md", ""),
            kind=r.get("kind", "normal"),
        )

    def _analyzed_image(d: dict) -> AnalyzedImage:
        # Sans pipeline vision, on construit un AnalyzedImage minimal
        # (les images viennent du PDF source seulement si on en a déjà
        # extrait — sinon liste vide).
        return AnalyzedImage(
            source=ExtractedImage(
                data=b"", ext="png", page=0, index=0,
                width=int(d.get("width", 0)),
                height=int(d.get("height", 0)),
                sha=str(d.get("sha", "")),
            ),
            description=d.get("description", ""),
            concept_lie=d.get("concept_lie", ""),
            pertinence=int(d.get("pertinence", 0)),
            type=d.get("type", "autre"),
            section_suggeree=d.get("section_suggeree", ""),
            saved_path=Path(d["saved_path"]) if d.get("saved_path") else None,
            figure_number=int(d.get("figure_number", 0)),
        )

    def _sous_partie(sp: dict) -> SousPartie:
        return SousPartie(
            lettre=sp.get("lettre", ""),
            titre=sp.get("titre", ""),
            rows=[_ficherow(r) for r in sp.get("rows", [])],
            images=[_analyzed_image(img) for img in sp.get("images", [])],
        )

    def _partie(p: dict) -> Partie:
        return Partie(
            numero=p.get("numero", ""),
            titre=p.get("titre", ""),
            sous_parties=[_sous_partie(sp) for sp in p.get("sous_parties", [])],
        )

    def _tableau(t: dict) -> TableauSynthese:
        return TableauSynthese(titre=t.get("titre", ""), markdown=t.get("markdown", ""))

    cc = data.get("chiffres_cles")
    return FicheData(
        matiere=data.get("matiere", "Cardiologie"),
        nom_cours=data.get("nom_cours", ""),
        annee=data.get("annee", "2025-2026"),
        item=data.get("item", ""),
        plan=[_plan_partie(p) for p in data.get("plan", [])],
        parties=[_partie(p) for p in data.get("parties", [])],
        tableaux=[_tableau(t) for t in data.get("tableaux", [])],
        chiffres_cles=_tableau(cc) if cc else None,
        points_cles=list(data.get("points_cles", [])),
        fiche_eclair_md=data.get("fiche_eclair_md", ""),
        fiche_numero=data.get("fiche_numero", ""),
    )


def _req(method: str, url: str, *, headers: dict | None = None,
         body: bytes | None = None, timeout: float = 120.0) -> tuple[int, bytes]:
    h = {"Authorization": f"Bearer {SERVICE_KEY}", "apikey": SERVICE_KEY}
    if headers:
        h.update(headers)
    req = urllib.request.Request(url=url, data=body, headers=h, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:  # noqa: S310
            return resp.status, resp.read()
    except HTTPError as e:
        return e.code, e.read() if e.fp else b""


def download_pdf(storage_path: str, dest: Path) -> None:
    """Télécharge un PDF du bucket privé `fiches` (service role bypass RLS)."""
    encoded = urllib.parse.quote(storage_path, safe="/")
    url = f"{SUPABASE_URL}/storage/v1/object/fiches/{encoded}"
    status, body = _req("GET", url)
    if status >= 400:
        raise RuntimeError(f"Download échec ({status}) : {body[:200].decode('utf-8', 'replace')}")
    dest.write_bytes(body)


def upload_pdf(local_pdf: Path, storage_path: str) -> None:
    """Upload (upsert) un PDF dans le bucket `fiches`."""
    encoded = urllib.parse.quote(storage_path, safe="/")
    url = f"{SUPABASE_URL}/storage/v1/object/fiches/{encoded}"
    headers = {"Content-Type": "application/pdf", "x-upsert": "true"}
    status, body = _req("POST", url, headers=headers, body=local_pdf.read_bytes())
    if status >= 400:
        raise RuntimeError(f"Upload échec ({status}) : {body[:200].decode('utf-8', 'replace')}")


def upsert_fiche_row(cours_id: str, *, titre: str, content_html: str,
                     storage_path: str, pages: int) -> None:
    """Upsert la ligne `fiches` (clé unique cours_id)."""
    url = f"{SUPABASE_URL}/rest/v1/fiches?on_conflict=cours_id"
    headers = {
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal",
    }
    payload = {
        "cours_id": cours_id, "titre": titre, "content_html": content_html,
        "content_format": "html", "storage_path": storage_path, "pages": pages,
    }
    body_bytes = json.dumps(payload).encode("utf-8")
    delay = 2.0
    for attempt in range(5):
        status, body = _req("POST", url, headers=headers, body=body_bytes, timeout=180.0)
        if status < 400:
            return
        # 5xx / statement timeout (57014) : transitoire → retry
        if status >= 500 or b"57014" in body:
            if attempt < 4:
                time.sleep(delay)
                delay *= 2
                continue
        raise RuntimeError(f"Upsert échec ({status}) : {body[:300].decode('utf-8', 'replace')}")


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--fiche-json", required=True, help="Chemin du JSON FicheData (produit par sub-agent)")
    p.add_argument("--cours-id", required=True, help="UUID du cours en base")
    p.add_argument("--cours-titre", required=True, help="Titre humain du cours")
    p.add_argument("--work-dir", default="/tmp/regen_work", help="Dossier temporaire")
    args = p.parse_args()

    if not SUPABASE_URL or not SERVICE_KEY:
        sys.exit("ERROR: SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis en env.")

    work = Path(args.work_dir) / args.cours_id
    work.mkdir(parents=True, exist_ok=True)
    out_pdf = work / "fiche.pdf"

    # 1. Charge la FicheData depuis le JSON
    data = json.loads(Path(args.fiche_json).read_text(encoding="utf-8"))
    fiche = fiche_from_json(data)

    started = time.monotonic()
    print(f"▶ {args.cours_titre[:80]}", flush=True)

    # 2. Render PDF Chromium
    print("  ⇣ render PDF via Chromium", flush=True)
    render_pdf(fiche, out_pdf)

    # 3. Render HTML standalone
    print("  ⇣ render HTML standalone (fonts inlinées)", flush=True)
    html_content = render_fiche_html_standalone(fiche)

    # 4. Upload nouveau PDF + upsert ligne
    new_storage_path = f"{args.cours_id}/regen-{int(time.time())}.pdf"
    print(f"  ⇡ upload PDF → {new_storage_path}", flush=True)
    upload_pdf(out_pdf, new_storage_path)

    # 5. Compte les pages
    pages = 0
    try:
        import fitz  # type: ignore
        with fitz.open(out_pdf) as doc:
            pages = doc.page_count
    except Exception:
        pass

    print(f"  ⇡ upsert fiche row (pages={pages})", flush=True)
    upsert_fiche_row(
        args.cours_id,
        titre=fiche.nom_cours or args.cours_titre,
        content_html=html_content,
        storage_path=new_storage_path,
        pages=pages,
    )

    dur = time.monotonic() - started
    print(f"  ✓ done — {pages} pages · {dur:.1f}s · HTML {len(html_content)//1024} Ko", flush=True)


if __name__ == "__main__":
    main()
