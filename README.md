# YT Transcript Grabber

One click to copy and download the transcript of the YouTube video you're
watching.

## Features

- Works with both the classic engagement-panel transcript and the newer "In
  this video → Transcript" sidebar layout.
- Optional timestamps (`[mm:ss]` prefix per line).
- Copies to clipboard on click, and/or downloads as a `.txt` file named after
  the video title.
- No network calls, no tracking, no account — see [PRIVACY.md](PRIVACY.md).

## Install (end users)

Once published, install from the Chrome Web Store listing and pin the icon.
On a YouTube watch page, click the icon → **Grab & Copy**.

## Install (unpacked, for development)

1. `chrome://extensions`
2. Toggle **Developer mode** on.
3. **Load unpacked** → pick this folder.

## How it works

The popup injects a small function into the active YouTube tab via
`chrome.scripting.executeScript`. That function:

1. Clicks the **Transcript** tab / button if the panel isn't already open.
2. Scans the DOM for `mm:ss`-prefixed rows.
3. Filters out recommended-video rows, chapter chips, and the player's own
   time display.
4. Clusters the remaining rows to the tightest common ancestor — that's the
   transcript panel.
5. Strips YouTube's screen-reader-only spoken-form duration ("8 seconds",
   "1 minute, 5 seconds") that otherwise bleeds into each caption.

The result is copied to the clipboard and optionally saved as a `.txt`.

## Repo layout

```
yt-transcript-extension/
├── manifest.json          # MV3 manifest
├── popup.html / popup.js  # UI + scraper
├── icons/                 # 16/32/48/128 PNGs
├── store/                 # Chrome Web Store assets
├── build_icons.py         # Regenerates icons from code
├── PRIVACY.md             # User-facing privacy policy
├── PUBLISHING.md          # Step-by-step store submission guide
└── LICENSE                # MIT
```

## License

Copyright © 2026 DigitalGods. All rights reserved.

This software is proprietary. See [LICENSE](LICENSE) for the full terms. End
users receive a personal, non-transferable license to run the extension when
they install it from the Chrome Web Store; no right to copy, modify,
redistribute, or create derivative works is granted.
