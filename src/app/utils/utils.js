

export async function fetchVideoTitle(videoUrl) {
  try {
    const videoId = getVideoIdFromUrl(videoUrl);
    const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    const videoData = await response.json();
    const videoTitle = videoData.title;
    return videoTitle;
  } catch (error) {
    console.error(error);
  }
}

export const getVideoIdFromUrl = (url) => {
    const regex = /(?:\?v=|\/embed\/|\/v\/|\.be\/)([^&?#]+)/;
    const match = url.match(regex);
    if (match && match[1]) {
      return match[1];
    }
    return null;
  };

export const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const formattedHours = hours.toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = remainingSeconds.toFixed(2).toString().padStart(2, '0');

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

export const reformatDuration = (durationString) => {
  const [hours, minutes, seconds] = durationString.split(':').map(Number);
  const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
  return totalSeconds;
};

export const handler = (callback)=>{
  callback();
}