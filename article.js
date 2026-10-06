const filename = new URLSearchParams(window.location.search).get('article');
function parseArticle(markdown, fallbackTitle = 'Virginia Tech Hockey') {
  const match = markdown.match(/^---\s*([\s\S]*?)\s*---/);
  const fields = {};
  if (match) match[1].split('\n').forEach(line => { const separator = line.indexOf(':'); if (separator > -1) fields[line.slice(0, separator).trim()] = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, ''); });
  const title = fields.title || (markdown.match(/^#\s+([^\n]+)/m) || [null, fallbackTitle])[1];
  const body = markdown.replace(/^---[\s\S]*?---/, '').replace(/^#\s+[^\n]+\s*/, '').replace(/^!\[[^\]]*\]\([^)]*\)\s*/m, '').trim();
  return {title, category: fields.category || 'NEWS', author: fields.author || '', date: fields.date || '', image: fields.image || '', body};
}
function render(article) {
  document.title = `${article.title} | Virginia Tech Hockey`;
  document.querySelector('#article-meta').textContent = `${article.category} · ${article.date}`;
  const author = document.querySelector('#article-author');
  author.hidden = !article.author;
  author.textContent = article.author ? `By ${article.author}` : '';
  document.querySelector('#article-title').textContent = article.title;
  document.querySelector('#article-body').innerHTML = article.body.split(/\n\s*\n/).filter(Boolean).map(block => block.startsWith('## ') ? `<h3>${block.slice(3)}</h3>` : `<p>${block.replace(/^[-*] /gm, '• ')}</p>`).join('');
  if (article.image) { const image = document.querySelector('#article-image'); image.src = article.image; image.alt = article.title; image.hidden = false; }
}
async function loadArticle() {
  try {
    if (!filename) throw new Error('Missing article filename');
    const response = await fetch(`https://raw.githubusercontent.com/kyledbeene/vticehockey/main/news/${encodeURIComponent(filename)}`);
    if (!response.ok) throw new Error('Article not found');
    render(parseArticle(await response.text(), filename.replace(/\.md$/i, '').replace(/[-_]/g, ' ')));
  } catch (error) {
    document.querySelector('#article-body').innerHTML = '<p class="article-loading">This article could not be loaded. Please try again later.</p>';
  }
}
loadArticle();
