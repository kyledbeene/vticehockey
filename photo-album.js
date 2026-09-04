const root = location.pathname.includes('/photos/') ? '../../' : '';
const siteHeader = `<div class="topline"><div class="page-width top-line-inner"><span>EST. 1985</span><span>ACHA DIVISION II</span><span>BLACKSBURG, VIRGINIA</span></div></div><header class="site-header"><div class="page-width header-inner"><a class="brand" href="${root}index.html" aria-label="Virginia Tech Hockey home"><div class="crest"><span>VT</span><i></i></div><div class="brand-copy"><strong>VIRGINIA TECH</strong><span>CLUB HOCKEY</span></div></a><nav class="nav" aria-label="Main navigation"><a href="${root}index.html">Home</a><a href="${root}index.html#news">News</a><a href="${root}schedule.html">Schedule</a><a href="${root}index.html#scores">Scores</a><a href="${root}game-notes.html" style="white-space:nowrap">Game Notes</a><a class="active" href="${root}photos.html">Photos</a><div class="team-menu"><button type="button">Team <span>⌄</span></button><div class="team-dropdown"><a href="${root}roster.html">Roster</a><a href="${root}coaches.html">Coaches</a><a href="${root}off-ice-staff.html">Off-Ice Staff</a></div></div><a href="${root}index.html#stats">Stats</a><a class="watch-link" href="http://www.youtube.com/@VTHockey" target="_blank" rel="noopener noreferrer"><span class="play-dot">▶</span> Watch</a></nav></div></header>`;
const siteFooter = `<footer><div class="page-width footer-inner"><span class="footer-brand"><img src="${root}clubsports.png" alt="Virginia Tech Sport Clubs"><span>VIRGINIA TECH CLUB HOCKEY</span></span><span>GO HOKIES <b>◆</b></span></div></footer>`;

const albumNames = {'liberty-2025-09-12':'Liberty · Sep 12, 2025','tennessee-2025-09-26':'Tennessee · Sep 26, 2025','nc-state-2025-09-27':'NC State · Sep 27, 2025','unc-2025-10-03':'UNC · Oct 03, 2025','unc-2025-10-04':'UNC · Oct 04, 2025','liberty-2025-10-18':'Liberty · Oct 18, 2025','georgia-2025-11-21':'Georgia · Nov 21, 2025','rider-2025-12-05':'Rider · Dec 05, 2025','rider-2025-12-06':'Rider · Dec 06, 2025','high-point-2026-01-09':'High Point · Jan 09, 2026','high-point-2026-01-10':'High Point · Jan 10, 2026','wake-forest-2026-01-23':'Wake Forest · Jan 23, 2026','wake-forest-2026-01-24':'Wake Forest · Jan 24, 2026','towson-2026-01-30':'Towson · Jan 30, 2026'};
const album = new URLSearchParams(location.search).get('album');
if (albumNames[album]) { document.title = `${albumNames[album]} | Virginia Tech Hockey Photos`; document.querySelector('#album-title').innerHTML = `${albumNames[album].split(' · ')[0]} <em>PHOTOS.</em>`; }
document.querySelectorAll('.nav a').forEach(link => { if (link.textContent.trim() === 'News') link.href = `${root}news.html`; if (link.textContent.trim() === 'Scores') link.href = `${root}scores.html`; if (link.textContent.trim() === 'Stats') link.href = `${root}stats.html`; });

async function loadAlbumPhotos() {
	if (!album) return;
	try {
		const response = await fetch(`https://api.github.com/repos/kyledbeene/vticehockey/contents/photos/${encodeURIComponent(album)}`);
		if (!response.ok) throw new Error('Album unavailable');
		const files = await response.json();
		const images = files.filter(file => file.type === 'file' && /\.(jpe?g|png|gif|webp)$/i.test(file.name));
		const gallery = document.querySelector('.album-gallery');
		if (images.length) gallery.innerHTML = images.map((image, index) => `<img class="album-photo" src="${image.download_url}" alt="${albumNames[album] || album} photo ${index + 1}" loading="lazy">`).join('');
	} catch (error) { console.info('Album photos are not available yet; showing the empty album state.'); }
}
loadAlbumPhotos();

if (!document.querySelector('.site-header')) document.body.insertAdjacentHTML('afterbegin', siteHeader);
if (!document.querySelector('footer')) document.body.insertAdjacentHTML('beforeend', siteFooter);
const mobileNavigationScript = document.createElement('script');
mobileNavigationScript.src = `${root}mobile-nav.js`;
document.body.appendChild(mobileNavigationScript);