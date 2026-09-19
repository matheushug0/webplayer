// app.js
import * as API from './api.js';

const PAGE_SIZE = 40;

const S = {
  tab: 'live',
  allItems: [],
  categories: [],
  filtered: [],
  page: 1,
  query: '',
  favorites: [],
  hls: null,
  currentItem: null,
};

const $ = id => document.getElementById(id);
const show = el => el.classList.remove('hidden');
const hide = el => el.classList.add('hidden');

// ── Toast ─────────────────────────────────────────────────────
function showToast(msg, type = 'error') {
  const existing = document.getElementById('toast');
  if (existing) existing.remove();
  const t = document.createElement('div');
  t.id = 'toast';
  t.className = 'toast toast-' + type;
  t.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      ${type === 'error'
        ? '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'
        : '<polyline points="20 6 9 17 4 12"/>'}
    </svg>
    <span>${msg}</span>
  `;
  document.body.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('toast-show')));
  setTimeout(() => {
    t.classList.remove('toast-show');
    setTimeout(() => t.remove(), 400);
  }, 4000);
}

// ── Auto-login ────────────────────────────────────────────────
(async () => {
  const u = localStorage.getItem('tv_user');
  const p = localStorage.getItem('tv_pass');
  const s = localStorage.getItem('tv_stream');
  if (!u || !p || !s) return;
  API.configure(s, u, p);
  try {
    const d = await API.auth();
    if (d.user_info?.auth === 1) bootApp(u);
  } catch { /* stay on login */ }
})();

// ── Login ─────────────────────────────────────────────────────
$('login-form').addEventListener('submit', async e => {
  e.preventDefault();
  const btn = $('btn-login');
  btn.disabled = true;
  $('btn-login-text').textContent = 'Entrando…';
  show($('btn-login-spinner'));
  try {
    const user = $('inp-user').value.trim();
    const pass = $('inp-pass').value.trim();
    API.configure('', user, pass);
    const d = await API.auth();
    if (!d.user_info || d.user_info.auth !== 1) throw new Error('Credenciais inválidas');
    const { server_protocol, url, port } = d.server_info;
    const stream = `${server_protocol}://${url}:${port}`;
    API.configure(stream, user, pass);
    localStorage.setItem('tv_user', user);
    localStorage.setItem('tv_pass', pass);
    localStorage.setItem('tv_stream', stream);
    bootApp(user);
  } catch (ex) {
    const msg = ex.message?.includes('401') || ex.message?.includes('inválidas')
      ? 'Usuário ou senha incorretos.'
      : ex.message?.includes('fetch') || ex.message?.includes('network') || ex.message?.includes('Failed')
      ? 'Sem conexão. Verifique sua internet.'
      : ex.message || 'Erro ao conectar. Tente novamente.';
    showToast(msg, 'error');
    console.error('[login error]', ex);
  } finally {
    btn.disabled = false;
    $('btn-login-text').textContent = 'Entrar';
    hide($('btn-login-spinner'));
  }
});

function bootApp(username) {
  hide($('view-login'));
  show($('view-app'));
  $('nav-username').textContent = username;
  $('drawer-username').textContent = username;
  API.getFavorites().then(f => { S.favorites = f || []; });
  initSentinel();
  switchTab('live');
}

function logout() {
  localStorage.clear();
  stopPlayer();
  hide($('view-app'));
  show($('view-login'));
  Object.assign(S, { allItems: [], categories: [], filtered: [], favorites: [], page: 1, query: '' });
}
$('btn-logout').addEventListener('click', logout);
$('btn-drawer-logout').addEventListener('click', () => { closeDrawer(); logout(); });

// ── Navbar scroll ─────────────────────────────────────────────
window.addEventListener('scroll', () => {
  $('navbar').classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ── Search toggle ─────────────────────────────────────────────
const searchWrap  = $('search-wrap');
const searchInput = $('search-input');

$('btn-search').addEventListener('click', () => {
  const open = searchWrap.classList.toggle('expanded');
  if (open) setTimeout(() => searchInput.focus(), 50);
  else resetSearch();
});

searchInput.addEventListener('keydown', e => {
  if (e.key === 'Escape') { searchWrap.classList.remove('expanded'); resetSearch(); }
});

function resetSearch() {
  searchInput.value = '';
  S.query = '';
  renderContent();
}

let _st;
searchInput.addEventListener('input', e => {
  clearTimeout(_st);
  _st = setTimeout(() => {
    S.query = e.target.value.trim().toLowerCase();
    renderContent();
  }, 300);
});

// ── Drawer ────────────────────────────────────────────────────
$('btn-menu').addEventListener('click', openDrawer);
$('btn-drawer-close').addEventListener('click', closeDrawer);
$('drawer-overlay').addEventListener('click', closeDrawer);
function openDrawer()  { $('drawer').classList.add('open'); show($('drawer-overlay')); }
function closeDrawer() { $('drawer').classList.remove('open'); hide($('drawer-overlay')); }

// ── Tabs ──────────────────────────────────────────────────────
document.querySelectorAll('.nav-link').forEach(b =>
  b.addEventListener('click', () => switchTab(b.dataset.tab))
);
document.querySelectorAll('.drawer-btn').forEach(b =>
  b.addEventListener('click', () => { closeDrawer(); switchTab(b.dataset.tab); })
);

async function switchTab(tab) {
  S.tab = tab;
  S.query = '';
  S.page = 1;
  searchInput.value = '';
  searchWrap.classList.remove('expanded');

  document.querySelectorAll('.nav-link, .drawer-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.tab === tab)
  );

  hide($('hero'));
  hide($('grid'));
  hide($('pagination'));
  hide($('empty-msg'));
  $('grid').innerHTML = '';
  $('grid').className = '';
  show($('loader'));
  window.scrollTo(0, 0);

  try {
    if (tab === 'favorites') {
      S.favorites = await API.getFavorites();
      S.allItems = (S.favorites || []).map(f => ({ ...f.payload, _favType: f.content_type, _favId: f.content_id }));
      S.categories = [];
    } else {
      const loaders = {
        live:   [API.getLiveCategories,   API.getLiveStreams],
        movies: [API.getVodCategories,    API.getVodStreams],
        series: [API.getSeriesCategories, API.getSeries],
      };
      const [cats, items] = await Promise.all(loaders[tab].map(fn => fn()));
      S.categories = cats;
      S.allItems   = items;
    }
    renderContent();
  } catch (ex) {
    hide($('loader'));
    $('empty-msg').textContent = 'Erro ao carregar. Tente novamente.';
    show($('empty-msg'));
    console.error(ex);
  }
}

// ── Render dispatcher ─────────────────────────────────────────
function renderContent() {
  hide($('loader'));

  // Search mode → flat paginated grid
  if (S.query) {
    hide($('hero'));
    const results = S.allItems.filter(i => (i.name || '').toLowerCase().includes(S.query));
    S.filtered = results;
    renderSearchGrid(results);
    return;
  }

  // Normal mode → Hero + Carousels (favorites uses flat grid too)
  if (S.tab === 'favorites') {
    hide($('hero'));
    S.filtered = S.allItems;
    renderSearchGrid(S.allItems);
    return;
  }

  renderHeroAndCarousels();
}

// ── Hero + Carousels (lazy render) ───────────────────────────
// Observer shared across all carousels
const _carouselObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const track = entry.target;
    const items = track._pendingItems;
    if (!items) return;
    items.forEach(item => track.appendChild(buildCard(item)));
    delete track._pendingItems;
    obs.unobserve(track);
  });
}, { rootMargin: '400px' });

function renderHeroAndCarousels() {
  const grid = $('grid');
  grid.innerHTML = '';
  grid.className = '';
  hide($('pagination'));
  hide($('empty-msg'));

  // Hero
  const heroItem = [...S.allItems]
    .filter(i => i.stream_icon || i.cover)
    .sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0))
    .slice(0, 20)[Math.floor(Math.random() * 20)] || S.allItems[0];
  if (heroItem) renderHero(heroItem);

  // Group items by category
  const groups = new Map();
  S.allItems.forEach(item => {
    const cid = String(item.category_id);
    if (!groups.has(cid)) groups.set(cid, []);
    groups.get(cid).push(item);
  });

  // Build carousel shells — cards injected lazily on scroll
  const frag = document.createDocumentFragment();
  S.categories.forEach(cat => {
    const items = groups.get(String(cat.category_id));
    if (!items?.length) return;
    frag.appendChild(buildCarousel(cat.category_name.trim(), items));
  });

  grid.appendChild(frag);
  show(grid);
}

function buildCarousel(title, items) {
  const section = document.createElement('div');
  section.className = 'carousel-section';
  section.innerHTML = `
    <div class="carousel-header">
      <div class="carousel-marker"></div>
      <h2 class="carousel-title">${title}</h2>
      <div class="carousel-arrows">
        <button type="button" class="carousel-arrow" data-scroll="-1" aria-label="Rolar ${title} para a esquerda">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <button type="button" class="carousel-arrow" data-scroll="1" aria-label="Rolar ${title} para a direita">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
    </div>
  `;

  const track = document.createElement('div');
  track.className = 'carousel-track';

  // Arrow buttons scroll the track by ~one viewport of cards.
  section.querySelectorAll('.carousel-arrow').forEach(btn => {
    btn.addEventListener('click', () => {
      const dir = parseInt(btn.dataset.scroll, 10);
      const vw = Math.max(track.clientWidth, 1);
      const delta = dir * vw * 0.8;
      if ('scrollBy' in track) {
        track.scrollBy({ left: delta, behavior: 'smooth' });
      } else {
        track.scrollLeft += delta;
      }
    });
  });

  // Store items for lazy injection — don't build DOM yet
  track._pendingItems = items;
  _carouselObserver.observe(track);

  section.appendChild(track);
  return section;
}
function renderHero(item) {
  const hero = $('hero');
  const img  = API.imgUrl(item.stream_icon || item.cover || item.backdrop_path?.[0] || '');
  const rating = parseFloat(item.rating);

  hero.innerHTML = `
    <img class="hero-bg" src="${img}" alt="${item.name || ''}" onerror="this.style.display='none'"/>
    <div class="hero-overlay"></div>
    <div class="hero-content">
      <h1 class="hero-title">${item.name || ''}</h1>
      <div class="hero-meta">
        ${rating ? `<span class="rating">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          ${rating.toFixed(1)}
        </span><span class="dot">•</span>` : ''}
        ${item.releaseDate || item.releasedate ? `<span>${(item.releaseDate || item.releasedate).slice(0,4)}</span><span class="dot">•</span>` : ''}
        ${item.genre ? `<span>${item.genre.split(',')[0].trim()}</span>` : ''}
      </div>
      ${item.plot || item.description ? `<p class="hero-plot">${item.plot || item.description}</p>` : ''}
      <div class="hero-actions">
        <button class="hero-btn-play" data-hero-play>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Assistir
        </button>
        <button class="hero-btn-info" data-hero-info>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Mais info
        </button>
      </div>
    </div>
  `;

  const isSeries = !!(item.series_id) || item._favType === 'series';
  const isLive = item.stream_type === 'live' || item._favType === 'live' || S.tab === 'live';

  const heroPlay = hero.querySelector('[data-hero-play]');
  const heroInfo = hero.querySelector('[data-hero-info]');
  heroPlay.addEventListener('click', () => {
    if (isSeries) return openSeriesModal(item);
    openPlayerModal(item);
  });
  if (isLive) { heroInfo.classList.add('hidden'); }
  else heroInfo.addEventListener('click', () => onCardClick(item));
  show(hero);
}

// ── Search grid (flat paginated) ──────────────────────────────
function renderSearchGrid(items) {
  const grid = $('grid');
  grid.innerHTML = '';
  grid.className = 'search-grid';
  hide($('pagination'));

  if (!items.length) { show($('empty-msg')); return; }
  hide($('empty-msg'));

  const pages = Math.ceil(items.length / PAGE_SIZE);
  S.page = Math.min(S.page, pages);
  const slice = items.slice((S.page - 1) * PAGE_SIZE, S.page * PAGE_SIZE);

  const frag = document.createDocumentFragment();
  slice.forEach((item, i) => {
    const card = buildCard(item);
    card.style.animationDelay = `${i * 0.02}s`;
    frag.appendChild(card);
  });
  grid.appendChild(frag);
  show(grid);

  if (!S.query && pages > 1) {
    $('page-info').textContent = `${S.page} / ${pages}`;
    $('btn-prev').disabled = S.page <= 1;
    $('btn-next').disabled = S.page >= pages;
    show($('pagination'));
  }
}

// Infinite scroll for search
let _sentinelObserver;
function initSentinel() {
  const sentinel = $('scroll-sentinel');
  if (!sentinel) return;
  _sentinelObserver = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting || !S.query) return;
    const pages = Math.ceil(S.filtered.length / PAGE_SIZE);
    if (S.page >= pages) return;
    S.page++;
    renderSearchGrid(S.filtered);
  }, { rootMargin: '300px' });
  _sentinelObserver.observe(sentinel);
}

$('btn-prev').addEventListener('click', () => { S.page--; renderSearchGrid(S.filtered); window.scrollTo(0,0); });
$('btn-next').addEventListener('click', () => { S.page++; renderSearchGrid(S.filtered); window.scrollTo(0,0); });

// ── Card ──────────────────────────────────────────────────────
function buildCard(item) {
  const card = document.createElement('div');
  card.className = 'card';

  const wrap = document.createElement('div');
  wrap.className = 'card-img-wrap';

  const img = document.createElement('img');
  img.className = 'card-img';
  img.loading = 'lazy';
  img.alt = item.name || '';
  img.src = API.imgUrl(item.stream_icon || item.cover || '');
  img.onerror = () => img.classList.add('no-img');

  const play = document.createElement('div');
  play.className = 'card-play';
  play.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;

  wrap.append(img, play);

  const footer = document.createElement('div');
  footer.className = 'card-footer';

  const title = document.createElement('span');
  title.className = 'card-title';
  title.textContent = item.name || '';

  const rating = parseFloat(item.rating);
  const meta = document.createElement('div');
  meta.className = 'card-meta';
  if (rating) {
    meta.innerHTML = `
      <span class="card-star"><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></span>
      <span class="card-rating">${rating.toFixed(1)}</span>
    `;
  }

  footer.append(title, meta);
  card.append(wrap, footer);

  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', item.name || '');
  card.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    onCardClick(item);
  });
  card.addEventListener('click', () => onCardClick(item));
  return card;
}

// ── Card click ────────────────────────────────────────────────
function onCardClick(item) {
  if (!!(item.series_id) || item._favType === 'series') return openSeriesModal(item);
  const type = item.stream_type || item._favType || (S.tab === 'live' ? 'live' : 'movie');
  if (type === 'live') return openPlayerModal(item);
  openInfoModal(item);
}

// ── Player Modal ──────────────────────────────────────────────
function openPlayerModal(item) {
  S.currentItem = item;
  const type = item.stream_type || item._favType || (S.tab === 'live' ? 'live' : 'movie');
  const id   = item.stream_id || item._favId;
  const ext  = item.container_extension || 'mp4';

  $('modal-meta').textContent  = [item.genre, item.releaseDate || item.releasedate, item.duration].filter(Boolean).join(' · ');
  $('modal-plot').textContent  = item.plot || item.description || '';

  hide($('epg-wrap'));
  $('epg-list').innerHTML = '';
  $('player-topbar-title').textContent = item.name || '';
  show($('player-modal'));
  document.body.classList.add('modal-open');
  playStream(API.streamUrl(type, id, ext));
  if (type === 'live') loadEpg(id);
}

$('btn-modal-close').addEventListener('click', closePlayerModal);
$('modal-backdrop').addEventListener('click', closePlayerModal);
function closePlayerModal() {
  stopPlayer();
  hide($('player-modal'));
  document.body.classList.remove('modal-open');
}

// ── Cast (Remote Playback API) ───────────────────────────────
const castBtn = $('btn-cast');
const videoEl = $('video-el');

if ('remote' in HTMLVideoElement.prototype) {
  castBtn.style.display = '';
  castBtn.addEventListener('click', () => {
    videoEl.remote.prompt().catch(() => {});
  });
  videoEl.remote.watchAvailability(available => {
    castBtn.style.display = available ? '' : 'none';
  }).catch(() => { castBtn.style.display = 'none'; });
}

// ── Info Modal (filmes) ───────────────────────────────────────
function openInfoModal(item) {
  S.currentItem = item;
  const id  = item.stream_id || item._favId;
  const img = API.imgUrl(item.backdrop_path?.[0] || item.stream_icon || item.cover || '');
  $('info-banner-img').src = img;
  $('info-title').textContent = item.name || '';
  $('info-meta').textContent  = [item.genre, item.releaseDate || item.releasedate, item.rating ? '★ ' + parseFloat(item.rating).toFixed(1) : ''].filter(Boolean).join(' · ');
  $('info-plot').textContent  = item.plot || item.description || '';
  updateFavBtn($('btn-info-fav'), $('info-fav-icon'), id);
  show($('info-modal'));
  document.body.classList.add('modal-open');
}

$('btn-info-close').addEventListener('click', closeInfoModal);
$('info-backdrop').addEventListener('click', closeInfoModal);
function closeInfoModal() { hide($('info-modal')); document.body.classList.remove('modal-open'); }

$('btn-info-play').addEventListener('click', () => {
  const item = S.currentItem;
  hide($('info-modal'));
  openPlayerModal(item);
});

$('btn-info-fav').addEventListener('click', () => toggleFav($('btn-info-fav'), $('info-fav-icon')));

// ── Series Modal ──────────────────────────────────────────────
async function openSeriesModal(item) {
  S.currentItem = item;
  const id  = item.series_id || item._favId;
  const img = API.imgUrl(item.backdrop_path?.[0] || item.cover || item.stream_icon || '');
  $('series-banner-img').src = img;
  $('series-title').textContent = item.name || '';
  $('series-meta').textContent  = [item.genre, item.releaseDate, item.rating ? '★ ' + parseFloat(item.rating).toFixed(1) : ''].filter(Boolean).join(' · ');
  $('series-plot').textContent  = item.plot || '';
  $('seasons-wrap').innerHTML   = '<p class="loading-text">Carregando episódios…</p>';

  updateFavBtn($('btn-series-fav'), $('series-fav-icon'), id);
  show($('series-modal'));
  document.body.classList.add('modal-open');

  try {
    renderSeasons(await API.getSeriesInfo(id));
  } catch {
    $('seasons-wrap').innerHTML = '<p class="error">Erro ao carregar episódios.</p>';
  }
}

// Formata o título cru vindo da API:
//   "8. Clássico Americano 2026 - S01E08 - Nossa Cidade" → "Nossa Cidade"
//   "12. Título aqui"                                    → "Título aqui"
function cleanEpisodeTitle(raw) {
  let t = String(raw || '').trim().replace(/\s+/g, ' ');
  if (!t) return '';
  t = t.replace(/^\s*\d+\s*[.\-–—:)]+\s*/, '');
  const se = t.match(/\bS\d{1,2}E\d{1,4}\b/i);
  if (se) {
    const after = t.slice(t.lastIndexOf(se[0]) + se[0].length).replace(/^[\s\-–—:.]*/, '').trim();
    if (after) return after;
  }
  return t;
}

function episodeThumb() {
  const it = S.currentItem || {};
  const src = it.backdrop_path?.[0] || it.cover || it.stream_icon || '';
  return API.imgUrl(src);
}

function renderSeasons(info) {
  const wrap = $('seasons-wrap');
  wrap.innerHTML = '';
  const episodes = info.episodes || {};
  const seasons = Object.keys(episodes).sort((a, b) => Number(a) - Number(b));
  if (!seasons.length) { wrap.innerHTML = '<p class="loading-text">Nenhum episódio disponível.</p>'; return; }

  seasons.forEach(season => {
    const details = document.createElement('details');
    details.open = seasons.length === 1;
    const summary = document.createElement('summary');
    summary.textContent = `Temporada ${season}`;
    details.appendChild(summary);
    const ul = document.createElement('ul');
    ul.className = 'episode-list';
    episodes[season].forEach(ep => {
      const num = ep.episode_num != null ? ep.episode_num : ep.num;
      const isPlaying = S.lastSeriesEpId != null && String(ep.id) === String(S.lastSeriesEpId);

      const li = document.createElement('li');
      li.className = 'episode-item' + (isPlaying ? ' playing' : '');
      li.setAttribute('role', 'button');
      li.setAttribute('tabindex', '0');

      const thumb = document.createElement('div');
      thumb.className = 'episode-thumb';
      const thumbSrc = episodeThumb();
      if (thumbSrc) {
        const img = document.createElement('img');
        img.src = thumbSrc;
        img.alt = '';
        img.loading = 'lazy';
        thumb.appendChild(img);
      } else {
        const no = document.createElement('span');
        no.className = 'no-thumb';
        no.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>';
        thumb.appendChild(no);
      }

      const body = document.createElement('div');
      body.className = 'episode-body';
      const head = document.createElement('div');
      head.className = 'episode-body-head';
      const numEl = document.createElement('span');
      numEl.className = 'episode-num';
      numEl.textContent = `Episódio ${num}`;
      head.appendChild(numEl);
      if (isPlaying) {
        const now = document.createElement('span');
        now.className = 'episode-now';
        head.appendChild(now);
      }
      const nameEl = document.createElement('span');
      nameEl.className = 'episode-name';
      nameEl.textContent = cleanEpisodeTitle(ep.title || ep.name || '') || 'Sem título';
      body.appendChild(head);
      body.appendChild(nameEl);

      li.appendChild(thumb);
      li.appendChild(body);

      const play = () => {
        S.lastSeriesEpId = ep.id;
        closeSeriesModal();
        openPlayerModal({ ...ep, stream_type: 'series', stream_id: ep.id, name: `${info.info?.name || ''} S${season}E${num}` });
      };
      li.addEventListener('click', play);
      li.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(); }
      });
      ul.appendChild(li);
    });
    details.appendChild(ul);
    wrap.appendChild(details);
  });
}

$('btn-series-close').addEventListener('click', closeSeriesModal);
$('series-backdrop').addEventListener('click', closeSeriesModal);
function closeSeriesModal() { hide($('series-modal')); document.body.classList.remove('modal-open'); }

// ── EPG ───────────────────────────────────────────────────────
async function loadEpg(streamId) {
  try {
    const data = await API.getShortEpg(streamId);
    const listings = data.epg_listings || [];
    if (!listings.length) return;
    const ul = $('epg-list');
    ul.innerHTML = '';
    const now = Date.now();
    listings.forEach(ep => {
      const decodeB64 = s => { try { return decodeURIComponent(atob(s).split('').map(c => '%' + c.charCodeAt(0).toString(16).padStart(2,'0')).join('')); } catch { return s; } };
      const title = ep.title ? decodeB64(ep.title) : '';
      const desc  = ep.description ? decodeB64(ep.description) : '';
      const start = new Date(ep.start).getTime();
      const end   = new Date(ep.end).getTime();
      const isNow = ep.now_playing || (now >= start && now < end);
      const progress = isNow ? Math.min(100, Math.round((now - start) / (end - start) * 100)) : 0;
      const startStr = ep.start.slice(11, 16);
      const endStr   = ep.end.slice(11, 16);
      const li = document.createElement('li');
      li.className = 'epg-item' + (isNow ? ' epg-now' : '');
      li.innerHTML = `
        <div class="epg-time">
          <span class="epg-start">${startStr}</span>
          <span class="epg-end">${endStr}</span>
        </div>
        <div class="epg-body">
          ${isNow ? '<span class="epg-live-badge">AO VIVO</span>' : ''}
          <span class="epg-title">${title}</span>
          ${desc ? `<span class="epg-desc">${desc}</span>` : ''}
          ${isNow ? `<div class="epg-progress"><div class="epg-progress-bar" style="width:${progress}%"></div></div>` : ''}
        </div>
      `;
      ul.appendChild(li);
    });
    show($('epg-wrap'));
  } catch { /* optional */ }
}

// ── Favorites ─────────────────────────────────────────────────
function updateFavBtn(btn, icon, id) {
  const isFav = S.favorites.some(f => String(f.content_id) === String(id));
  btn.dataset.id = id;
  btn.classList.toggle('active', isFav);
  if (icon) icon.setAttribute('fill', isFav ? 'currentColor' : 'none');
}

async function toggleFav(btn, icon) {
  const id   = btn.dataset.id;
  const item = S.currentItem;
  const type = item.stream_type || item._favType || (item.series_id ? 'series' : 'movie');
  const isFav = S.favorites.some(f => String(f.content_id) === String(id));
  try {
    if (isFav) {
      await API.removeFavorite(id, type);
      S.favorites = S.favorites.filter(f => String(f.content_id) !== String(id));
    } else {
      await API.addFavorite(id, type, item);
      S.favorites.push({ content_id: String(id), content_type: type, payload: item });
    }
    updateFavBtn(btn, icon, id);
  } catch { /* ignore */ }
}

$('btn-series-fav').addEventListener('click', () => toggleFav($('btn-series-fav'), $('series-fav-icon')));

// ── Player ────────────────────────────────────────────────────
function playStream(url) {
  stopPlayer();
  const video = $('video-el');
  if (url.includes('.m3u8') && Hls.isSupported()) {
    S.hls = new Hls({ maxBufferLength: 60, maxMaxBufferLength: 120, lowLatencyMode: false });
    S.hls.loadSource(url);
    S.hls.attachMedia(video);
    S.hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
  } else {
    video.src = url;
    video.play().catch(() => {});
  }
}

function stopPlayer() {
  if (S.hls) { S.hls.destroy(); S.hls = null; }
  const v = $('video-el');
  v.pause(); v.src = ''; v.load();
}

// ── Player controls (overlay estilo Theater Mode) ─────────────
const playerStage = document.querySelector('.player-stage');
const centerPlay  = $('btn-center-play');
const iconPlay = $('icon-play');
const iconPause = $('icon-pause');
const iconVol  = $('icon-vol');
const iconMute = $('icon-mute');
const iconFull = $('icon-full');
const iconShrink = $('icon-shrink');

function fmtTime(s) {
  if (!isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}

// hls.js (MSE) mantém video.duration = Infinity mesmo em VOD, então
// tiramos a duração real do manifest hls ou do range seekable.
function getPlayerDuration() {
  const v = $('video-el');
  if (isFinite(v.duration) && v.duration > 0) return v.duration;
  const isVod = !isLiveStream(); // filme/série via Xtream = contexto VOD
  if (S.hls && S.hls.levels && S.hls.levels[0] && S.hls.levels[0].details) {
    const d = S.hls.levels[0].details;
    // Em VOD o totalduration é a duração real do manifest mesmo quando o
    // servidor o marca como live (fake-live comum em servidores Xtream/IPTV).
    if (d.totalduration > 0 && (isVod || !d.live)) return d.totalduration;
  }
  if (v.seekable && v.seekable.length && isFinite(v.seekable.end(v.seekable.length - 1))) {
    return v.seekable.end(v.seekable.length - 1);
  }
  return 0;
}

function isLiveStream() {
  const it = S.currentItem || {};
  const t = it.stream_type || it._favType;
  if (t === 'live') return true;
  // Filmes e séries são VOD por definição: mesmo que o servidor sirva o
  // manifest com flag live (comum em Xtream/IPTV que embrulha VOD),
  // mostramos tempo total e progresso usando o totalduration do hls.
  if (t === 'movie' || t === 'series') return false;
  switch (S.tab) {
    case 'movies': case 'series': case 'favorites': return false;
  }
  if ((it._favType === 'movie' || it._favType === 'series') && it.stream_type !== 'live') return false;
  if (S.hls && S.hls.levels && S.hls.levels[0] && S.hls.levels[0].details) {
    return !!S.hls.levels[0].details.live;
  }
  return S.tab === 'live';
}

function updatePlayerUI() {
  const v = $('video-el');
  const s = playerStage;
  if (s && s.classList) {
    if (v.paused) s.classList.add('paused');
    else s.classList.remove('paused');
  }
  if (v.paused) {
    show(centerPlay);
    show(iconPlay); hide(iconPause);
    playerStage.classList.add('paused');
  } else {
    hide(centerPlay);
    show(iconPause); hide(iconPlay);
    playerStage.classList.remove('paused');
  }
  const live = isLiveStream();
  const dur  = live ? 0 : getPlayerDuration();
  const timeEl = $('player-time');
  const fill = $('player-progress-fill');
  if (live) {
    timeEl.classList.add('live');
    timeEl.textContent = `● AO VIVO · ${fmtTime(v.currentTime)}`;
    fill.style.width = '0%';
  } else {
    timeEl.classList.remove('live');
    timeEl.textContent = `${fmtTime(v.currentTime)} / ${fmtTime(dur)}`;
    const pct = dur ? Math.min(100, (v.currentTime / dur) * 100) : 0;
    fill.style.width = `${pct}%`;
  }
  $('player-progress').setAttribute('aria-valuenow', Math.round(v.currentTime));
}

function togglePlay() {
  const v = $('video-el');
  if (v.paused) v.play().catch(() => {});
  else v.pause();
}

function flashOverlay() {
  playerStage.classList.toggle('show-overlay');
}

$('video-el').addEventListener('click', () => {
  if ($('video-el').paused) togglePlay();
  else flashOverlay();
});
centerPlay.addEventListener('click', () => togglePlay());
$('btn-play').addEventListener('click', togglePlay);
$('btn-back').addEventListener('click', () => { $('video-el').currentTime = Math.max(0, $('video-el').currentTime - 10); });
$('btn-fwd').addEventListener('click', () => {
  const v = $('video-el');
  const dur = getPlayerDuration();
  v.currentTime = Math.min(dur || v.currentTime, v.currentTime + 10);
});

$('player-progress').addEventListener('click', e => {
  const v = $('video-el');
  const dur = getPlayerDuration();
  if (!dur) return;
  const rect = $('player-progress').getBoundingClientRect();
  const target = ((e.clientX - rect.left) / rect.width) * dur;
  let max = dur;
  if (v.seekable && v.seekable.length) max = Math.min(max, v.seekable.end(v.seekable.length - 1));
  v.currentTime = Math.min(Math.max(0, target), max);
});

$('btn-mute').addEventListener('click', () => {
  const v = $('video-el');
  v.muted = !v.muted;
  if (v.muted) { show(iconMute); hide(iconVol); } else { show(iconVol); hide(iconMute); }
});

$('btn-full').addEventListener('click', () => {
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  else playerStage.requestFullscreen().catch(() => {});
});
document.addEventListener('fullscreenchange', () => {
  if (document.fullscreenElement) { show(iconShrink); hide(iconFull); }
  else { show(iconFull); hide(iconShrink); }
});

$('video-el').addEventListener('play', updatePlayerUI);
$('video-el').addEventListener('pause', updatePlayerUI);
$('video-el').addEventListener('timeupdate', updatePlayerUI);
$('video-el').addEventListener('ended', updatePlayerUI);
$('video-el').addEventListener('loadedmetadata', updatePlayerUI);

document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (!$('player-modal').classList.contains('hidden')) closePlayerModal();
  else if (!$('info-modal').classList.contains('hidden')) closeInfoModal();
  else if (!$('series-modal').classList.contains('hidden')) closeSeriesModal();
});
