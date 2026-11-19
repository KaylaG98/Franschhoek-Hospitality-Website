#!/usr/bin/env python3
"""Make the Wix copy of the site in _wix/ (run build.py first).

The live site is hosted on Wix. Wix limits how much a site can store, so photos,
videos and PDFs live in the Wix Media Manager instead (see wix-media.json). This
script copies the built pages, swaps every local image/video/PDF link for its Wix
copy, and stops if a file has no Wix copy yet.

  python3 wix_build.py            # writes _wix/
  python3 wix_build.py --changed  # also lists files that differ from the last run
"""
import json, os, re, shutil, sys, hashlib

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, "_wix")
MEDIA = json.load(open(os.path.join(ROOT, "wix-media.json")))["files"]
SITE = "https://www.franschhoekhospitalityacademy.co.za/"
TEXT = (".html", ".css", ".js", ".json", ".xml", ".txt")

# Matches images/..., video/..., docs/... with any ../ prefix or the full site address.
REF = re.compile(r'(?:' + re.escape(SITE) + r'|(?:\.\./)+|/)?((?:images|video|docs)/[A-Za-z0-9_./-]+\.[A-Za-z0-9]+)')


def files_to_copy():
    for name in sorted(os.listdir(ROOT)):
        p = os.path.join(ROOT, name)
        if os.path.isfile(p) and name.endswith(TEXT) and name not in ("wix-media.json",):
            yield name
    for d in ("css", "js", "diary"):
        for dp, _, fs in os.walk(os.path.join(ROOT, d)):
            for f in sorted(fs):
                rel = os.path.relpath(os.path.join(dp, f), ROOT)
                if f.endswith(TEXT):
                    yield rel


def main():
    old = {}
    if os.path.isdir(OUT):
        for dp, _, fs in os.walk(OUT):
            for f in fs:
                p = os.path.join(dp, f)
                old[os.path.relpath(p, OUT)] = hashlib.md5(open(p, "rb").read()).hexdigest()
        shutil.rmtree(OUT)
    missing = set()
    new = {}
    for rel in files_to_copy():
        src = open(os.path.join(ROOT, rel), encoding="utf-8").read()

        def swap(m):
            path = m.group(1)
            if path in MEDIA:
                return MEDIA[path]
            if path.startswith(("video/mp4", "video/webm")):  # a type="video/mp4" attribute, not a file
                return m.group(0)
            missing.add(f"{path}  (used in {rel})")
            return m.group(0)

        out = src if rel.endswith((".xml", ".txt")) else REF.sub(swap, src)
        dst = os.path.join(OUT, rel)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        open(dst, "w", encoding="utf-8").write(out)
        new[rel] = hashlib.md5(out.encode()).hexdigest()
    if missing:
        print("These files have no Wix copy yet. Upload them to Wix Media and add them to wix-media.json:")
        for m in sorted(missing):
            print("  ", m)
        sys.exit(1)
    print(f"Wrote {len(new)} files to _wix/")
    if "--changed" in sys.argv and old:
        changed = [r for r in new if old.get(r) != new[r]]
        gone = [r for r in old if r not in new]
        print("Changed:", " ".join(changed) or "none")
        print("Removed:", " ".join(gone) or "none")


if __name__ == "__main__":
    main()
