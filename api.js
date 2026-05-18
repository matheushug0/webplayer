// api.js — Xtream Codes API with IndexedDB cache
import { cacheGet, cacheSet } from './db.js';

const CACHE_TTL = 3600; // 1 hour

const API_BASE = 'http://webnewtvs.top/api/player_api.php';
// Favorites stored in localStorage — no CORS issues

const RAILWAY_PROXY = 'https://proxy.fluiconnect.com.br';

function proxyUrl(url) {
  if (location.protocol === 'https:' && url.startsWith('http:')) {
    return RAILWAY_PROXY + '?url=' + encodeURIComponent(url);
  }
  return url;
}

export function imgUrl(url) {
  if (!url) return '';
  return proxyUrl(url);
}

let _streamBase = '';
let _user = '';
let _pass = '';

export function configure(streamServerUrl, username, password) {
  _streamBase = streamServerUrl;
  _user = username;
  _pass = password;
}

async function xtream(params, forceBase) {
  const base = forceBase || (_streamBase ? _streamBase + '/player_api.php' : API_BASE);
  const url = new URL(base);
  url.searchParams.set('username', _user);
  url.searchParams.set('password', _pass);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const r = await fetch(proxyUrl(url.toString()));
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

async function cached(key, fetcher) {
  const hit = await cacheGet(key, CACHE_TTL);
  if (hit) return hit;
  const data = await fetcher();
  await cacheSet(key, data);
  return data;
}

export async function auth() {
  const base = _streamBase ? _streamBase + '/player_api.php' : API_BASE;
  const url = new URL(base);
  url.searchParams.set('username', _user);
  url.searchParams.set('password', _pass);
  const r = await fetch(proxyUrl(url.toString()));
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

// Tabs — cached per user to avoid re-downloading MBs
export function getLiveCategories()   { return cached(`${_user}:live_cats`,    () => xtream({ action: 'get_live_categories' })); }
export function getLiveStreams()       { return cached(`${_user}:live_streams`, () => xtream({ action: 'get_live_streams' })); }
export function getVodCategories()    { return cached(`${_user}:vod_cats`,     () => xtream({ action: 'get_vod_categories' })); }
export function getVodStreams()        { return cached(`${_user}:vod_streams`,  () => xtream({ action: 'get_vod_streams' })); }
export function getSeriesCategories() { return cached(`${_user}:series_cats`,  () => xtream({ action: 'get_series_categories' })); }
export function getSeries()           { return cached(`${_user}:series`,       () => xtream({ action: 'get_series' })); }

// Series info (seasons + episodes) — cached per series
export function getSeriesInfo(seriesId) {
  return cached(`${_user}:series_info:${seriesId}`, () => xtream({ action: 'get_series_info', series_id: seriesId }));
}

// EPG — short TTL (15 min), changes frequently
export async function getShortEpg(streamId) {
  const key = `${_user}:epg:${streamId}`;
  const hit = await cacheGet(key, 900);
  if (hit) return hit;
  const data = await xtream({ action: 'get_short_epg', stream_id: streamId });
  await cacheSet(key, data);
  return data;
}

// Favorites — localStorage
function favKey() { return `tv_favs_${_user}`; }

export function getFavorites() {
  try { return Promise.resolve(JSON.parse(localStorage.getItem(favKey()) || '[]')); }
  catch { return Promise.resolve([]); }
}

export function addFavorite(contentId, contentType, payload) {
  try {
    const favs = JSON.parse(localStorage.getItem(favKey()) || '[]');
    if (!favs.some(f => String(f.content_id) === String(contentId))) {
      favs.push({ content_id: String(contentId), content_type: contentType, payload });
      localStorage.setItem(favKey(), JSON.stringify(favs));
    }
  } catch {}
  return Promise.resolve();
}

export function removeFavorite(contentId) {
  try {
    const favs = JSON.parse(localStorage.getItem(favKey()) || '[]');
    localStorage.setItem(favKey(), JSON.stringify(favs.filter(f => String(f.content_id) !== String(contentId))));
  } catch {}
  return Promise.resolve();
}

// Stream URLs — direct to stream server (not proxied, media doesn't need CORS)
export function streamUrl(type, id, ext) {
  const base = _streamBase;
  let url;
  if (type === 'live')        url = `${base}/live/${_user}/${_pass}/${id}.m3u8`;
  else if (type === 'movie')  url = `${base}/movie/${_user}/${_pass}/${id}.m3u8`;
  else                        url = `${base}/series/${_user}/${_pass}/${id}.m3u8`;

  if (location.protocol === 'https:') {
    return RAILWAY_PROXY + '?url=' + encodeURIComponent(url);
  }
  return url;
}
