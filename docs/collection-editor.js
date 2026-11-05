'use strict';
// GitHub Pages stores previews locally; publishing still requires repository access.
(() => {
  const categories = ['Brand films', 'Products', 'Spaces', 'Presentations', 'People & stories', 'Experiments'];
  const key = `shivad-layout:${location.pathname}`;
  function valid(state) {
    const ids = new Set(window.FILMS.map(film => film.id));
    if (!state || !Array.isArray(state.items) || state.items.length !== ids.size) return false;
    return state.items.every(item => item && ids.delete(item.id) && categories.includes(item.category)
      && typeof item.hidden === 'boolean' && typeof item.featured === 'boolean')
      && state.items.filter(item => item.featured && !item.hidden).length <= 6;
  }
  function load(published) {
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      if (saved?.baseline === JSON.stringify(published) && valid(saved.state)) return saved.state;
    } catch { /* Keep the published collection when storage is unavailable or corrupt. */ }
    return published;
  }
  function save(state, published) {
    if (!valid(state)) throw new Error('The collection is incomplete or contains invalid settings.');
    try { localStorage.setItem(key, JSON.stringify({ baseline: JSON.stringify(published), state })); }
    catch { throw new Error('This browser could not save your layout. Download the layout to keep your edits.'); }
  }
  function reset() {
    try { localStorage.removeItem(key); }
    catch { throw new Error('This browser could not clear the saved preview.'); }
  }
  function exportLayout(state) {
    if (!valid(state)) throw new Error('The collection is incomplete or contains invalid settings.');
    return JSON.stringify({ state, revision: 0, canEdit: false }, null, 2) + '\n';
  }
  window.PagesCollection = { valid, load, save, reset, exportLayout };
})();
