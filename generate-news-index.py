import json
import re
from pathlib import Path
from urllib.parse import quote


ROOT = Path(__file__).resolve().parent
NEWS_DIRECTORY = ROOT / 'news'
OUTPUT_FILE = NEWS_DIRECTORY / 'news-index.json'


def parse_article(path):
    markdown = path.read_text(encoding='utf-8')
    match = re.match(r'^---\s*([\s\S]*?)\s*---', markdown)
    fields = {}
    if match:
        for line in match.group(1).splitlines():
            key, separator, value = line.partition(':')
            if separator:
                fields[key.strip()] = value.strip().strip('"\'')

    body = re.sub(r'^---[\s\S]*?---', '', markdown, count=1)
    body = re.sub(r'^#\s+[^\n]+', '', body, count=1).strip()
    body = re.sub(r'[*_`]', '', body)
    summary = fields.get('summary') or re.sub(r'\s+', ' ', body)[:170]

    return {
        'category': fields.get('category', 'NEWS'),
        'title': fields.get('title') or path.stem.replace('-', ' ').replace('_', ' '),
        'summary': summary,
        'author': fields.get('author', ''),
        'date': fields.get('date', ''),
        'image': fields.get('image', ''),
        'filename': path.name,
        'url': f'article.html?article={quote(path.name)}',
    }


articles = [parse_article(path) for path in NEWS_DIRECTORY.glob('*.md')]
articles.sort(key=lambda article: article['date'], reverse=True)
OUTPUT_FILE.write_text(json.dumps(articles, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'Wrote {len(articles)} articles to {OUTPUT_FILE.relative_to(ROOT)}')

# Keep sitemap.xml in step: add any article missing from it (existing entries are left alone).
SITEMAP_FILE = ROOT / 'sitemap.xml'
ARTICLE_URL = 'https://virginiatechicehockey.com/article.html?article={}'
sitemap = SITEMAP_FILE.read_text(encoding='utf-8')
missing = [a for a in articles if ARTICLE_URL.format(a['filename']) not in sitemap]
if missing:
    lines = ''.join(f"  <url><loc>{ARTICLE_URL.format(a['filename'])}</loc></url>\n" for a in missing)
    marker = '  <url><loc>' + ARTICLE_URL.format('')
    position = sitemap.find(marker)
    if position == -1:
        position = sitemap.rfind('</urlset>')
    SITEMAP_FILE.write_text(sitemap[:position] + lines + sitemap[position:], encoding='utf-8')
    print(f'Added {len(missing)} article(s) to sitemap.xml')
