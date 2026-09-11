const repository = 'kyledbeene/vticehockey';
const directory = 'photos';
const grid = document.querySelector('.photo-grid');
function titleFromFolder(folder) { return folder.replace(/^\d{4}-\d{2}-\d{2}-?/, '').replace(/[-_]/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase()); }
function dateFromFolder(folder) { const match = folder.match(/^(\d{4})-(\d{2})-(\d{2})/); return match ? new Date(`${match[1]}-${match[2]}-${match[3]}T12:00:00`).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'}).toUpperCase() : 'GAME PHOTOS'; }
function renderAlbums(albums) { grid.innerHTML = albums.map(album => `<a class="photo-folder" href="photo-album-index.html?album=${encodeURIComponent(album.name)}"><span class="folder-icon">▰</span><small>${dateFromFolder(album.name)}</small><h2>${titleFromFolder(album.name)}</h2><span class="folder-path">/photos/${album.name}</span></a>`).join(''); }

// Groups by hockey season (e.g. Jan 2026 belongs to the 2025-26 season, not calendar year 2026).
function seasonFromDate(year, month) {
  const startYear = month >= 7 ? Number(year) : Number(year) - 1;
  return `${startYear}-${String(startYear + 1).slice(-2)}`;
}

function populateYearFilter() {
  const select = document.querySelector('#photos-year-select');
  if (!select) return;
  const tiles = [...document.querySelectorAll('.photo-folder')];
  const seasons = new Set();
  tiles.forEach(tile => {
    const albumId = new URLSearchParams(tile.getAttribute('href').split('?')[1] || '').get('album') || '';
    const match = albumId.match(/(\d{4})-(\d{2})-\d{2}/);
    if (match) { const season = seasonFromDate(match[1], Number(match[2])); tile.dataset.season = season; seasons.add(season); }
  });
  const sortedSeasons = [...seasons].sort((first, second) => second.localeCompare(first));
  select.innerHTML = ['<option value="all">All Seasons</option>', ...sortedSeasons.map(season => `<option value="${season}">${season}</option>`)].join('');
  select.onchange = () => {
    tiles.forEach(tile => { tile.style.display = select.value === 'all' || tile.dataset.season === select.value ? '' : 'none'; });
  };
}

async function loadAlbums() {
  try {
    const response = await fetch(`https://api.github.com/repos/${repository}/contents/${directory}`);
    if (!response.ok) throw new Error('Photo folder unavailable');
    const files = await response.json();
    const albums = files.filter(file => file.type === 'dir').sort((first, second) => second.name.localeCompare(first.name));
    if (albums.length) renderAlbums(albums);
  } catch (error) { console.info('GitHub photo albums are not available yet; showing local albums.'); }
  populateYearFilter();
}
loadAlbums();
