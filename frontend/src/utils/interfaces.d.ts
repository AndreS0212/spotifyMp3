export interface Video {
  title: string;
  duration: string;
  channel: string;
  thumbnail: string;
  url: string;
}

export interface SpotifyInfo {
  videos: Video[];
  playlistName: string;
  playlistId: string;
}

export interface SpotifyUrlsInfo {
  playlistId: string;
  url: string;
  youtubeUrl: string;
}

export interface urls {
  youtubeUrl: string;
  url: string;
}
