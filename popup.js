/*!
 * YT Transcript Grabber
 * Copyright © 2026 DigitalGods. All rights reserved.
 * Proprietary and confidential. See LICENSE.
 */
const grabBtn = document.getElementById("grab");
const dlBtn = document.getElementById("download");
const tsBox = document.getElementById("timestamps");
const status = document.getElementById("status");
const preview = document.getElementById("preview");

let lastTranscript = null;
let lastTitle = null;

function setStatus(msg, isError = false) {
  status.textContent = msg;
  status.style.color = isError ? "#ff8a8a" : "#9ecbff";
}

function sanitize(name) {
  return (name || "transcript")
    .replace(/[\\/:*?"<>|]+/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

async function getActiveYouTubeTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab?.url || "";
  if (!tab || !/^https:\/\/(www\.|m\.)?youtube\.com\//.test(url)) {
    return { tab: null, reason: "not-youtube" };
  }
  if (/\/shorts\//.test(url)) {
    return { tab, reason: "shorts" };
  }
  if (!/^https:\/\/(www\.|m\.)?youtube\.com\/watch/.test(url)) {
    return { tab: null, reason: "not-watch" };
  }
  return { tab, reason: "ok" };
}

function shortsIdFromUrl(url) {
  const m = url.match(/\/shorts\/([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : null;
}

async function waitForTabReady(tabId, { timeoutMs = 15000 } = {}) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const t = await chrome.tabs.get(tabId);
    if (t.status === "complete") return t;
    await new Promise((r) => setTimeout(r, 250));
  }
  return await chrome.tabs.get(tabId);
}

async function convertShortsToWatchAndGrab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const id = shortsIdFromUrl(tab?.url || "");
  if (!id) {
    setStatus("Couldn't parse the Short's video ID from the URL.", true);
    return;
  }
  setStatus("Opening watch page…");
  await chrome.tabs.update(tab.id, {
    url: `https://www.youtube.com/watch?v=${id}`,
  });
  const ready = await waitForTabReady(tab.id);
  // YouTube sometimes bounces /watch?v=<id> of a native Short right back to
  // /shorts/<id>. Detect that and stop instead of looping.
  if (/\/shorts\//.test(ready.url || "")) {
    setStatus(
      "YouTube redirected back to Shorts — this clip was uploaded natively as a Short and has no watch-page transcript.",
      true
    );
    return;
  }
  // Let the watch page's transcript panel render before scraping.
  await new Promise((r) => setTimeout(r, 800));
  await grab();
}

// Function injected into the page. Self-contained — no closures.
async function pageScrape(includeTimestamps) {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const waitFor = async (fn, timeout = 6000, interval = 150) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const v = fn();
      if (v) return v;
      await sleep(interval);
    }
    return null;
  };

  // Strip YouTube's screen-reader spoken-form duration glued to the caption
  // (e.g. "1 minute, 5 secondscompact, this capable").
  const SPOKEN_DUR =
    /^\s*\d+\s+(?:hours?(?:,\s*\d+\s+minutes?)?|minutes?(?:,\s*\d+\s+seconds?)?|seconds?)\s*/i;
  const cleanCaption = (s) =>
    (s || "").replace(/\s+/g, " ").replace(SPOKEN_DUR, "").trim();

  const TS_RE = /^\s*(\d{1,2}:\d{2}(?::\d{2})?)\s+(\S[\s\S]*)$/;

  // Reject rows that clearly aren't transcript lines.
  const looksLikeRelatedVideo = (s) =>
    /LivePlaylist|Watch full video|Mix \(\d+/.test(s) ||
    // "1y ago" / "5mo ago" / "3d ago" — YouTube's shorthand age, no space.
    /\b\d+(?:s|m|h|d|w|mo|y|yr)\s+ago\b/i.test(s) ||
    // Long-form "5 days ago" / "2 years ago" — any transcript row that ends
    // with this is almost certainly a video card, not a caption.
    /\b\d+\s+(?:sec|min|hour|day|week|month|year)s?\s+ago\b/i.test(s) ||
    // Trailing "New" freshness badge after a "… ago" chunk.
    /\s+ago\s+New\s*$/i.test(s);
  const looksLikeChapterChip = (s) => {
    const t = s.trim();
    const half = t.slice(0, Math.floor(t.length / 2)).trim();
    return !!half && t === half + " " + half;
  };
  // Player time display, e.g. "/ 9:16" after the current-time chunk.
  const looksLikePlayerTime = (caption, ts) =>
    /^\/\s*\d{1,2}:\d{2}/.test(caption) ||
    new RegExp(`^${ts.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*/`).test(
      ts + " " + caption
    );
  const isBadRow = (caption, ts) =>
    !caption ||
    caption.length > 400 ||
    looksLikeRelatedVideo(caption) ||
    looksLikeChapterChip(caption) ||
    looksLikePlayerTime(caption, ts);

  // Walk the page collecting rows that start with mm:ss. A "row" may be
  // single-line ("8:17 caption...") or split across block elements
  // ("8:17\ncaption..."). We only accept it as a row if the caption part
  // doesn't itself contain another mm:ss — that rules out container nodes
  // covering many rows.
  const ROW_RE = /^(\d{1,2}:\d{2}(?::\d{2})?)\s+([\s\S]+)$/;
  const INNER_TS = /\b\d{1,2}:\d{2}\b/;
  const collectRows = () => {
    const rows = [];
    const visit = (el) => {
      const txt = (el.innerText || "").trim();
      if (!txt) return;
      const m = txt.match(ROW_RE);
      if (m) {
        const rest = m[2];
        if (!INNER_TS.test(rest)) {
          const caption = cleanCaption(rest.replace(/\s*\n\s*/g, " "));
          if (!isBadRow(caption, m[1])) {
            rows.push({ ts: m[1], text: caption, el });
          }
          return;
        }
      }
      for (const c of el.children) visit(c);
    };
    visit(document.body);
    return rows;
  };

  // Turn "mm:ss" or "h:mm:ss" into seconds for monotonic comparisons.
  const tsToSec = (ts) => {
    const parts = ts.split(":").map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3)
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
  };

  // Fraction of adjacent pairs where ts[i] >= ts[i-1]. Real transcripts are
  // ~1.0; a grab-bag of recommended-video durations is near chance.
  const monotonicScore = (arr) => {
    if (arr.length < 2) return 0;
    let good = 0;
    for (let i = 1; i < arr.length; i++) {
      if (tsToSec(arr[i].ts) >= tsToSec(arr[i - 1].ts)) good++;
    }
    return good / (arr.length - 1);
  };

  // Longest contiguous run of rows that are non-decreasing by timestamp.
  // Protects against a few rail rows being appended to an otherwise clean
  // transcript cluster (e.g. "Up next" items below the transcript panel).
  const longestMonotonicRun = (arr) => {
    if (arr.length < 2) return arr.slice();
    let bestStart = 0,
      bestLen = 1,
      curStart = 0,
      curLen = 1;
    for (let i = 1; i < arr.length; i++) {
      if (tsToSec(arr[i].ts) >= tsToSec(arr[i - 1].ts)) {
        curLen++;
      } else {
        if (curLen > bestLen) {
          bestLen = curLen;
          bestStart = curStart;
        }
        curStart = i;
        curLen = 1;
      }
    }
    if (curLen > bestLen) {
      bestLen = curLen;
      bestStart = curStart;
    }
    return arr.slice(bestStart, bestStart + bestLen);
  };

  // Rows may come from several containers (transcript panel, chapters list,
  // related-videos rail). Pick the ancestor whose contained rows look most
  // transcript-like: many rows AND monotonic timestamps.
  const pickBestCluster = (rows) => {
    if (rows.length < 3) return [];
    const counts = new Map();
    for (const r of rows) {
      let el = r.el.parentElement;
      for (let d = 0; d < 12 && el; d++) {
        counts.set(el, (counts.get(el) || 0) + 1);
        el = el.parentElement;
      }
    }
    let best = null;
    let bestScore = -1;
    for (const [el, count] of counts) {
      if (count < 3) continue;
      const subset = rows.filter((r) => el.contains(r.el));
      const mono = monotonicScore(subset);
      // Require strong monotonicity (real transcripts sit at ~1.0).
      if (mono < 0.9) continue;
      const size = el.getElementsByTagName("*").length;
      // Prefer more rows and a tighter container (fewer extraneous descendants).
      const score = subset.length * 100 + Math.min(1000 / Math.max(size, 1), 100);
      if (score > bestScore) {
        bestScore = score;
        best = subset;
      }
    }
    return best || [];
  };

  const anySegments = () => {
    // Prefer classic per-segment renderer if present — cleanest data.
    const classic = Array.from(
      document.querySelectorAll("ytd-transcript-segment-renderer")
    );
    if (classic.length) {
      return classic.map((seg) => ({
        ts: seg.querySelector(".segment-timestamp")?.innerText?.trim() || "",
        text: cleanCaption(
          seg.querySelector(".segment-text, yt-formatted-string.segment-text")
            ?.innerText || ""
        ),
      }));
    }
    // Generic fallback for the new sidebar layout.
    const clustered = pickBestCluster(collectRows());
    const trimmed = longestMonotonicRun(clustered);
    const seen = new Set();
    const out = [];
    for (const r of trimmed) {
      const k = r.ts + "|" + r.text;
      if (seen.has(k)) continue;
      seen.add(k);
      out.push({ ts: r.ts, text: r.text });
    }
    return out;
  };

  const clickByLabel = (re) => {
    const candidates = Array.from(
      document.querySelectorAll(
        'button, [role="tab"], [role="button"], yt-button-shape button, tp-yt-paper-button, ytd-button-renderer button, yt-chip-cloud-chip-renderer'
      )
    );
    const btn = candidates.find((b) => {
      const label =
        (b.getAttribute("aria-label") || "") + " " + (b.textContent || "");
      return re.test(label);
    });
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  };

  const expandDescription = () => {
    const el = document.querySelector(
      "ytd-text-inline-expander #expand, tp-yt-paper-button#expand"
    );
    if (el) {
      el.click();
      return true;
    }
    return false;
  };

  // A single 8:17/9:16 hit is meaningless — require a real cluster.
  const MIN_ROWS = 5;
  const enoughSegments = () => anySegments().length >= MIN_ROWS;

  // 1. Try clicking a "Transcript" tab/chip in the new sidebar.
  if (!enoughSegments()) {
    clickByLabel(/^\s*transcript\s*$/i);
    await waitFor(enoughSegments, 1500);
  }
  // 2. Try the classic "Show transcript" button (engagement panel).
  if (!enoughSegments()) {
    if (!clickByLabel(/show\s*transcript/i)) {
      expandDescription();
      await sleep(450);
      clickByLabel(/show\s*transcript/i);
    }
    await waitFor(enoughSegments, 4000);
  }
  // 3. Final wait — slow networks / long videos.
  await waitFor(enoughSegments, 4000);
  await sleep(350);

  const segs = anySegments();
  if (segs.length < MIN_ROWS) {
    return {
      ok: false,
      error:
        "Couldn't find the transcript. Open it manually first — either the 'Transcript' tab in the sidebar, or click '…more' under the video and then 'Show transcript' — then click Grab again.",
    };
  }

  const lines = segs.map(({ ts, text }) =>
    includeTimestamps && ts ? `[${ts}] ${text}` : text
  );

  const titleEl =
    document.querySelector("h1.ytd-watch-metadata yt-formatted-string") ||
    document.querySelector("h1.title") ||
    document.querySelector("h1");
  const title = (titleEl?.innerText || document.title || "transcript").trim();

  return { ok: true, text: lines.filter(Boolean).join("\n"), title, count: segs.length };
}

async function grab() {
  setStatus("Working...");
  preview.value = "";
  lastTranscript = null;

  const { tab, reason } = await getActiveYouTubeTab();
  if (reason === "shorts") {
    await convertShortsToWatchAndGrab();
    return null;
  }
  if (!tab) {
    const msg = {
      "not-youtube": "Open a YouTube watch page first (youtube.com/watch?v=...).",
      "not-watch": "This YouTube page doesn't have a transcript. Open a regular video (youtube.com/watch?v=...).",
    }[reason] || "Open a YouTube watch page first.";
    setStatus(msg, true);
    return null;
  }

  let results;
  try {
    results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: pageScrape,
      args: [tsBox.checked],
    });
  } catch (e) {
    setStatus("Injection failed: " + e.message, true);
    return null;
  }

  const result = results?.[0]?.result;
  if (!result || !result.ok) {
    setStatus(result?.error || "Could not extract transcript.", true);
    return null;
  }

  lastTranscript = result.text;
  lastTitle = result.title;
  preview.value = result.text;

  try {
    await navigator.clipboard.writeText(result.text);
    setStatus(`Copied ${result.text.length.toLocaleString()} chars to clipboard.`);
  } catch {
    setStatus("Got transcript, but clipboard write failed. Copy from box below.", true);
  }
  return result;
}

async function download() {
  let res = lastTranscript ? { text: lastTranscript, title: lastTitle } : await grab();
  if (!res || !res.text) return;

  const blob = new Blob([res.text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  await chrome.downloads.download({
    url,
    filename: `${sanitize(res.title)}.txt`,
    saveAs: false,
  });
  setStatus(`Saved ${sanitize(res.title)}.txt to Downloads.`);
}

grabBtn.addEventListener("click", grab);
dlBtn.addEventListener("click", download);

// On open, if the user is on a Short, preview what the button will do.
(async () => {
  const { reason } = await getActiveYouTubeTab();
  if (reason === "shorts") {
    grabBtn.textContent = "Open watch page & grab";
    setStatus(
      "Short detected. Click to switch this tab to the full watch page and pull the transcript."
    );
  }
})();
