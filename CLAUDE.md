# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Chrome Manifest V3 extension (pure JS, no build step) that extracts the transcript from the active YouTube watch page and copies/downloads it as text. Ships as a Chrome Web Store listing — see `PUBLISHING.md`.

## Commands

- **Load unpacked for dev**: `chrome://extensions` → Developer mode on → Load unpacked → pick this folder. Click **Reload** on the extension card after editing `popup.js` / `popup.html` / `manifest.json`.
- **Regenerate icons** (requires Pillow): `python build_icons.py` — rebuilds `icons/icon{16,32,48,128}.png` and `store/` assets from code.
- **Build store zip**: `python package.py` — writes `yt-transcript-grabber-v<version>.zip` using `manifest.json`'s version. Only ships runtime files (`manifest.json`, `popup.html`, `popup.js`, `icons/`, `LICENSE`, `PRIVACY.md`); dev-only files are excluded by the allowlist in `package.py`.
- **Ship an update**: bump `"version"` in `manifest.json`, re-run `package.py`, upload via Chrome Web Store Dev Console (details in `PUBLISHING.md`). Versions cannot be reused or decreased.

No test suite, no linter, no bundler. The entire runtime is `popup.html` + `popup.js` + `manifest.json` + `icons/`.

## Architecture

Two execution contexts that must not be confused:

1. **Popup context** (`popup.js` top level) — runs in the extension popup. Has access to `chrome.*` APIs (`tabs`, `scripting`, `downloads`, `clipboard`). Handles UI, tab detection, clipboard write, file download.
2. **Page context** (the `pageScrape` function) — injected into the YouTube tab via `chrome.scripting.executeScript({ func: pageScrape, args: [...] })`. **Must be self-contained** — no closures over popup-scope variables, no imports. Only return value is serialized back. Arguments are passed via `args`.

### Transcript extraction strategy (`pageScrape`)

YouTube renders transcripts two different ways and the scraper handles both:

1. **Classic engagement panel** — `ytd-transcript-segment-renderer` elements with `.segment-timestamp` / `.segment-text` children. Preferred when present; cleanest data.
2. **New sidebar "In this video → Transcript" layout** — no stable selector. Falls back to a generic DOM walk (`collectRows`) that finds any element whose `innerText` matches `mm:ss <caption>` without a nested timestamp, then picks the right cluster via `pickBestCluster` (ancestor containing ≥3 rows with monotonic timestamps, score = row count × container tightness) and trims to the longest monotonic run (`longestMonotonicRun`) to drop rail rows that leaked in.

Noise filters in `isBadRow` reject:
- Related-video cards (`"… ago"`, `"Watch full video"`, `"Mix (N …"`)
- Chapter chips (text that's just `"X X"` — the same phrase duplicated)
- The player time display (`"/ 9:16"`)
- Anything >400 chars

`cleanCaption` strips YouTube's screen-reader spoken-form duration (e.g. `"1 minute, 5 seconds"`) that the sidebar glues to each caption.

If no transcript is visible, the scraper tries (in order) clicking a "Transcript" tab/chip, then expanding the description and clicking "Show transcript", with `waitFor` polling between attempts. Requires `MIN_ROWS = 5` to accept the result.

### Shorts handling

Shorts (`/shorts/<id>`) have no transcript panel. `convertShortsToWatchAndGrab` rewrites the URL to `/watch?v=<id>` and re-grabs. YouTube sometimes bounces native-Shorts URLs back to `/shorts/` — the code detects that redirect and surfaces a clear error instead of looping.

### Permissions (manifest.json)

- `scripting` + `activeTab` — inject `pageScrape` into the current tab on click.
- `downloads` — save the transcript as `.txt`.
- `host_permissions`: `youtube.com` only. No broad host access.
- No background/service worker, no content scripts declared — everything is popup-initiated.

## When editing popup.js

- Anything `pageScrape` needs must be defined **inside** `pageScrape` (it's stringified and run in the page). Helpers at popup scope are invisible there.
- `pageScrape`'s return value must be structured-cloneable (plain objects / strings / numbers). No DOM nodes, no functions.
- The monotonic-timestamp heuristic is the main line of defense against scraping related-video rails. If you loosen `monotonicScore` / `longestMonotonicRun`, test on a page with a visible "Up next" sidebar.
- YouTube's DOM changes without notice. The classic-selector path (`ytd-transcript-segment-renderer`) is the stable one; the generic walker is the safety net.
