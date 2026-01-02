<div align="center">

# Spotify Lyrics Sync

**Real-time synced lyrics for Spotify Web Player**

[![Chrome Web Store](https://img.shields.io/badge/Chrome-Extension-green?style=flat&logo=googlechrome)](https://github.com/HadesIsOff/spotify-lyrics-sync)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-orange)](manifest.json)

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [How It Works](#-how-it-works) • [Troubleshooting](#-troubleshooting)

</div>

---

## Overview

A lightweight Chrome extension that brings **auto-synced lyrics** to Spotify Web Player. Detects your currently playing track on open.spotify.com, fetches timestamped lyrics from the free LRCLIB API, and displays them with real-time highlighting in a sleek Spotify-themed popup.

No API keys required. No sign-ups. Just pure lyrics.

## ✨ Features

- **Auto-detection** — Instantly recognizes the current Spotify track (title, artist, album art)
- **Real-time sync** — Highlights lyrics line-by-line as the song plays
- **Smooth animations** — Elastic transitions and scroll effects for a polished feel
- **Playback progress** — Visual progress bar with current/total time display
- **Album art** — Shows cover art directly from Spotify
- **Dark theme** — Matches Spotify's UI with elegant gradients and shadows
- **Offline-ready** — Graceful error handling when lyrics aren't available
- **Zero config** — Uses the free LRCLIB API (no API key needed)

## 📦 Installation

### Option 1: Load Unpacked (Developer)

1. Clone or download this repository:
   ```bash
   git clone https://github.com/HadesIsOff/spotify-lyrics-sync.git
   cd spotify-lyrics-sync
   ```

2. Open Chrome and navigate to:
   ```
   chrome://extensions/
   ```

3. Enable **Developer mode** (toggle in top-right corner)

4. Click **Load unpacked** and select the project folder

5. Open [Spotify Web Player](https://open.spotify.com), play a song, and click the extension icon

### Option 2: Chrome Web Store (Coming Soon)

Extension will be published to the Chrome Web Store after review.

## 🎵 Usage

1. Navigate to [open.spotify.com](https://open.spotify.com)
2. Play any song
3. Click the extension icon in your Chrome toolbar
4. Watch lyrics sync in real time as the song plays
5. Click any lyric line to preview that timestamp

## 🛠️ Tech Stack

- **Manifest V3** — Latest Chrome extension standard
- **Vanilla JavaScript** — No frameworks, pure performance
- **LRCLIB API** — Free synced lyrics database
- **CSS3 Animations** — Smooth transitions and effects

## 📂 Project Structure

```
spotify-lyrics-sync/
├── manifest.json           # Extension configuration (MV3)
├── popup.html             # Popup UI structure
├── popup.js               # Popup logic and lyrics display
├── content.js             # Spotify page song detector
├── background.js          # LRCLIB API handler
├── styles.css             # Spotify-themed styles
├── icons/
│   ├── icon16.png        # 16×16 toolbar icon
│   ├── icon48.png        # 48×48 extension icon
│   └── icon128.png       # 128×128 store icon
└── README.md             # You are here
```

## 🔐 Permissions

The extension requires minimal permissions:

- **`activeTab`** — Communicate with the active Spotify tab
- **`storage`** — Cache lyrics for better performance
- **Host permissions:**
  - `https://open.spotify.com/*` — Detect song information
  - `https://lrclib.net/*` — Fetch synced lyrics

## ⚙️ How It Works

1. **Content Script** (`content.js`) monitors Spotify's DOM using MutationObserver to detect:
   - Song title
   - Artist name
   - Album artwork URL
   - Playback duration
   - Current timestamp

2. **Background Service** (`background.js`) fetches synced lyrics from LRCLIB API:
   ```
   GET https://lrclib.net/api/get?artist_name={artist}&track_name={track}
   ```

3. **Popup** (`popup.js` + `popup.html`) displays:
   - Song metadata with album art
   - Timestamped lyrics with real-time highlighting
   - Playback progress and time display
   - Smooth scroll to active line

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| **"Open Spotify Web Player"** | Navigate to [open.spotify.com](https://open.spotify.com) and play a song |
| **"Refresh Spotify page"** | Reload the Spotify tab so the content script can attach |
| **"Lyrics not found"** | The track may not exist in LRCLIB's database. Try a more popular song |
| **Extension not appearing** | Check that the extension is enabled at `chrome://extensions/` |
| **Double scrollbar** | Refresh the extension (shouldn't happen with latest version) |

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs via [Issues](https://github.com/HadesIsOff/spotify-lyrics-sync/issues)
- Submit feature requests
- Open pull requests

## 📝 Roadmap

- [ ] Support for YouTube Music
- [ ] Custom color themes
- [ ] Font size adjustment
- [ ] Keyboard shortcuts
- [ ] Translation support
- [ ] Playlist lyrics export

## 🙏 Credits

- **LRCLIB** — Free synced lyrics API ([lrclib.net](https://lrclib.net))
- **Spotify** — UI design inspiration

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with ❤️ for music lovers**

⭐ Star this repo if you find it useful!

</div>
