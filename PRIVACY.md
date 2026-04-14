# Privacy Policy — YT Transcript Grabber

_Last updated: 2026-04-14_

**Short version:** YT Transcript Grabber does not collect, store, sell, share,
or transmit any of your data. Everything the extension does happens locally
in your browser. There are no servers, no accounts, no analytics, no
tracking, and no ads.

This policy explains that in more detail.

---

## 1. Who we are

"YT Transcript Grabber" (the "Extension") is published by **DigitalGods**
("we", "us", "our"). If you have questions about this policy, see the
[Contact](#8-contact) section at the bottom.

## 2. What the Extension does

When you are on a YouTube watch page (`youtube.com/watch?v=...`) and click
the Extension's toolbar icon, the Extension:

1. Reads the transcript text that YouTube has already rendered in that tab.
2. Cleans it up (removes recommended-video rows, chapter chips, the player's
   time display, and screen-reader duration noise).
3. Copies the result to your clipboard.
4. If you click **Download .txt**, saves the result as a text file in your
   browser's default download folder, named after the video title.

That is the entire feature set. The Extension does nothing when you are not
on a YouTube watch page.

## 3. What data we collect

**None.** We do not collect, log, store, or receive any data from you. We
have no backend server. We do not know who installs the Extension, who uses
it, what videos they view, or what transcripts they grab.

## 4. What data the Extension accesses (and why)

The Extension accesses a small amount of data **only inside your browser**,
only while you are actively using it. None of this data leaves your device.

| Data the Extension touches          | Why                                                       | Where it goes                                        |
| ----------------------------------- | --------------------------------------------------------- | ---------------------------------------------------- |
| The current YouTube tab's DOM       | Read the visible transcript segments                      | Stays in the tab; never transmitted                  |
| The video title                     | Suggest a filename for the optional `.txt` download       | Stays on your computer                               |
| Your clipboard (write-only)         | Place the transcript text on your clipboard so you can paste it | Stays on your computer                         |
| Chrome's `downloads` API            | Save the `.txt` file to your default Downloads folder     | Stays on your computer                               |

The Extension does **not** read, access, or touch:

- Your browsing history
- Other open tabs or windows
- Cookies, localStorage, IndexedDB, or any saved site data
- Your YouTube account, watch history, subscriptions, or playlists
- Any website other than `youtube.com` (Chrome enforces this via the host
  permission in `manifest.json`)
- Your microphone, camera, location, or any OS-level permissions

## 5. Permissions, in plain English

Chrome shows a permissions prompt at install time. Here is exactly what each
one is for:

- **`scripting`** — lets the Extension inject a small function into the
  active YouTube tab to read the transcript DOM. This runs only when you
  click the toolbar icon, not in the background.
- **`activeTab`** — restricts the Extension to the one tab you are currently
  viewing when you click the icon.
- **`downloads`** — used only if you click **Download .txt**, to save the
  transcript to your Downloads folder.
- **Host permission `https://*.youtube.com/*`** — scopes everything above to
  YouTube. The Extension cannot run on any other site.

## 6. What we do not do

To be explicit:

- We do **not** run analytics (no Google Analytics, no Mixpanel, no
  anything).
- We do **not** set or read cookies.
- We do **not** make network requests of our own. The Extension never calls
  any server — ours or anyone else's.
- We do **not** use advertising, ad networks, or ad identifiers.
- We do **not** sell, rent, trade, or share data with third parties, because
  we do not have any data to share.
- We do **not** load remote code. All JavaScript that runs is bundled in the
  installed Extension package and reviewed by the Chrome Web Store.
- We do **not** use AI models, cloud services, or third-party APIs to
  process your transcripts.

## 7. Children's privacy

The Extension is a general-audience productivity tool. It does not knowingly
collect information from children because it does not collect information
from anyone.

## 8. Your rights (GDPR / CCPA / etc.)

Because we do not collect personal data, there is nothing to access,
correct, delete, port, or opt out of. If you want the Extension to stop
touching your browser entirely, uninstall it from `chrome://extensions`.

## 9. Changes to this policy

If a future version of the Extension changes what data it touches — for
example, if an opt-in cloud-sync feature is ever added — this policy will be
updated **before** that version ships, the `Last updated` date at the top
will change, and the change will be described in the release notes. We will
never retroactively apply a policy change to data collected under an older
policy (since, again, there is no data).

## 10. Contact

Questions, concerns, or reports:

- Open an issue on the project's GitHub repository:
  <https://github.com/Digitalgods2/yt-transcript-grabber>

---

Copyright © 2026 DigitalGods. All rights reserved.
