"""Rendu + push par lot des fiches cardio dont le JSON FicheData existe.

Lit /tmp/cardio_manifest.json, et pour chaque entrée dont le fichier JSON
existe et parse, lance render_one_fiche.py (rendu Chromium + upload PDF +
upsert content_html). Idempotent : on peut relancer (réécrit la fiche).
Affiche un récapitulatif final.
"""
from __future__ import annotations
import json, os, subprocess, sys
from pathlib import Path

ROOT = Path("/home/user/major-ecn")
MANIFEST = json.load(open("/tmp/cardio_manifest.json", encoding="utf-8"))
env = dict(os.environ)
env["PLAYWRIGHT_BROWSERS_PATH"] = "/opt/pw-browsers"
env["PLAYWRIGHT_CHROMIUM_EXECUTABLE"] = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"

only = set(sys.argv[1:])  # optionnel : restreindre à des "order" donnés
ok, skipped, failed = [], [], []
for e in MANIFEST:
    if only and str(e["order"]) not in only:
        continue
    jp = Path(e["json"])
    label = f'{e["order"]:02d} item {e["item"]} · {e["titre"][:48]}'
    if not jp.exists():
        skipped.append((label, "JSON manquant")); print(f"⏭  {label} — JSON manquant"); continue
    try:
        json.load(open(jp, encoding="utf-8"))
    except Exception as ex:
        failed.append((label, f"JSON invalide: {ex}")); print(f"✗  {label} — JSON invalide: {ex}"); continue
    print(f"▶  {label}")
    r = subprocess.run(
        [sys.executable, str(ROOT / "scripts/render_one_fiche.py"),
         "--fiche-json", str(jp), "--cours-id", e["cours_id"], "--cours-titre", e["titre"]],
        env=env, capture_output=True, text=True,
    )
    tail = (r.stdout or "").strip().splitlines()[-1:] or [(r.stderr or "").strip().splitlines()[-1:] or [""]][0]
    if r.returncode == 0:
        ok.append(label); print("   " + (tail[0] if tail else "done"))
    else:
        failed.append((label, (r.stderr or "")[-400:])); print(f"   ✗ ÉCHEC\n{(r.stderr or '')[-600:]}")

print("\n========== RÉCAP ==========")
print(f"OK     : {len(ok)}")
print(f"SKIP   : {len(skipped)}  {[s[0][:18] for s in skipped]}")
print(f"FAILED : {len(failed)}")
for lbl, why in failed:
    print(f"  ✗ {lbl} :: {why[:160]}")
