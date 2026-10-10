const articleIndexPath = location.pathname.includes('/M2A/') ? '../news/news-index.json' : 'news/news-index.json';
const articleCacheKey = 'vthockey-news-index-v1';
const articleCacheDuration = 5 * 60 * 1000;
const fallbackArticles = [
  { category: 'GAME RECAP', title: 'Strong Start not Good Enough as Hokies Drop to Lindenwood in First Game of ACHA Fall Faceoff Invitational', summary: 'Hokies fall to 2024 D2 Champs in Lake Placid', date: '2026-09-18', filename: '2026-09-18-vs-lindenwood.md', url: 'article.html?article=2026-09-18-vs-lindenwood.md' },
  { category: 'Article', title: 'Weekend Preview- Hokies Open Season on the Road with Clashes against the Icepack and Tar Heels', summary: 'Opening weekend for Virginia Tech', date: '2026-09-10', filename: '2026-09-10-weekend-preview.md', url: 'article.html?article=2026-09-10-weekend-preview.md' },
  { category: 'Article', title: 'Analyzing the Hokies 2026-27 Season Schedule - Key Matchups and New Destinations to Look Out For!', summary: 'A look at the Hokies\u0027 opponents this season', date: '2026-09-08', filename: '2026-09-08-schedule-outlook.md', url: 'article.html?article=2026-09-08-schedule-outlook.md' }
];
const grid = document.querySelector('.news-grid');
// Smooths in fetched articles that arrive after the page-navigation transition has already settled.
function withViewTransition(update) {
  if (document.startViewTransition) document.startViewTransition(update);
  else update();
}
function parseFrontMatter(markdown, filename) {
  const match = markdown.match(/^---\s*([\s\S]*?)\s*---/);
  const fields = {};
  if (match) match[1].split('\n').forEach(line => { const separator = line.indexOf(':'); if (separator > -1) fields[line.slice(0, separator).trim()] = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, ''); });
  const body = markdown.replace(/^---[\s\S]*?---/, '').replace(/^#\s+[^\n]+/, '').trim().replace(/[*_`]/g, '');
  return { category: fields.category || 'NEWS', title: fields.title || filename.replace(/\.md$/i, '').replace(/[-_]/g, ' '), summary: fields.summary || body.slice(0, 170), author: fields.author || '', date: fields.date || '', image: fields.image || '', filename, url: `article.html?article=${encodeURIComponent(filename)}` };
}
function renderArticles(articles) {
  withViewTransition(() => {
    if (grid) grid.innerHTML = articles.map((article, index) => `<article class="news-card${index === 0 ? ' featured' : ''}">${article.image ? `<img class="news-card-image" src="${article.image}" alt="" />` : ''}<span class="card-number">${String(index + 1).padStart(2, '0')}</span><span class="card-tag">${article.category}</span><h2>${article.title}</h2><p>${article.summary}</p><a class="text-link" href="${article.url || `article.html?article=${encodeURIComponent(article.title)}`}">Read story <span>↗</span></a></article>`).join('');
  });
  window.dispatchEvent(new CustomEvent('news:updated', { detail: articles }));
}
function readArticleCache() {
  try {
    const cached = JSON.parse(localStorage.getItem(articleCacheKey) || 'null');
    return cached && Array.isArray(cached.articles) ? cached : null;
  } catch (error) { return null; }
}
function writeArticleCache(articles) {
  try { localStorage.setItem(articleCacheKey, JSON.stringify({ savedAt: Date.now(), articles })); }
  catch (error) { console.info('News cache is not available in this browser.'); }
}
async function loadArticles() {
  const cached = readArticleCache();
  if (cached?.articles.length && Date.now() - cached.savedAt < articleCacheDuration) {
    renderArticles(cached.articles);
    return;
  }
  try {
    const response = await fetch(`${articleIndexPath}?v=20261006`, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`News index request failed (${response.status})`);
    const articles = await response.json();
    if (!Array.isArray(articles)) throw new Error('News index is invalid');
    const sortedArticles = articles.sort((first, second) => new Date(second.date) - new Date(first.date));
    if (sortedArticles.length) {
      writeArticleCache(sortedArticles);
      renderArticles(sortedArticles);
    } else if (cached?.articles.length) renderArticles(cached.articles);
  } catch (error) {
    if (cached?.articles.length) renderArticles(cached.articles);
    console.info('News index is unavailable; showing cached or fallback stories.');
  }
}
renderArticles(fallbackArticles);
loadArticles();
