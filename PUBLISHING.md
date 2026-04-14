# Publishing to the Chrome Web Store

Follow these steps once. Subsequent version updates reuse the same listing.

## 1. Dev account

1. Go to https://chrome.google.com/webstore/devconsole
2. Sign in with the Google account you want to own the listing.
3. Pay the one-time **$5** registration fee and verify your identity.

## 2. Build the upload zip

From this folder, run:

```bash
python package.py
```

That produces `yt-transcript-grabber-v<version>.zip` in the current folder.
The zip contains `manifest.json`, `popup.html`, `popup.js`, `icons/`,
`LICENSE`, and `PRIVACY.md`. It excludes developer-only files
(`build_icons.py`, `package.py`, `README.md`, `store/`, and any existing
zips).

## 3. Create the listing

In the Dev Console → **Items** → **New item** → upload the zip.

### Store listing fields

Copy-paste the copy in [`store/listing.md`](store/listing.md):

- **Name**: `YT Transcript Grabber`
- **Short description** (132 chars max): see `listing.md`.
- **Description** (detailed): see `listing.md`.
- **Category**: Productivity
- **Language**: English
- **Privacy policy URL**: host `PRIVACY.md` somewhere public (e.g. a GitHub
  repo raw URL, a GitHub Pages site, or a Gist) and paste that URL.

### Graphics

Upload from this folder:

- **Store icon 128×128** → `store/store-icon-128.png`
- **Small promo tile 440×280** → `store/promo-tile-440x280.png`
- **Screenshots 1280×800** → at least one; see `store/screenshots/README.md`
  for the three recommended shots. Capture these manually from a real YouTube
  page with the extension running.

### Permissions justifications

The Dev Console asks for a plain-English reason for every permission. Paste:

- **`scripting`** — Injects a small function into the active YouTube tab to
  read the already-rendered transcript DOM nodes.
- **`activeTab`** — Lets the extension act only on the tab the user is
  currently viewing when they click the toolbar icon.
- **`downloads`** — Saves the extracted transcript as a `.txt` file to the
  user's default download folder.
- **Host permission `https://*.youtube.com/*`** — The extension only operates
  on YouTube watch pages; the host permission scopes its access there.
- **Remote code**: `No`.
- **Single purpose**: `Extract and save the transcript from the YouTube
  video the user is currently watching.`

### Distribution

- **Visibility**: **Unlisted** if you want a shareable link without public
  discoverability; **Public** if you want it in search results.
- **Regions**: All regions.

## 4. Submit for review

Click **Submit for review**. Typical turnaround is 1–3 business days for a
first submission.

## 5. Shipping updates

1. Bump `"version"` in `manifest.json` (e.g. `1.0.0` → `1.0.1`).
2. Re-run `python package.py`.
3. In the Dev Console → Items → **Package** → upload the new zip.
4. Submit for review again.

Version strings are dot-separated integers (up to four parts). You cannot
reuse or decrease a version.

## 6. After publishing

- Pin the toolbar icon so friends can see where to click.
- If you chose **Unlisted**, share the item URL directly. If **Public**, the
  listing appears in Chrome Web Store search after a short indexing delay.
