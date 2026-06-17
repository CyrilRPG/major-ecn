#!/usr/bin/env python3
"""Régénération des 22 fiches cardio depuis les PDF sources Supabase Storage.

Flow par fiche :
  1. Télécharge le PDF source depuis Supabase Storage (signed URL via REST).
  2. Le sauve dans un dossier temporaire au bon nom.
  3. Passe au pipeline `major-ecn-fiche` (extract → IA → render HTML standalone).
  4. Upload le nouveau PDF rendu dans Storage.
  5. Upsert `fiches.content_html` + `storage_path` + `pages` + `titre`.

Variables d'env requises :
  ANTHROPIC_API_KEY            (pour le pipeline IA)
  SUPABASE_URL                 (https://mrrgfnirpwsknuyiwcqy.supabase.co)
  SUPABASE_SERVICE_ROLE_KEY    (pour télécharger + upserter sans RLS)

Usage : python3 regen_cardio.py
"""
from __future__ import annotations

import asyncio
import json
import os
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path
from urllib.error import HTTPError

# On greffe le générateur Python sur le path
sys.path.insert(0, str(Path("/home/user/major-ecn-fiche/src").resolve()))

from anthropic import AsyncAnthropic  # noqa: E402
from major_ecn.config import LOGO_PATH, Settings  # noqa: E402
from major_ecn.content_builder import build_fiche, output_basename  # noqa: E402
from major_ecn.html_standalone import render_fiche_html_standalone  # noqa: E402
from major_ecn.pdf_extractor import extract_document  # noqa: E402
from major_ecn.pdf_generator import render_pdf  # noqa: E402

# Pour playwright on pointe vers le binaire pre-installed du container
os.environ.setdefault("PLAYWRIGHT_BROWSERS_PATH", "/opt/pw-browsers")

SUPABASE_URL = os.environ["SUPABASE_URL"].rstrip("/")
SERVICE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
ANTHROPIC_KEY = os.environ["ANTHROPIC_API_KEY"]

# Liste hardcodée des 22 cours cardio (cours_id, titre, storage_path source).
# Récupérée à l'instant via SQL — on évite de re-requêter à chaque run pour
# que le script soit reproductible et offline si besoin.
CARDIO_COURS: list[tuple[str, str, str]] = [
    # Sera injecté juste après par le script principal.
]


def _req(method: str, url: str, *, headers: dict[str, str] | None = None,
         body: bytes | None = None, timeout: float = 90.0) -> tuple[int, bytes]:
    h = {"Authorization": f"Bearer {SERVICE_KEY}", "apikey": SERVICE_KEY}
    if headers:
        h.update(headers)
    req = urllib.request.Request(url=url, data=body, headers=h, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:  # noqa: S310
            return resp.status, resp.read()
    except HTTPError as e:
        return e.code, e.read() if e.fp else b""


def download_source_pdf(storage_path: str, dest: Path) -> None:
    """Télécharge un PDF du bucket privé `fiches` via la REST Storage API."""
    encoded = urllib.parse.quote(storage_path, safe="/")
    url = f"{SUPABASE_URL}/storage/v1/object/fiches/{encoded}"
    status, body = _req("GET", url)
    if status >= 400:
        raise RuntimeError(f"Téléchargement échec ({status}) pour {storage_path} :"
                           f" {body[:200].decode('utf-8', 'replace')}")
    dest.write_bytes(body)


def upload_pdf(local_pdf: Path, storage_path: str) -> None:
    """Upload (upsert) un PDF dans le bucket `fiches` à un storage_path donné."""
    encoded = urllib.parse.quote(storage_path, safe="/")
    url = f"{SUPABASE_URL}/storage/v1/object/fiches/{encoded}"
    headers = {"Content-Type": "application/pdf", "x-upsert": "true"}
    status, body = _req("POST", url, headers=headers, body=local_pdf.read_bytes())
    if status >= 400:
        raise RuntimeError(f"Upload échec ({status}) pour {storage_path} :"
                           f" {body[:200].decode('utf-8', 'replace')}")


def upsert_fiche_row(cours_id: str, *, titre: str, content_html: str,
                     storage_path: str, pages: int) -> None:
    """Upsert la ligne `fiches` (clé unique cours_id) via PostgREST."""
    url = f"{SUPABASE_URL}/rest/v1/fiches?on_conflict=cours_id"
    headers = {
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal",
    }
    payload = {
        "cours_id": cours_id,
        "titre": titre,
        "content_html": content_html,
        "content_format": "html",
        "storage_path": storage_path,
        "pages": pages,
    }
    status, body = _req("POST", url, headers=headers,
                        body=json.dumps(payload).encode("utf-8"))
    if status >= 400:
        raise RuntimeError(f"Upsert échec ({status}) : "
                           f"{body[:300].decode('utf-8', 'replace')}")


async def process_one(cours_id: str, cours_titre: str, source_storage_path: str,
                      *, client: AsyncAnthropic, settings: Settings,
                      work_root: Path) -> dict:
    """Traite UNE fiche cardio. Retourne un dict de stats."""
    started = time.monotonic()
    work_dir = work_root / cours_id
    work_dir.mkdir(parents=True, exist_ok=True)
    src_pdf = work_dir / "source.pdf"
    out_pdf = work_dir / "fiche.pdf"

    print(f"\n▶ {cours_titre[:80]}", flush=True)

    # 1. Téléchargement du PDF source
    print("  ⇣ download source", flush=True)
    download_source_pdf(source_storage_path, src_pdf)

    # 2. Extraction
    print("  ⇣ extract text & images", flush=True)
    loop = asyncio.get_running_loop()
    extracted = await loop.run_in_executor(None, extract_document, src_pdf)

    # 3. Pipeline IA
    print("  ⇣ AI : plan → corps → synthèse → éclair", flush=True)
    fiche = await build_fiche(
        extracted,
        matiere="Cardiologie",
        fallback_nom_cours=src_pdf.stem,
        client=client,
        settings=settings,
        work_dir=work_dir,
    )

    # 4. Rendu PDF
    print("  ⇣ render PDF via Chromium", flush=True)
    await loop.run_in_executor(None, render_pdf, fiche, out_pdf)

    # 5. Rendu HTML standalone
    print("  ⇣ render HTML standalone", flush=True)
    html_content = render_fiche_html_standalone(fiche)

    # 6. Upload nouveau PDF + upsert ligne fiche
    print("  ⇡ upload new PDF + upsert row", flush=True)
    new_storage_path = f"{cours_id}/regen-{int(time.time())}.pdf"
    upload_pdf(out_pdf, new_storage_path)

    pages = 0
    try:
        import fitz  # type: ignore
        with fitz.open(out_pdf) as doc:
            pages = doc.page_count
    except Exception:
        pass

    upsert_fiche_row(
        cours_id,
        titre=fiche.nom_cours or cours_titre,
        content_html=html_content,
        storage_path=new_storage_path,
        pages=pages,
    )

    duration = time.monotonic() - started
    cost = fiche.usage.cost_usd
    print(f"  ✓ {cours_titre[:60]} — {pages} p · {duration:.1f}s · ~${cost:.3f}",
          flush=True)
    return {
        "cours_id": cours_id, "titre": cours_titre,
        "pages": pages, "duration": duration, "cost_usd": cost,
        "storage_path": new_storage_path,
    }


async def main():
    settings = Settings.load()
    settings.anthropic_api_key = ANTHROPIC_KEY
    settings.year = "2025-2026"
    settings.concurrency = 4

    work_root = Path("/tmp/regen_cardio_work")
    work_root.mkdir(parents=True, exist_ok=True)

    client = AsyncAnthropic(api_key=ANTHROPIC_KEY)
    semaphore = asyncio.Semaphore(settings.concurrency)

    async def _bounded(cours_id, titre, sp):
        async with semaphore:
            try:
                return await process_one(
                    cours_id, titre, sp,
                    client=client, settings=settings, work_root=work_root,
                )
            except Exception as e:
                print(f"  ✗ {titre[:60]} — ÉCHEC : {e}", flush=True)
                return {"cours_id": cours_id, "titre": titre, "error": str(e)}

    try:
        results = await asyncio.gather(*[
            _bounded(cid, t, sp) for (cid, t, sp) in CARDIO_COURS
        ])
    finally:
        await client.close()

    # Récap
    print("\n" + "=" * 60)
    ok = [r for r in results if "error" not in r]
    ko = [r for r in results if "error" in r]
    total_cost = sum(r.get("cost_usd", 0.0) for r in ok)
    print(f"Fiches régénérées : {len(ok)}/{len(results)}")
    print(f"Coût total IA     : ~${total_cost:.2f}")
    print(f"Échecs            : {len(ko)}")
    for r in ko:
        print(f"  ✗ {r['titre'][:60]} — {r['error'][:120]}")


if __name__ == "__main__":
    asyncio.run(main())
