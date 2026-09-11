const repository = 'kyledbeene/vticehockey';
const articleDirectory = 'news';
const fallbackArticles = [
  { category: 'GAME RECAP', title: 'Hokies close regular season with a statement win', summary: 'Virginia Tech finishes the regular season on home ice with a 5-2 win and plenty of momentum heading into the postseason.', number: '01' },
  { category: 'PREVIEW', title: 'Rivalry night is back under the lights', summary: 'The Hokies return to the ice for a high-energy weekend against Liberty.', number: '02' },
  { category: 'FEATURE', title: 'Inside the room: Built one shift at a time', summary: 'A closer look at the habits, friendships, and relentless work behind the team.', number: '03' },
  { category: 'PROGRAM', title: 'Hokies set the standard for a new season', summary: 'Preparation continues as the team sets its sights on another run in the ACCHL.', number: '04' },
  { category: 'COMMUNITY', title: 'Maroon and orange show up on home ice', summary: 'Hokie Nation brings the energy every time the team takes the ice.', number: '05' }
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
  return { category: fields.category || 'NEWS', title: fields.title || filename.replace(/\.md$/i, '').replace(/[-_]/g, ' '), summary: fields.summary || body.slice(0, 170), date: fields.date || '', image: fields.image || '', filename, url: `article.html?article=${encodeURIComponent(filename)}` };
}
function renderArticles(articles) {
  withViewTransition(() => {
    if (grid) grid.innerHTML = articles.map((article, index) => `<article class="news-card${index === 0 ? ' featured' : ''}">${article.image ? `<img class="news-card-image" src="${article.image}" alt="" />` : ''}<span class="card-number">${String(index + 1).padStart(2, '0')}</span><span class="card-tag">${article.category}</span><h2>${article.title}</h2><p>${article.summary}</p><a class="text-link" href="${article.url || `article.html?article=${encodeURIComponent(article.title)}`}">Read story <span>↗</span></a></article>`).join('');
  });
  window.dispatchEvent(new CustomEvent('news:updated', { detail: articles }));
}
async function loadGitHubArticles() {
  try {
    const rootResponse = await fetch(`https://api.github.com/repos/${repository}/contents`);
    if (!rootResponse.ok) return;
    const rootFiles = await rootResponse.json();
    if (!rootFiles.some(file => file.name === articleDirectory && file.type === 'dir')) return;
    const response = await fetch(`https://api.github.com/repos/${repository}/contents/${articleDirectory}`);
    if (!response.ok) return;
    const files = await response.json();
    const articles = await Promise.all(files.filter(file => file.name.toLowerCase().endsWith('.md')).map(async file => { const detail = await fetch(file.url).then(result => result.json()); const markdown = atob(detail.content.replace(/\n/g, '')); return parseFrontMatter(markdown, file.name); }));
    if (articles.length) renderArticles(articles.sort((first, second) => new Date(second.date) - new Date(first.date)));
  } catch (error) { console.info('GitHub news is not available yet; showing local cards.'); }
}
renderArticles(fallbackArticles);
loadGitHubArticles();
