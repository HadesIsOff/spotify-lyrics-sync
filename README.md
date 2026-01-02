# Spotify Lyrics Sync

Auto-synced lyrics for Spotify Web Player using the free LRCLIB API (no key needed). Detects the current song on open.spotify.com, fetches synced lyrics, and highlights lines in real time inside a polished popup.

## Features
- Auto-detects current Spotify track (title, artist, album art)
- Fetches synced lyrics from LRCLIB (no API key)
- Real-time line highlighting with smooth scrolling
- Progress bar and timestamps in the header
- Album art display with Spotify-themed dark UI
- Graceful loading and error states

## Installation (Load Unpacked)
1. Open Chrome → `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked** and select this folder
4. Open https://open.spotify.com, play a song, click the extension icon

## Files
- `manifest.json` — Extension config (MV3)
- `popup.html`, `popup.js`, `styles.css` — Popup UI and logic
- `content.js` — Detects song info from Spotify page
- `background.js` — Fetches lyrics from LRCLIB
- `icons/` — PNG icons (16/48/128)

## Permissions
- `activeTab` — Communicate with the current Spotify tab
- `host_permissions` — `https://open.spotify.com/*`, `https://lrclib.net/*` for detection and lyrics fetch

## How It Works
1. Content script watches Spotify DOM for song title/artist/album art/duration
2. Background service fetches synced lyrics from LRCLIB
3. Popup displays lyrics, highlights the active line, and shows playback progress

## Troubleshooting
- If popup shows “Open Spotify Web Player”: open https://open.spotify.com and play a song
- If “Refresh Spotify page”: reload the Spotify tab so the content script attaches
- If “Lyrics not found”: the track may not exist in LRCLIB; try another song

## License
MIT
