let currentLyrics = null;
let syncedLyricsArray = [];
let currentTime = 0;
let totalDuration = 0;
let updateInterval = null;
let lastSongId = null;

const songTitleEl = document.getElementById('songTitle');
const songArtistEl = document.getElementById('songArtist');
const albumArtEl = document.getElementById('albumArt');
const progressInfoEl = document.getElementById('progressInfo');
const progressFillEl = document.getElementById('progressFill');
const currentTimeEl = document.getElementById('currentTime');
const totalTimeEl = document.getElementById('totalTime');
const lyricsContainerEl = document.getElementById('lyricsContainer');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const lyricsEl = document.getElementById('lyrics');
const headerEl = document.querySelector('.header');

async function initialize() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tabs[0] || !tabs[0].url.includes('open.spotify.com')) {
    showError('Open Spotify Web Player');
    return;
  }

  chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_SONG_INFO' }, (response) => {
    if (chrome.runtime.lastError) {
      showError('Refresh Spotify page');
      return;
    }

    if (response && response.song) {
      updateSongInfo(response.song);
      currentTime = response.currentTime;
      loadLyrics();
    } else {
      showError('No song playing');
    }
  });

  startTimeUpdates();
}

function startTimeUpdates() {
  if (updateInterval) clearInterval(updateInterval);
  
  updateInterval = setInterval(async () => {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tabs[0] && tabs[0].url.includes('open.spotify.com')) {
      try {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_SONG_INFO' }, (response) => {
          if (chrome.runtime.lastError) {
            return;
          }
          if (response && response.currentTime !== undefined) {
            currentTime = response.currentTime;
            updateActiveLyric();
          }
        });
      } catch (error) {
        return;
      }
    }
  }, 500);
}

function updateSongInfo(song) {
  const songId = `${song.title}-${song.artist}`;
  
  if (songId !== lastSongId) {
    lastSongId = songId;
    currentLyrics = null;
    syncedLyricsArray = [];
    lastActiveIndex = -1;
    currentTime = 0;
    totalDuration = 0;
    progressFillEl.style.width = '0%';
    showLoading();
  }
  
  songTitleEl.textContent = song.title;
  songArtistEl.textContent = song.artist;
  
  if (song.albumArt) {
    albumArtEl.innerHTML = `<img src="${song.albumArt}" alt="Album Art">`;
  }
  
  if (song.duration) {
    totalDuration = parseDuration(song.duration);
    totalTimeEl.textContent = song.duration;
    progressInfoEl.style.display = 'block';
  }
  
  headerEl.classList.add('playing');
}

function parseDuration(durationStr) {
  const parts = durationStr.split(':');
  if (parts.length === 2) {
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  }
  return 0;
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

async function loadLyrics() {
  showLoading();

  chrome.runtime.sendMessage({ type: 'GET_CURRENT_SONG' }, (response) => {
    if (response && response.lyrics) {
      displayLyrics(response.lyrics);
    } else {
      setTimeout(() => {
        chrome.runtime.sendMessage({ type: 'GET_CURRENT_SONG' }, (response) => {
          if (response && response.lyrics) {
            displayLyrics(response.lyrics);
          } else {
            setTimeout(() => {
              chrome.runtime.sendMessage({ type: 'GET_CURRENT_SONG' }, (response) => {
                if (response && response.lyrics) {
                  displayLyrics(response.lyrics);
                } else {
                  showError('Lyrics not found');
                }
              });
            }, 1500);
          }
        });
      }, 1000);
    }
  });
}

function displayLyrics(lyrics) {
  currentLyrics = lyrics;
  
  if (lyrics.syncedLyrics) {
    syncedLyricsArray = parseSyncedLyrics(lyrics.syncedLyrics);
    renderSyncedLyrics();
  } else if (lyrics.plainLyrics) {
    renderPlainLyrics(lyrics.plainLyrics);
  } else {
    showError('Lyrics not found');
  }
}

function parseSyncedLyrics(lrcText) {
  const lines = lrcText.split('\n');
  const parsed = [];

  for (const line of lines) {
    const match = line.match(/\[(\d+):(\d+)\.(\d+)\](.*)/);
    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      const time = minutes * 60 + seconds;
      const text = match[4].trim();
      
      if (text) {
        parsed.push({ time, text });
      }
    }
  }

  return parsed;
}

function renderSyncedLyrics() {
  lyricsEl.innerHTML = '';
  
  syncedLyricsArray.forEach((lyric, index) => {
    const lineEl = document.createElement('div');
    lineEl.className = 'lyric-line';
    lineEl.textContent = lyric.text;
    lineEl.dataset.index = index;
    lineEl.dataset.time = lyric.time;
    
    lineEl.addEventListener('click', () => {
      currentTime = lyric.time;
      updateActiveLyric();
    });
    
    lyricsEl.appendChild(lineEl);
  });

  hideLoading();
  lyricsEl.style.display = 'block';
  updateActiveLyric();
}

function renderPlainLyrics(plainText) {
  lyricsEl.innerHTML = '';
  lyricsEl.className = 'no-sync';
  
  const lines = plainText.split('\n');
  lines.forEach(line => {
    if (line.trim()) {
      const lineEl = document.createElement('div');
      lineEl.className = 'no-sync-line';
      lineEl.textContent = line;
      lyricsEl.appendChild(lineEl);
    }
  });

  hideLoading();
  lyricsEl.style.display = 'block';
}

let lastActiveIndex = -1;

function updateActiveLyric() {
  if (syncedLyricsArray.length === 0) return;

  currentTimeEl.textContent = formatTime(currentTime);
  
  if (totalDuration > 0) {
    const progress = (currentTime / totalDuration) * 100;
    progressFillEl.style.width = `${Math.min(progress, 100)}%`;
  }

  let activeIndex = -1;

  for (let i = 0; i < syncedLyricsArray.length; i++) {
    if (currentTime >= syncedLyricsArray[i].time) {
      activeIndex = i;
    } else {
      break;
    }
  }

  if (activeIndex !== lastActiveIndex) {
    const lines = lyricsEl.querySelectorAll('.lyric-line');
    lines.forEach((line, index) => {
      line.classList.remove('active', 'past');
      
      if (index === activeIndex) {
        line.classList.add('active');
        line.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (index < activeIndex) {
        line.classList.add('past');
      }
    });
    
    lastActiveIndex = activeIndex;
  }
}

function showLoading() {
  loadingEl.style.display = 'flex';
  errorEl.style.display = 'none';
  lyricsEl.style.display = 'none';
}

function hideLoading() {
  loadingEl.style.display = 'none';
}

function showError(message) {
  loadingEl.style.display = 'none';
  lyricsEl.style.display = 'none';
  errorEl.style.display = 'flex';
  errorEl.querySelector('.error-text').textContent = message;
}

chrome.runtime.onMessage.addListener((request) => {
  if (request.type === 'LYRICS_FETCHED') {
    displayLyrics(request.data);
  } else if (request.type === 'LYRICS_ERROR') {
    showError('Lyrics not found');
  } else if (request.type === 'SONG_DETECTED') {
    try {
      const songId = `${request.data.title}-${request.data.artist}`;
      if (songId !== lastSongId) {
        updateSongInfo(request.data);
        loadLyrics();
      } else {
        currentTime = request.data.currentTime || 0;
      }
    } catch (error) {
      return;
    }
  }
});

initialize();
