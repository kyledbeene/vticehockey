const articles = [
  { title: 'Hokies close regular season with a statement win', body: 'Virginia Tech finishes the regular season on home ice with a 5–2 win and plenty of momentum heading into the postseason.', meta: 'FEB 18, 2025', tag: 'GAME RECAP' },
  { title: 'Rivalry night is back under the lights', body: 'The Hokies return to the ice for a high-energy weekend against Liberty. Bring the noise and wear maroon.', meta: 'FEB 11, 2025', tag: 'PREVIEW' },
  { title: 'Inside the room: Built one shift at a time', body: 'A closer look at the habits, friendships, and relentless work that make this group special beyond game day.', meta: 'FEB 04, 2025', tag: 'FEATURE' }
];
const title = document.querySelector('#article-title');
const body = document.querySelector('#article-body');
const meta = document.querySelector('.article-meta');
const tag = document.querySelector('.visual-tag');
const current = document.querySelector('#current-slide');
const progress = document.querySelector('.progress i');
const card = document.querySelector('.feature-card');
let active = 0;
let timer;
function showArticle(index) {
  active = (index + articles.length) % articles.length;
  const article = articles[active];
  card.style.opacity = '0.2';
  window.setTimeout(() => {
    title.textContent = article.title;
    body.textContent = article.body;
    meta.textContent = article.meta;
    tag.textContent = article.tag;
    current.textContent = String(active + 1).padStart(2, '0');
    progress.style.width = `${((active + 1) / articles.length) * 100}%`;
    card.style.opacity = '1';
  }, 160);
}
function restartTimer() { window.clearInterval(timer); timer = window.setInterval(() => showArticle(active + 1), 6500); }
document.querySelector('.next').addEventListener('click', () => { showArticle(active + 1); restartTimer(); });
document.querySelector('.prev').addEventListener('click', () => { showArticle(active - 1); restartTimer(); });
const menu = document.querySelector('.menu-toggle');
menu.addEventListener('click', () => { const nav = document.querySelector('.nav'); const open = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', open); });
document.querySelectorAll('.nav a').forEach(link => link.addEventListener('click', () => document.querySelector('.nav').classList.remove('open')));
restartTimer();
