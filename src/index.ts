export { SpotifySearchClient } from "./search.js";
export { SpotifyDownloadClient } from "./download.js";

import { SociolodClient } from "../client.js";

const _defaultClient = new SociolodClient();

export const spotSearch = _defaultClient.spotify.search.search.bind(_defaultClient.spotify.search);
export const spotSong = _defaultClient.spotify.search.song.bind(_defaultClient.spotify.search);
export const spotRandom = _defaultClient.spotify.search.random.bind(_defaultClient.spotify.search);
export const spotCover = _defaultClient.spotify.search.cover.bind(_defaultClient.spotify.search);
export const spotLinks = _defaultClient.spotify.search.links.bind(_defaultClient.spotify.search);
export const spotArtist = _defaultClient.spotify.search.artist.bind(_defaultClient.spotify.search);
export const spotInfo = _defaultClient.spotify.download.info.bind(_defaultClient.spotify.download);
export const spotPreview = _defaultClient.spotify.download.preview.bind(_defaultClient.spotify.download);
export const spotMatch = _defaultClient.spotify.download.match.bind(_defaultClient.spotify.download);
export const spotDownloadUrl = _defaultClient.spotify.download.url.bind(_defaultClient.spotify.download);
export const spotStream = _defaultClient.spotify.download.stream.bind(_defaultClient.spotify.download);
export const spotDownload = _defaultClient.spotify.download.download.bind(_defaultClient.spotify.download);
