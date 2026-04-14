# Chrome Web Store listing copy

Paste these strings into the matching fields in the Dev Console.

---

## Name

```
YT Transcript Grabber
```

## Short description (max 132 chars)

```
One click to copy and download the transcript of the YouTube video you're watching. No account, no tracking, 100% local.
```

_Character count: 125._

## Detailed description

```
YT Transcript Grabber does one thing and does it well: it grabs the transcript from the YouTube video in your active tab, copies it to your clipboard, and — if you want — saves it as a .txt file named after the video.

HOW TO USE
1. Open any YouTube video that has captions or a transcript available.
2. Click the toolbar icon.
3. (Optional) Tick "Include timestamps" if you want [mm:ss] prefixes.
4. Click "Grab & Copy" — the transcript is on your clipboard.
5. Click "Download .txt" to also save it to your Downloads folder.

WHY YOU'LL LIKE IT
• Works on both the classic transcript panel and the newer "In this video → Transcript" sidebar.
• Clean output — strips the screen-reader spoken-form durations ("1 minute, 5 seconds") that other scrapers leave glued to captions.
• Filters out recommended-video rows, chapter chips, and the player's own time display so the copied text is actually the transcript and nothing else.
• No sign-in, no server, no network requests, no analytics. The extension only reads the DOM that's already in your tab.
• Downloads use your real video title as the filename.

PRIVACY
The extension makes no network requests of its own. Everything runs locally in your browser. The only APIs it touches are the active YouTube tab's DOM, the clipboard, and Chrome's download manager. Full privacy policy linked in the listing.

PERMISSIONS EXPLAINED
• scripting / activeTab — to read the transcript from the tab you're on when you click the icon.
• downloads — to save the .txt file to your downloads folder.
• Host access to youtube.com — so the extension only runs where it's useful.

LIMITATIONS
• If a YouTube video has no auto-captions and no creator-provided transcript, there's nothing to grab. The extension will tell you when that's the case.
• Works on desktop Chrome on the standard YouTube watch page (youtube.com/watch?v=...).

FEEDBACK
Issues and feature requests are welcome — see the homepage link in the listing.
```

## Category

```
Productivity
```

## Language

```
English
```

## Single-purpose statement (required)

```
Extract and save the transcript from the YouTube video the user is currently watching.
```

## Permission justifications

```
scripting: Injects a small function into the active YouTube tab to read the already-rendered transcript DOM nodes.

activeTab: Lets the extension act only on the tab the user is currently viewing when they click the toolbar icon.

downloads: Saves the extracted transcript as a .txt file to the user's default download folder.

host permission (https://*.youtube.com/*): The extension only operates on YouTube watch pages; the host permission scopes its access there.

remote code: No. The extension ships with all code bundled inside the zip; it never fetches or executes remote scripts.
```
