"""Render LOCAL d'une FicheData JSON en PDF + HTML standalone, SANS Supabase.

Sert à prévisualiser une fiche (charte, structure) avant tout upload/upsert.
Réutilise la désérialisation de `render_one_fiche.fiche_from_json`.

Usage :
  PLAYWRIGHT_CHROMIUM_EXECUTABLE=/opt/pw-browsers/chromium-1194/chrome-linux/chrome \
  python3 preview_one_fiche.py --fiche-json /tmp/.../fiche.json --out /tmp/preview.pdf
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path("/home/user/major-ecn-fiche/src").resolve()))
sys.path.insert(0, str(Path(__file__).resolve().parent))

from render_one_fiche import fiche_from_json  # noqa: E402
from major_ecn.html_standalone import render_fiche_html_standalone  # noqa: E402
from major_ecn.pdf_generator import render_pdf  # noqa: E402


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--fiche-json", required=True)
    p.add_argument("--out", default="/tmp/preview.pdf")
    args = p.parse_args()

    data = json.loads(Path(args.fiche_json).read_text(encoding="utf-8"))
    fiche = fiche_from_json(data)
    out = Path(args.out)
    render_pdf(fiche, out)
    html = render_fiche_html_standalone(fiche)
    html_path = out.with_suffix(".html")
    html_path.write_text(html, encoding="utf-8")

    import fitz
    pages = fitz.open(out).page_count
    print(f"PDF: {out} ({out.stat().st_size//1024} Ko, {pages} pages)")
    print(f"HTML standalone: {html_path} ({len(html)//1024} Ko)")


if __name__ == "__main__":
    main()
