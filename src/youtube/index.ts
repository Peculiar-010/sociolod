export { YouTubeSearchClient } from "./search.js";
export { YouTubeDownloadClient } from "./download.js";

import { SociolodClient } from "../client.js";

const _defaultClient = new SociolodClient();

export const ytSearch = _defaultClient.youtube.search.search.bind(_defaultClient.youtube.search);
export const ytVideo = _defaultClient.youtube.search.video.bind(_defaultClient.youtube.search);
export const ytRandom = _defaultClient.youtube.search.random.bind(_defaultClient.youtube.search);
export const ytThumb = _defaultClient.youtube.search.thumb.bind(_defaultClient.youtube.search);
export const ytLinks = _defaultClient.youtube.search.links.bind(_defaultClient.youtube.search);
export const ytTitles = _defaultClient.youtube.search.titles.bind(_defaultClient.youtube.search);
export const ytChannel = _defaultClient.youtube.search.channel.bind(_defaultClient.youtube.search);
export const ytInfo = _defaultClient.youtube.download.info.bind(_defaultClient.youtube.download);
export const ytDownloadUrl = _defaultClient.youtube.download.url.bind(_defaultClient.youtube.download);
export const ytStream = _defaultClient.youtube.download.stream.bind(_defaultClient.youtube.download);
export const ytDownload = _defaultClient.youtube.download.download.bind(_defaultClient.youtube.download);
