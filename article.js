const filename = new URLSearchParams(window.location.search).get('article');
function parseArticle(markdown, fallbackTitle = 'Virginia Tech Hockey') {
  const match = markdown.match(/^---\s*([\s\S]*?)\s*---/);
  const fields = {};
  if (match) match[1].split('\n').forEach(line => { const separator = line.indexOf(':'); if (separator > -1) fields[line.slice(0, separator).trim()] = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, ''); });
  const title = fields.title || (markdown.match(/^#\s+([^\n]+)/m) || [null, fallbackTitle])[1];
  const body = markdown.replace(/^---[\s\S]*?---/, '').replace(/^#\s+[^\n]+\s*/, '').replace(/^!\[[^\]]*\]\([^)]*\)\s*/m, '').trim();
  return {title, category: fields.category || 'NEWS', author: fields.author || '', date: fields.date || '', image: fields.image || '', body};
}
function setMeta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.append(element);
  }
  element.content = content;
}
function render(article) {
  document.title = `${article.title} | Virginia Tech Hockey`;
  const description = article.body.replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[#*_`>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 160);
  const canonicalUrl = new URL(window.location.href);
  canonicalUrl.search = '';
  canonicalUrl.searchParams.set('article', filename);
  const imageUrl = article.image ? new URL(article.image, window.location.href).href : 'https://virginiatechicehockey.com/photos/2026-09-26-liberty/DSC02296.jpg';
  setMeta('name', 'description', description);
  setMeta('property', 'og:title', document.title);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:type', 'article');
  setMeta('property', 'og:url', canonicalUrl.href);
  setMeta('property', 'og:image', imageUrl);
  setMeta('name', 'twitter:card', 'summary_large_image');
  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.append(canonical);
  }
  canonical.href = canonicalUrl.href;
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description,
    mainEntityOfPage: canonicalUrl.href,
    publisher: {
      '@type': 'Organization',
      name: 'Virginia Tech Club Hockey',
      url: 'https://virginiatechicehockey.com/'
    }
  };
  if (/^\d{4}-\d{2}-\d{2}$/.test(article.date)) structuredData.datePublished = article.date;
  if (article.author) structuredData.author = {'@type': 'Person', name: article.author};
  if (article.image) structuredData.image = imageUrl;
  let schema = document.head.querySelector('script[data-article-schema]');
  if (!schema) {
    schema = document.createElement('script');
    schema.type = 'application/ld+json';
    schema.dataset.articleSchema = '';
    document.head.append(schema);
  }
  schema.textContent = JSON.stringify(structuredData);
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
