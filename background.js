let currentSongData = null;
let currentLyrics = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'SONG_DETECTED') {
    currentSongData = request.data;
    fetchLyrics(request.data);
  } else if (request.type === 'TIME_UPDATE') {
    currentSongData = { ...currentSongData, ...request.data };
  } else if (request.type === 'GET_CURRENT_SONG') {
    sendResponse({ 
      song: currentSongData, 
      lyrics: currentLyrics 
    });
  } else if (request.type === 'FETCH_LYRICS') {
    fetchLyrics(request.data).then(lyrics => {
      sendResponse({ lyrics });
    });
    return true;
  }
});

async function fetchLyrics(songData) {
  try {
    const { title, artist, duration } = songData;
    
    const durationInSeconds = duration ? parseDuration(duration) : null;
    
    const params = new URLSearchParams({
      artist_name: artist,
      track_name: title
    });
    
    if (durationInSeconds) {
      params.append('duration', durationInSeconds);
    }

    const response = await fetch(`https://lrclib.net/api/get?${params}`);
    
    if (!response.ok) {
      throw new Error('Lyrics not found');
    }

    const data = await response.json();
    
    currentLyrics = {
      syncedLyrics: data.syncedLyrics,
      plainLyrics: data.plainLyrics,
      title: data.trackName,
      artist: data.artistName
    };

    chrome.runtime.sendMessage({
      type: 'LYRICS_FETCHED',
      data: currentLyrics
    });

    return currentLyrics;
  } catch (error) {
    currentLyrics = null;
    chrome.runtime.sendMessage({
      type: 'LYRICS_ERROR',
      error: error.message
    });
    return null;
  }
}

function parseDuration(durationStr) {
  const parts = durationStr.split(':');
  if (parts.length === 2) {
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  }
  return null;
}
