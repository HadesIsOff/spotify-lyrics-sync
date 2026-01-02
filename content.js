let currentSong = null;
let observer = null;

function detectSong() {
  const nowPlayingWidget = document.querySelector('[data-testid="now-playing-widget"]');
  
  if (!nowPlayingWidget) {
    return null;
  }

  const titleElement = nowPlayingWidget.querySelector('[data-testid="context-item-info-title"] a');
  const artistElement = nowPlayingWidget.querySelector('[data-testid="context-item-info-artist"]');
  const durationElement = document.querySelector('[data-testid="playback-duration"]');
  const albumArtElement = document.querySelector('[data-testid="cover-art-image"]');
  
  if (!titleElement || !artistElement) {
    return null;
  }

  const title = titleElement.textContent.trim();
  const artist = artistElement.textContent.trim();
  const duration = durationElement ? durationElement.textContent.trim() : null;
  const albumArt = albumArtElement ? albumArtElement.src : null;

  return { title, artist, duration, albumArt };
}

function getCurrentTime() {
  const positionElement = document.querySelector('[data-testid="playback-position"]');
  if (!positionElement) return 0;
  
  const timeText = positionElement.textContent.trim();
  const parts = timeText.split(':');
  
  if (parts.length === 2) {
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  }
  
  return 0;
}

function sendSongInfo() {
  const song = detectSong();
  const currentTime = getCurrentTime();
  
  if (song && JSON.stringify(song) !== JSON.stringify(currentSong)) {
    currentSong = song;
    try {
      chrome.runtime.sendMessage({
        type: 'SONG_DETECTED',
        data: { ...song, currentTime }
      }, (response) => {
        if (chrome.runtime.lastError) {
          return;
        }
      });
    } catch (error) {
      return;
    }
  } else if (song) {
    try {
      chrome.runtime.sendMessage({
        type: 'TIME_UPDATE',
        data: { currentTime }
      }, (response) => {
        if (chrome.runtime.lastError) {
          return;
        }
      });
    } catch (error) {
      return;
    }
  }
}

function startObserver() {
  if (observer) {
    observer.disconnect();
  }

  const nowPlayingBar = document.querySelector('[data-testid="now-playing-bar"]');
  
  if (nowPlayingBar) {
    observer = new MutationObserver(() => {
      sendSongInfo();
    });

    observer.observe(nowPlayingBar, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  setInterval(sendSongInfo, 1000);
  sendSongInfo();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startObserver);
} else {
  startObserver();
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_SONG_INFO') {
    try {
      const song = detectSong();
      const currentTime = getCurrentTime();
      sendResponse({ song, currentTime });
    } catch (error) {
      sendResponse({ song: null, currentTime: 0 });
    }
  }
  return true;
});
