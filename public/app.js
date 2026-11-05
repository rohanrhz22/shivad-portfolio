'use strict';
(() => {
  let films = [];
  const $ = selector => document.querySelector(selector);
  const categories = ['All films', 'Brand films', 'Products', 'Spaces', 'Presentations', 'People & stories', 'Experiments'];
  const featuredIds = window.PORTFOLIO_FEATURED || [];
  let featured = [];
  let selectedCategory = 'All films', visibleCount = 12, filtered = [...films], playlist = [], currentIndex = 0, opener = null;
  const dialog = $('#player');
  document.querySelectorAll('[data-total]').forEach(el => el.textContent = films.length);
  function card(film, index, collection) {
    const button = document.createElement('button');
    button.className = 'film-card';
    button.type = 'button';
    button.setAttribute('aria-label', `Watch ${film.title}, ${film.category}`);
    const picture = document.createElement('div'); picture.className = 'film-image';
    const img = document.createElement('img'); img.src = film.image; img.alt = ''; img.loading = 'lazy'; img.decoding = 'async';
    img.addEventListener('error', () => picture.classList.add('image-fallback'), {once:true});
    const number = document.createElement('span'); number.className = 'film-number'; number.textContent = String(index + 1).padStart(2,'0');
    const play = document.createElement('span'); play.className = 'card-play'; play.textContent = '▶'; play.setAttribute('aria-hidden','true');
    picture.append(img, number, play);
    const meta = document.createElement('div'); meta.className = 'film-meta';
    const copy = document.createElement('div');
    const title = document.createElement('h3'); title.textContent = film.title;
    const category = document.createElement('p'); category.textContent = collection === 'featured' ? film.category : `${film.category} · ${film.sourceLabel}`;
    const arrow = document.createElement('span'); arrow.textContent = '↗'; arrow.setAttribute('aria-hidden','true');
    copy.append(title, category); meta.append(copy, arrow); button.append(picture, meta);
    button.addEventListener('click', () => openPlayer(film, collection === 'featured' ? featured : filtered, button));
    return button;
  }
  function refresh(state) {
    const originals = new Map(window.FILMS.map(f=>[f.id,f]));
    const items = state?.items || window.FILMS.map(f=>({id:f.id,category:f.category,hidden:false,featured:featuredIds.includes(f.id)}));
    films = items.filter(x=>!x.hidden && originals.has(x.id)).map(x=>({...originals.get(x.id),category:x.category,featured:x.featured}));
    featured=films.filter(f=>f.featured).slice(0,6);
    $('#featured-grid').replaceChildren(...featured.map((film,i)=>card(film,i,'featured')));
    $('#work').hidden = !featured.length;
    document.querySelectorAll('[data-total]').forEach(el=>el.textContent=films.length);
    $('#filters').replaceChildren();
    for(const category of categories) {
      const count=category==='All films'?films.length:films.filter(f=>f.category===category).length;
      const button=document.createElement('button'); button.type='button'; button.dataset.category=category;
      button.textContent=category; const sup=document.createElement('sup');sup.textContent=count;button.append(sup);
      button.addEventListener('click',()=>{selectedCategory=category;visibleCount=12;render();});
      $('#filters').append(button);
    }
    render();
  }
  window.refreshPortfolio=refresh;
  function render() {
    const query = $('#search').value.trim().toLocaleLowerCase();
    const source = $('#source').value;
    filtered = films.filter(f => (selectedCategory === 'All films' || f.category === selectedCategory) && (source === 'all' || f.source === source) && (!query || `${f.title} ${f.originalTitle} ${f.category} ${f.sourceLabel}`.toLocaleLowerCase().includes(query)));
    $('#archive-grid').replaceChildren(...filtered.slice(0,visibleCount).map((film,index) => card(film,index,'archive')));
    $('#result-status').textContent = `Showing ${Math.min(visibleCount,filtered.length)} of ${filtered.length} videos${filtered.length !== films.length ? ` · ${films.length} in the collection` : ''}`;
    $('#empty').hidden = filtered.length !== 0;
    $('#load-more').hidden = visibleCount >= filtered.length;
    $('#show-all').hidden = visibleCount >= filtered.length;
    $('#reset').hidden = !query && source === 'all' && selectedCategory === 'All films';
    document.querySelectorAll('[data-category]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.category === selectedCategory)));
  }
  function reset() {selectedCategory = 'All films'; visibleCount = 12; $('#search').value = ''; $('#source').value = 'all'; render();}
  $('#search').addEventListener('input', () => {visibleCount=12; render();});
  $('#source').addEventListener('change', () => {visibleCount=12; render();});
  $('#reset').addEventListener('click', reset); $('#empty-reset').addEventListener('click', reset);
  function expand(all) {
    const previousCount = visibleCount; visibleCount = all ? filtered.length : visibleCount + 12; render();
    const firstNewCard = $('#archive-grid').children[previousCount]; if (firstNewCard) firstNewCard.focus({preventScroll:true});
  }
  $('#load-more').addEventListener('click', () => expand(false)); $('#show-all').addEventListener('click', () => expand(true));
  function openPlayer(film, collection, trigger) {
    opener = trigger; playlist = [...collection]; currentIndex = playlist.findIndex(f => f.id === film.id);
    if (currentIndex < 0) {playlist = [film]; currentIndex = 0;}
    updatePlayer(); dialog.showModal(); $('#close-player').focus();
  }
  function updatePlayer() {
    const film = playlist[currentIndex];
    $('#player-title').textContent = film.title; $('#player-category').textContent = film.category;
    $('#player-original').textContent = `Original: ${film.originalTitle}`;
    $('#original-link').href = film.url;
    $('#playback-note').textContent = `Playback via ${film.platform === 'youtube' ? 'YouTube' : 'Google Drive'}. If it doesn’t load, open the original.`;
    const iframe = document.createElement('iframe');
    iframe.title = film.title;
    iframe.src = film.platform === 'youtube' ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(film.id)}?autoplay=1&rel=0` : `https://drive.google.com/file/d/${encodeURIComponent(film.id)}/preview`;
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    $('#player-frame').replaceChildren(iframe);
    $('#previous').disabled = currentIndex === 0; $('#next').disabled = currentIndex === playlist.length - 1;
  }
  $('#close-player').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => {if(e.target === dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('close', () => {$('#player-frame').replaceChildren(); if(opener?.isConnected) opener.focus({preventScroll:true});});
  $('#previous').addEventListener('click', () => {if(currentIndex > 0){currentIndex--;updatePlayer();}});
  $('#next').addEventListener('click', () => {if(currentIndex < playlist.length - 1){currentIndex++;updatePlayer();}});
  $('#result-status').textContent='Loading the collection…';
  fetch(document.documentElement.dataset.collectionUrl || '/api/portfolio',{cache:'no-store'}).then(async response=>{
    if(!response.ok) throw new Error('Could not load collection');
    const data=await response.json();
    if (document.documentElement.dataset.pagesEditor === 'true') {
      window.publishedPortfolioData = structuredClone(data);
      data.state = window.PagesCollection.load(data.state);
    }
    window.portfolioData=data; refresh(data.state);
    const manageButton = $('#manage-open');
    if (manageButton) manageButton.hidden=!(data.canEdit || document.documentElement.dataset.pagesEditor === 'true');
    window.dispatchEvent(new Event('portfolio-ready'));
  }).catch(()=>{ $('#collection-error').hidden=false; $('#result-status').textContent='The collection is temporarily unavailable.'; $('#load-more').hidden=true; $('#show-all').hidden=true; });
})();
