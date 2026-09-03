const repository = 'kyledbeene/vticehockey';
const directory = 'photos';
const grid = document.querySelector('.photo-grid');
function titleFromFolder(folder) { return folder.replace(/^\d{4}-\d{2}-\d{2}-?/, '').replace(/[-_]/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase()); }
function dateFromFolder(folder) { const match = folder.match(/^(\d{4})-(\d{2})-(\d{2})/); return match ? new Date(`${match[1]}-${match[2]}-${match[3]}T12:00:00`).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'}).toUpperCase() : 'GAME PHOTOS'; }
function renderAlbums(albums) { grid.innerHTML = albums.map(album => `<a class="photo-folder" href="photo-album-index.html?album=${encodeURIComponent(album.name)}"><span class="folder-icon">▰</span><small>${dateFromFolder(album.name)}</small><h2>${titleFromFolder(album.name)}</h2><span class="folder-path">/photos/${album.name}</span></a>`).join(''); }
async function loadAlbums() {
  try {
    const response = await fetch(`https://api.github.com/repos/${repository}/contents/${directory}`);
    if (!response.ok) throw new Error('Photo folder unavailable');
    const files = await response.json();
    const albums = files.filter(file => file.type === 'dir').sort((first, second) => second.name.localeCompare(first.name));
    if (albums.length) renderAlbums(albums);
  } catch (error) { console.info('GitHub photo albums are not available yet; showing local albums.'); }
}
loadAlbums();
