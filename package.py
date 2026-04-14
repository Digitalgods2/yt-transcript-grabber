"""Bundle the publish-ready files into a zip for the Chrome Web Store.

Only ships files the extension actually needs at runtime. Dev-only files
(build scripts, store assets, docs, and any existing zips) are excluded.

Copyright (c) 2026 DigitalGods. All rights reserved.
"""
import json
import zipfile
from pathlib import Path

HERE = Path(__file__).parent
MANIFEST = HERE / "manifest.json"

INCLUDE_TOP_LEVEL = {
    "manifest.json",
    "popup.html",
    "popup.js",
    "LICENSE",
    "PRIVACY.md",
}
INCLUDE_DIRS = {"icons"}


def main() -> None:
    version = json.loads(MANIFEST.read_text(encoding="utf-8"))["version"]
    out = HERE / f"yt-transcript-grabber-v{version}.zip"

    files: list[Path] = []
    for name in sorted(INCLUDE_TOP_LEVEL):
        p = HERE / name
        if not p.exists():
            raise SystemExit(f"missing required file: {name}")
        files.append(p)
    for d in sorted(INCLUDE_DIRS):
        dir_path = HERE / d
        if not dir_path.is_dir():
            raise SystemExit(f"missing required directory: {d}")
        for p in sorted(dir_path.rglob("*")):
            if p.is_file():
                files.append(p)

    with zipfile.ZipFile(out, "w", compression=zipfile.ZIP_DEFLATED) as z:
        for p in files:
            z.write(p, arcname=p.relative_to(HERE).as_posix())

    print(f"Wrote {out.name} ({out.stat().st_size / 1024:.1f} KiB)")
    print("Contents:")
    for p in files:
        print(f"  {p.relative_to(HERE).as_posix()}")


if __name__ == "__main__":
    main()
