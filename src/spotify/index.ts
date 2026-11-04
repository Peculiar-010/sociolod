export { SpotifySearchClient } from "./search.js";
export { SpotifyDownloadClient } from "./download.js";

// ─── Standalone tree-shakeable functions ─────────────────────────────────────

import { SociolodClient } from "../client.js";

const _defaultClient = new SociolodClient();

/** Standalone: search Spotify */
export const spotSearch = _defaultClient.spotify.search.search.bind(
  _defaultClient.spotify.search,
);

/** Standalone: get a single Spotify track */
export const spotSong = _defaultClient.spotify.search.song.bind(
  _defaultClient.spotify.search,
);

/** Standalone: get a random Spotify track */
export const spotRandom = _defaultClient.spotify.search.random.bind(
  _defaultClient.spotify.search,
);

/** Standalone: get Spotify album cover */
export const spotCover = _defaultClient.spotify.search.cover.bind(
  _defaultClient.spotify.search,
);

/** Standalone: get Spotify track links */
export const spotLinks = _defaultClient.spotify.search.links.bind(
  _defaultClient.spotify.search,
);

/** Standalone: get Spotify artist info */
export const spotArtist = _defaultClient.spotify.search.artist.bind(
  _defaultClient.spotify.search,
);

/** Standalone: get Spotify track info */
export const spotInfo = _defaultClient.spotify.download.info.bind(
  _defaultClient.spotify.download,
);

/** Standalone: get Spotify track preview */
export const spotPreview = _defaultClient.spotify.download.preview.bind(
  _defaultClient.spotify.download,
);

/** Standalone: match Spotify track to YouTube */
export const spotMatch = _defaultClient.spotify.download.match.bind(
  _defaultClient.spotify.download,
);

/** Standalone: get Spotify download URL */
export const spotDownloadUrl = _defaultClient.spotify.download.url.bind(
  _defaultClient.spotify.download,
);

/** Standalone: stream Spotify media */
export const spotStream = _defaultClient.spotify.download.stream.bind(
  _defaultClient.spotify.download,
);

/** Standalone: download Spotify media to disk */
export const spotDownload = _defaultClient.spotify.download.download.bind(
  _defaultClient.spotify.download,
);
