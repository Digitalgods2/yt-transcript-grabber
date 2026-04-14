# Privacy Policy — YT Transcript Grabber

_Last updated: 2026-04-13_

YT Transcript Grabber ("the extension") does not collect, store, or transmit
any personal data.

## What the extension does

When you click the extension's toolbar icon on a YouTube watch page, it:

1. Reads the transcript segments already rendered in the active YouTube tab's
   page content.
2. Copies that text to your clipboard.
3. Optionally saves it as a local `.txt` file via Chrome's download manager.

All of this happens locally in your browser. The extension has no backend
server, no analytics, no tracking, no cookies, and no remote code execution.

## Data the extension accesses

| Data                              | Why it's needed                                     | Where it goes                              |
| --------------------------------- | --------------------------------------------------- | ------------------------------------------ |
| The current YouTube page's DOM    | Read the visible transcript text                    | Stays in the active tab; never transmitted |
| The video title                   | Used as the suggested filename for the download     | Stays on your computer                     |
| Your clipboard (write-only)       | Paste the transcript into other apps                | Stays on your computer                     |
| Chrome `downloads` API            | Save the `.txt` file to your default download folder | Stays on your computer                     |

The extension does **not** access browsing history, other tabs, account
information, watch history, cookies, or any site other than `youtube.com`.

## Third parties

None. The extension makes no network requests of its own.

## Changes

If future versions ever change this policy — for example, to add an optional
cloud-sync feature — this file will be updated before that version ships, and
the change will be described in the release notes.

## Contact

Please open an issue on the project's source repository for questions or
reports.

---

Copyright © 2026 DigitalGods. All rights reserved.
